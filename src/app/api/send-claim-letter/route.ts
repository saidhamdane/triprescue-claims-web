import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { getBillingAccessByEmail, canSendClaims } from '../../../lib/billing/access';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type IncomingFile = {
  id?: string | null;
  name?: string | null;
  url?: string | null;
  type?: string | null;
};

async function fileToAttachment(file: IncomingFile) {
  try {
    const url = String(file?.url || '').trim();
    if (!url) return null;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      filename: String(file?.name || 'attachment'),
      content: buffer.toString('base64'),
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: any = null;

  try {
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.CLAIMS_FROM_EMAIL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!resendKey || !from) {
      return NextResponse.json(
        { error: 'Missing RESEND_API_KEY or CLAIMS_FROM_EMAIL' },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      );
    }

    body = await req.json();
    const { to, subject, letter, replyTo, files, incidentId, tripId, userId, isCopy, previousStatus, customerEmail } = body || {};

    if (!to || !subject || !letter) {
      return NextResponse.json(
        { error: 'Missing to, subject, or letter' },
        { status: 400 }
      );
    }

    const billingEmail =
      customerEmail ||
      replyTo ||
      to ||
      null;

    const access = await getBillingAccessByEmail(billingEmail);
    if (!canSendClaims(access)) {
      return NextResponse.json(
        {
          error: 'Pro plan required to send claims by email',
          code: 'PLAN_UPGRADE_REQUIRED',
          plan: access.plan,
          status: access.status,
        },
        { status: 403 }
      );
    }

    const resend = new Resend(resendKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

    const safeFiles: IncomingFile[] = Array.isArray(files) ? files : [];

    const settled = await Promise.allSettled(
      safeFiles.map((file) => fileToAttachment(file))
    );

    const attachments = settled
      .filter(
        (
          item
        ): item is PromiseFulfilledResult<{ filename: string; content: string } | null> =>
          item.status === 'fulfilled'
      )
      .map((item) => item.value)
      .filter(
        (item): item is { filename: string; content: string } => item !== null
      );

    const failedAttachments = settled.filter(
      (item) => item.status === 'rejected'
    ).length;

    const result = await resend.emails.send({
      from,
      to,
      subject,
      text: letter,
      replyTo: replyTo || undefined,
      attachments,
    });

    await supabaseAdmin.from('claim_messages').insert({
      incident_id: incidentId,
      trip_id: tripId || null,
      user_id: userId || null,
      recipient_email: to,
      subject,
      letter_text: letter,
      attachments_count: attachments.length,
      is_copy: Boolean(isCopy),
      send_status: 'sent',
      provider: 'resend',
      provider_message_id: (result as any)?.data?.id || null,
      sent_at: new Date().toISOString(),
    });

    await supabaseAdmin.from('claim_status_history').insert({
      incident_id: incidentId,
      old_status: previousStatus || 'draft',
      new_status: 'sent',
      note: `Email sent to ${to}`,
      changed_by: userId || null,
    });

    await supabaseAdmin
      .from('incidents')
      .update({ claim_status: 'sent' })
      .eq('id', incidentId);

    return NextResponse.json({
      ok: true,
      attachmentsCount: attachments.length,
      failedAttachments,
      result,
    });
  } catch (error: any) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceRole && body?.incidentId) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

        await supabaseAdmin.from('claim_messages').insert({
          incident_id: body?.incidentId,
          trip_id: body?.tripId || null,
          user_id: body?.userId || null,
          recipient_email: body?.to || '',
          subject: body?.subject || '',
          letter_text: body?.letter || '',
          attachments_count: Array.isArray(body?.files) ? body.files.length : 0,
          is_copy: Boolean(body?.isCopy),
          send_status: 'failed',
          provider: 'resend',
          error_message: error?.message || 'Email sending failed',
        });

        await supabaseAdmin.from('claim_status_history').insert({
          incident_id: body?.incidentId,
          old_status: body?.previousStatus || 'draft',
          new_status: 'failed',
          note: error?.message || 'Email sending failed',
          changed_by: body?.userId || null,
        });

        await supabaseAdmin
          .from('incidents')
          .update({ claim_status: 'failed' })
          .eq('id', body?.incidentId);
      }
    } catch {}

    return NextResponse.json(
      { error: error?.message || 'Email sending failed' },
      { status: 500 }
    );
  }
}
