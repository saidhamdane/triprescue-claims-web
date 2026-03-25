import { NextRequest, NextResponse } from "next/server";

const AIRLINE_EMAILS: Record<string, string> = {
  ryanair: "customerqueries@ryanair.com",
  vueling: "contactus@vueling.com",
  iberia: "serviberia@iberia.es",
  lufthansa: "customer.relations@lufthansa.com",
  easyjet: "customer.support@easyjet.com",
  "air france": "mail.informations@airfrance.fr",
};

function clean(v: any) {
  return typeof v === "string" ? v.trim() : "";
}
function first(...vals: any[]) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}
function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function guessAirlineEmail(name: string) {
  const x = clean(name).toLowerCase();
  for (const k in AIRLINE_EMAILS) {
    if (x.includes(k)) return AIRLINE_EMAILS[k];
  }
  return "";
}
function sanitizeLetter(text: string, fallbackName: string) {
  let t = String(text || "").trim();

  // remove markdown bold
  t = t.replace(/\*\*(.*?)\*\*/g, "$1");

  // remove obvious placeholders
  t = t.replace(/\[Your Address\]\s*/gi, "");
  t = t.replace(/\[City, Postcode\]\s*/gi, "");
  t = t.replace(/\[Email Address\]\s*/gi, "");
  t = t.replace(/\[Phone Number\]\s*/gi, "");

  // normalize passenger placeholder
  if (fallbackName) {
    t = t.replace(/\bPassenger\b/g, fallbackName);
  }

  // collapse excessive blank lines
  t = t.replace(/\n{3,}/g, "\n\n").trim();

  return t;
}

function normalize(input: any) {
  const incident = input?.incident || {};
  const trip = input?.trip || {};
  const profile = input?.profile || {};
  const expenses = Array.isArray(input?.expenses) ? input.expenses : [];
  const documents = Array.isArray(input?.documents) ? input.documents : [];

  const passengerName = first(
    profile?.full_name,
    profile?.name,
    incident?.passenger_name,
    trip?.passenger_name
  );

  const passengerEmail = first(
    profile?.email,
    incident?.passenger_email,
    trip?.passenger_email
  );

  const passengerPhone = first(
    profile?.phone,
    incident?.passenger_phone,
    trip?.passenger_phone
  );

  const airline = first(incident?.airline, trip?.airline);
  const flightNumber = first(incident?.flight_number, trip?.flight_number);
  const bookingRef = first(incident?.booking_ref, trip?.booking_ref);
  const pirNumber = first(incident?.pir_number, incident?.reference_number);
  const incidentDate = first(
    incident?.incident_date,
    incident?.date_reported,
    trip?.date,
    trip?.start_date
  );
  const airportLocation = first(
    incident?.airport_location,
    incident?.location,
    trip?.destination,
    trip?.city
  );

  const claimAmount =
    num(incident?.claim_amount) ||
    num(incident?.estimated_value) ||
    expenses.reduce((s: number, e: any) => s + num(e?.amount), 0);

  return {
    language: clean(input?.language) || "en",
    tone: clean(input?.tone) || "standard",
    passengerName,
    passengerEmail,
    passengerPhone,
    airline,
    airlineEmail: guessAirlineEmail(airline),
    flightNumber,
    bookingRef,
    pirNumber,
    incidentDate,
    airportLocation,
    incidentType: first(incident?.type, incident?.title, "travel claim"),
    bagCount: incident?.bag_count || "",
    description: first(incident?.description, incident?.details, incident?.notes),
    claimAmount,
    expenses: expenses.map((e: any) => ({
      category: clean(e?.category),
      description: clean(e?.description),
      amount: num(e?.amount),
      currency: clean(e?.currency || "USD"),
    })),
    documents: documents.map((d: any) => ({
      name: clean(d?.name || d?.file_name),
      type: clean(d?.type),
      status: clean(d?.status),
    })),
  };
}

function systemPrompt() {
  return `
You are a premium multilingual travel-claims writer.

Write one final compensation claim letter using only the provided facts.

Critical rules:
- Output plain text only.
- No markdown.
- No bullet points.
- No placeholders like [Your Address] or [Phone Number].
- If the passenger name exists, use it in the closing.
- If a field is missing, omit it naturally.
- Make the letter persuasive, professional, and ready to send.
- Keep it realistic and human.
- Do not invent legal claims beyond the provided travel-claim context.
- Mention supporting receipts/documents only if expenses or documents are present.
`.trim();
}

function userPrompt(d: any) {
  return `
Language: ${d.language}
Tone: ${d.tone}

Passenger name: ${d.passengerName}
Passenger email: ${d.passengerEmail}
Passenger phone: ${d.passengerPhone}

Airline: ${d.airline}
Airline email: ${d.airlineEmail}
Flight number: ${d.flightNumber}
Booking reference: ${d.bookingRef}
PIR/reference: ${d.pirNumber}
Date: ${d.incidentDate}
Airport/location: ${d.airportLocation}

Incident type: ${d.incidentType}
Description: ${d.description}
Bag count: ${d.bagCount}
Claim amount: ${d.claimAmount}

Expenses JSON:
${JSON.stringify(d.expenses)}

Documents JSON:
${JSON.stringify(d.documents)}

Write the final letter now.
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const data = normalize(body);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 1200,
        temperature: 0.35,
        system: systemPrompt(),
        messages: [
          {
            role: "user",
            content: userPrompt(data),
          },
        ],
      }),
    });

    const raw = await res.text();
    const json = JSON.parse(raw);
    const text = json?.content?.[0]?.text || "";
    const letter = sanitizeLetter(text, data.passengerName);

    return NextResponse.json({
      letter,
      airlineEmail: data.airlineEmail || "",
      passengerEmail: data.passengerEmail || "",
      passengerName: data.passengerName || "",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
