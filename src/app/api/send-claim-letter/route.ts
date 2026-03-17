import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function logEmailAttempt(input: {
  incident_id?: string | null;
  recipient_email: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  provider?: string;
  provider_message_id?: string | null;
  error_message?: string | null;
}) {
  try {
    await supabaseAdmin.from('claim_email_logs').insert({
      incident_id: input.incident_id ?? null,
      recipient_email: input.recipient_email,
      subject: input.subject,
      status: input.status,
      provider: input.provider || 'resend',
      provider_message_id: input.provider_message_id ?? null,
      error_message: input.error_message ?? null,
    });
  } catch (e) {
    console.error('[claim_email_logs] insert failed:', e);
  }
}

export async function POST(req: NextRequest) {
  let incidentId: string | null = null;
  let to = '';
  let subject = '';

  try {
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.CLAIMS_FROM_EMAIL;

    if (!resendKey || !from) {
      return NextResponse.json(
        { error: 'Missing RESEND_API_KEY or CLAIMS_FROM_EMAIL' },
        { status: 500 }
      );
    }

    const body = await req.json();
    to = body?.to || '';
    subject = body?.subject || '';
    const letter = body?.letter || '';
    const replyTo = body?.replyTo || undefined;
    incidentId = body?.incidentId || null;

    if (!to || !subject || !letter) {
      await logEmailAttempt({
        incident_id: incidentId,
        recipient_email: to || 'unknown',
        subject: subject || 'unknown',
        status: 'failed',
        error_message: 'Missing to, subject, or letter',
      });

      return NextResponse.json(
        { error: 'Missing to, subject, or letter' },
        { status: 400 }
      );
    }

    await logEmailAttempt({
      incident_id: incidentId,
      recipient_email: to,
      subject,
      status: 'pending',
    });

    const resend = new Resend(resendKey);

    const result = await resend.emails.send({
      from,
      to,
      subject,
      text: letter,
      replyTo,
    });

    const providerMessageId =
      (result as any)?.data?.id ||
      (result as any)?.id ||
      null;

    await logEmailAttempt({
      incident_id: incidentId,
      recipient_email: to,
      subject,
      status: 'sent',
      provider_message_id: providerMessageId,
    });

    return NextResponse.json({
      ok: true,
      result,
      providerMessageId,
    });
  } catch (error: any) {
    await logEmailAttempt({
      incident_id: incidentId,
      recipient_email: to || 'unknown',
      subject: subject || 'unknown',
      status: 'failed',
      error_message: error?.message || 'Email sending failed',
    });

    return NextResponse.json(
      { error: error?.message || 'Email sending failed' },
      { status: 500 }
    );
  }
}
