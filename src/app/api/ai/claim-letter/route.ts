import { NextRequest, NextResponse } from "next/server";

const AIRLINE_EMAILS: Record<string, string> = {
  "ryanair": "customerqueries@ryanair.com",
  "vueling": "contactus@vueling.com",
  "iberia": "serviberia@iberia.es",
  "air france": "mail.informations@airfrance.fr",
  "lufthansa": "customer.relations@lufthansa.com",
  "easyjet": "customer.support@easyjet.com"
};

function guessAirlineEmail(name: string) {
  if (!name) return "";
  const key = name.toLowerCase();
  for (const k in AIRLINE_EMAILS) {
    if (key.includes(k)) return AIRLINE_EMAILS[k];
  }
  return "";
}

function clean(v:any){return typeof v==="string"?v.trim():""}

function normalize(input:any){
  const incident = input?.incident || {};
  const trip = input?.trip || {};
  const profile = input?.profile || {};

  const passengerName =
    clean(profile?.full_name) ||
    clean(profile?.name) ||
    clean(trip?.passenger_name);

  const passengerEmail =
    clean(profile?.email) ||
    clean(trip?.passenger_email);

  const airline =
    clean(incident?.airline) ||
    clean(trip?.airline);

  const airlineEmail = guessAirlineEmail(airline);

  return {
    passengerName,
    passengerEmail,
    airline,
    airlineEmail,
    flight: clean(trip?.flight_number),
    date: clean(trip?.date),
    airport: clean(trip?.destination),
    amount: incident?.claim_amount || 0,
    description: clean(incident?.description),
    bagCount: incident?.bag_count || 1
  };
}

function systemPrompt(){
return `
You are a professional legal travel-claims writer.

Write a HIGH-QUALITY compensation claim letter that sounds human, strong, and ready to send.

Rules:
- Use real names if available
- Never use "Passenger" if name exists
- Structure:
  1. Opening (formal)
  2. Incident summary
  3. Impact + inconvenience
  4. Compensation request
  5. Closing

- Make it persuasive, not robotic
- Do not repeat raw JSON
- Use clean paragraphs
`;
}

function userPrompt(data:any){
return `
Write a professional airline claim letter using this data:

Passenger: ${data.passengerName}
Airline: ${data.airline}
Flight: ${data.flight}
Date: ${data.date}
Airport: ${data.airport}
Issue: ${data.description}
Bags: ${data.bagCount}
Amount: $${data.amount}

Return only the letter.
`;
}

export async function POST(req:NextRequest){
  const body = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const data = normalize(body);

  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{
      "content-type":"application/json",
      "x-api-key":apiKey!,
      "anthropic-version":"2023-06-01"
    },
    body:JSON.stringify({
      model:"claude-sonnet-4-6",
      max_tokens:1200,
      temperature:0.4,
      system:systemPrompt(),
      messages:[{
        role:"user",
        content:userPrompt(data)
      }]
    })
  });

  const json = await res.json();
  const text = json?.content?.[0]?.text || "";

  return NextResponse.json({
    letter:text,
    airlineEmail:data.airlineEmail || "support@" + (data.airline || "airline") + ".com"
  });
}
