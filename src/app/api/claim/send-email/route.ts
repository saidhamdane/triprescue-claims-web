import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const to = String(body?.to || "").trim();
    const subject = String(body?.subject || "Travel claim").trim();
    const letter = String(body?.letter || "").trim();
    const attachments = Array.isArray(body?.attachments) ? body.attachments : [];

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    if (!to) {
      return NextResponse.json({ error: "Missing recipient" }, { status: 400 });
    }

    if (!letter) {
      return NextResponse.json({ error: "Missing letter" }, { status: 400 });
    }

    const builtAttachments = [];

    for (const item of attachments.slice(0, 10)) {
      try {
        const url = item?.url || item?.file_url;
        if (!url) continue;

        const res = await fetch(url);
        if (!res.ok) continue;

        const ab = await res.arrayBuffer();
        const filename =
          item?.name ||
          item?.fileName ||
          item?.filename ||
          url.split("/").pop() ||
          "attachment";

        builtAttachments.push({
          filename,
          content: Buffer.from(ab).toString("base64"),
        });
      } catch {}
    }

    const from =
      process.env.CLAIMS_FROM_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      "claims@triprescue.site";

    const sent = await resend.emails.send({
      from,
      to: [to],
      subject,
      text: letter,
      html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;">${letter
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</div>`,
      attachments: builtAttachments,
    });

    return NextResponse.json({
      ok: true,
      id: sent.data?.id || null,
      attachmentsSent: builtAttachments.length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
