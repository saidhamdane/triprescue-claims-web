import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const { to, subject, letter, replyTo } = await req.json();

    if (!to || !subject || !letter) {
      return NextResponse.json(
        { error: 'Missing to, subject, or letter' },
        { status: 400 }
      );
    }

    const resend = new Resend(resendKey);

    const result = await resend.emails.send({
      from,
      to,
      subject,
      replyTo: replyTo || undefined,
      text: letter,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Email sending failed' },
      { status: 500 }
    );
  }
}
