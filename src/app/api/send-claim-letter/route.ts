import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type IncomingFile = {
  id?: string | null;
  name?: string | null;
  url?: string | null;
  type?: string | null;
};

async function fileToAttachment(file: IncomingFile) {
  const url = String(file?.url || '').trim();
  if (!url) return null;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch attachment: ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    filename: String(file?.name || 'attachment'),
    content: buffer.toString('base64'),
  };
}

export async function POST(req: NextRequest) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.CLAIMS_FROM_EMAIL;

    if (!resendKey || !from) {
      return NextResponse.json(
        { error: 'Missing RESEND_API_KEY or CLAIMS_FROM_EMAIL' },
        { status: 500 }
      );
    }

    const { to, subject, letter, replyTo, files } = await req.json();

    if (!to || !subject || !letter) {
      return NextResponse.json(
        { error: 'Missing to, subject, or letter' },
        { status: 400 }
      );
    }

    const resend = new Resend(resendKey);
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

    return NextResponse.json({
      ok: true,
      attachmentsCount: attachments.length,
      failedAttachments,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Email sending failed' },
      { status: 500 }
    );
  }
}
