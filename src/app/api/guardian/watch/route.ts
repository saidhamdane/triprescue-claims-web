import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const session = { user };
    const body = await req.json();
    const { flight_number, flight_date, departure_airport, arrival_airport, airline, incident_id, trip_id, push_token } = body;
    if (!flight_number || !flight_date) return NextResponse.json({ error: "flight_number and flight_date required" }, { status: 400 });
    const { data, error } = await supabase.from("flight_watches").upsert({
      user_id: session.user.id,
      flight_number: flight_number.toUpperCase().trim(),
      flight_date, departure_airport, arrival_airport, airline,
      incident_id: incident_id || null, trip_id: trip_id || null,
      push_token: push_token || null, status: "watching",
    }, { onConflict: "user_id,flight_number,flight_date" }).select().single();
    if (error) { console.error("[guardian/watch]", error); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
    return NextResponse.json({ ok: true, watch: data });
  } catch (err) { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
