import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type AttachmentInput = {
  name?: string;
  fileName?: string;
  filename?: string;
  url?: string;
  file_url?: string;
  mimeType?: string;
  mime_type?: string;
  type?: string;
};

const resendApiKey = process.env.RESEND_API_KEY || "";
const fromEmail =
  process.env.CLAIMS_FROM_EMAIL ||
  process.env.RESEND_FROM_EMAIL ||
  "claims@triprescue.site";

const resend = new Resend(resendApiKey);

function safeFileName(name: string) {
  return name.replace(/[^\w.\-() ]+/g, "_").trim() || "attachment";
}

async function fetchAttachment(att: AttachmentInput) {
  const url = att.url || att.file_url;
  if (!url) return null;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download attachment: ${url}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const contentType =
    att.mimeType ||
    att.mime_type ||
    res.headers.get("content-type") ||
    "application/octet-stream";

  const rawName =
    att.name ||
    att.fileName ||
    att.filename ||
    url.split("/").pop() ||
    "attachment";

  const filename = safeFileName(rawName);

  return {
    filename,
    content: Buffer.from(arrayBuffer).toString("base64"),
    type: contentType,
    disposition: "attachment" as const,
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const to = String(body?.to || "").trim();
    const subject = String(body?.subject || "Travel claim").trim();
    const letter = String(body?.letter || "").trim();
    const replyTo = String(body?.replyTo || "").trim();
    const attachmentsInput: AttachmentInput[] = Array.isArray(body?.attachments)
      ? body.attachments
      : [];

    if (!to) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
    }

    if (!letter) {
      return NextResponse.json({ error: "Letter content is required" }, { status: 400 });
    }

    const attachments = [];
    for (const att of attachmentsInput.slice(0, 10)) {
      try {
        const file = await fetchAttachment(att);
        if (file) attachments.push(file);
      } catch (e: any) {
        console.error("Attachment error:", e?.message || e);
      }
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; white-space: pre-wrap;">
${letter
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")}
      </div>
    `;

    const result = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      text: letter,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments.length ? { attachments } : {}),
    });

    return NextResponse.json({
      ok: true,
      id: result.data?.id || null,
      attachmentsSent: attachments.length,
    });
  } catch (error: any) {
    console.error("send-email route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
