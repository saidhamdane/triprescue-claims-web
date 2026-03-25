import { NextRequest, NextResponse } from "next/server";

type ClaimPayload = {
  language?: "en" | "ar" | "es";
  tone?: "short" | "standard" | "legal";
  incident?: any;
  trip?: any;
  profile?: any;
  expenses?: any[];
  documents?: any[];
};

function safeStr(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

function firstNonEmpty(...vals: any[]) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function numberOrEmpty(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
}

function normalizeInput(input: ClaimPayload) {
  const incident = input?.incident || {};
  const trip = input?.trip || {};
  const profile = input?.profile || {};
  const expenses = Array.isArray(input?.expenses) ? input!.expenses! : [];
  const documents = Array.isArray(input?.documents) ? input!.documents! : [];

  const passengerName = firstNonEmpty(
    incident?.passenger_name,
    trip?.passenger_name,
    profile?.full_name,
    profile?.name
  );

  const passengerEmail = firstNonEmpty(
    incident?.passenger_email,
    trip?.passenger_email,
    profile?.email
  );

  const passengerPhone = firstNonEmpty(
    incident?.passenger_phone,
    trip?.passenger_phone,
    profile?.phone
  );

  const airline = firstNonEmpty(incident?.airline, trip?.airline);
  const flightNumber = firstNonEmpty(incident?.flight_number, trip?.flight_number);
  const bookingRef = firstNonEmpty(incident?.booking_ref, trip?.booking_ref);
  const pirNumber = firstNonEmpty(incident?.pir_number, incident?.reference_number);
  const incidentDate = firstNonEmpty(
    incident?.incident_date,
    incident?.date_reported,
    trip?.start_date
  );
  const airportLocation = firstNonEmpty(
    incident?.airport_location,
    incident?.location,
    trip?.destination,
    trip?.city
  );
  const claimAmount =
    numberOrEmpty(incident?.claim_amount) ||
    numberOrEmpty(incident?.estimated_value) ||
    0;

  const incidentType = firstNonEmpty(
    incident?.type,
    incident?.title,
    "travel claim"
  );

  const description = firstNonEmpty(
    incident?.description,
    incident?.details,
    incident?.notes,
    "Travel disruption incident."
  );

  const bagCount = incident?.bag_count ?? "";
  const origin = firstNonEmpty(trip?.origin, trip?.departure);
  const destination = firstNonEmpty(trip?.destination, trip?.city);

  const normalizedExpenses = expenses.map((e: any) => ({
    category: safeStr(e?.category),
    description: safeStr(e?.description),
    amount: numberOrEmpty(e?.amount) || "",
    currency: safeStr(e?.currency || "USD"),
  }));

  const normalizedDocs = documents.map((d: any) => ({
    name: safeStr(d?.name || d?.file_name),
    type: safeStr(d?.type),
    status: safeStr(d?.status),
  }));

  return {
    language: input?.language || "en",
    tone: input?.tone || "standard",
    passenger: {
      name: passengerName,
      email: passengerEmail,
      phone: passengerPhone,
    },
    trip: {
      airline,
      flightNumber,
      bookingRef,
      origin,
      destination,
      date: incidentDate,
      airportLocation,
    },
    incident: {
      id: incident?.id || "",
      type: incidentType,
      description,
      bagCount,
      pirNumber,
      claimAmount,
    },
    expenses: normalizedExpenses,
    documents: normalizedDocs,
  };
}

function buildSystemPrompt() {
  return `
You are an elite multilingual travel-claims writer for a premium consumer app.

Write a polished, realistic, high-quality compensation claim letter using the provided structured data.

Rules:
- Output plain text only.
- Do not use markdown.
- Do not invent facts.
- If some fields are missing, simply omit them naturally.
- The letter must feel professional, human, confident, and ready to send.
- Use clean paragraphs and a strong structure.
- Never call the passenger "Passenger" if a real name exists.
- If no passenger name exists, use "Dear Claims Department" and end with "Sincerely".
- Mention airline, flight number, date, booking reference, PIR, airport/location, and amount when available.
- If expenses exist, mention them naturally as supporting losses.
- If documents exist, mention that supporting documents/evidence are available.
- Avoid robotic wording.
- The final text should read like a premium travel-claims assistant wrote it.

Language behavior:
- en => polished international English
- ar => polished professional Arabic
- es => polished professional Spanish

Tone behavior:
- short => concise but professional
- standard => balanced, professional, persuasive
- legal => firmer, more formal, still readable and practical
`.trim();
}

function buildUserPrompt(input: ReturnType<typeof normalizeInput>) {
  return `
Write one final claim letter from this JSON.
Return only the letter.

JSON:
${JSON.stringify(input, null, 2)}
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ClaimPayload;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
    const normalized = normalizeInput(body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1800,
        temperature: 0.35,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: buildUserPrompt(normalized),
          },
        ],
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: raw || "Anthropic request failed" },
        { status: response.status || 500 }
      );
    }

    const json = JSON.parse(raw);
    const letter =
      json?.content?.find?.((x: any) => x?.type === "text")?.text ||
      json?.content?.[0]?.text ||
      "";

    return NextResponse.json({
      ok: true,
      model,
      letter: String(letter || "").trim(),
      normalized,
      usage: json?.usage ?? null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
