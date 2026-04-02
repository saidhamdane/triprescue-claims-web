import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


// Airport coordinates (IATA → [lat, lon])
const AIRPORTS: Record<string, [number, number]> = {
  MAD:[40.4936,-3.5668], BCN:[41.2974,2.0833], LHR:[51.4775,-0.4614],
  CDG:[49.0097,2.5478], AMS:[52.3086,4.7639], FCO:[41.8003,12.2389],
  MXP:[45.6306,8.7281], MUC:[48.3537,11.7750], FRA:[50.0379,8.5622],
  JFK:[40.6413,-73.7781], EWR:[40.6895,-74.1745], LAX:[33.9425,-118.4081],
  DXB:[25.2532,55.3657], DOH:[25.2731,51.6080], IST:[41.2753,28.7519],
  CMN:[33.3675,-7.5899], ORY:[48.7233,2.3794], LGW:[51.1537,-0.1821],
  PMI:[39.5517,2.7388], AGP:[36.6749,-4.4991], ALC:[38.2822,-0.5582],
  VLC:[39.4893,-0.4816], SVQ:[37.4180,-5.8931], BIO:[43.3010,-2.9106],
  TFN:[28.4827,-16.3416], LPA:[27.9319,-15.3866], IBZ:[38.8729,1.3731],
  CAI:[30.1219,31.4056], TUN:[36.8510,10.2272], ALG:[36.6910,3.2154],
};

function haversineKm(a: [number,number], b: [number,number]): number {
  const R = 6371;
  const dLat = (b[0]-a[0]) * Math.PI/180;
  const dLon = (b[1]-a[1]) * Math.PI/180;
  const x = Math.sin(dLat/2)**2 +
    Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(x)));
}

function calcDistance(dep?: string|null, arr?: string|null): number|null {
  if (!dep || !arr) return null;
  const a = AIRPORTS[dep.toUpperCase()];
  const b = AIRPORTS[arr.toUpperCase()];
  if (!a || !b) return null;
  return haversineKm(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get token from Authorization header
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.replace("Bearer ", "").trim();

    if (!token) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    // Verify user
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = await req.json();
    const { flight_number, flight_date, departure_airport, arrival_airport, airline, incident_id, trip_id, push_token } = body;

    if (!flight_number || !flight_date) {
      return NextResponse.json({ error: "flight_number and flight_date required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("flight_watches")
      .upsert({
        user_id: user.id,
        flight_number: flight_number.toUpperCase().trim(),
        flight_date,
        departure_airport: departure_airport || null,
        arrival_airport: arrival_airport || null,
        airline: airline || null,
        incident_id: incident_id || null,
        trip_id: trip_id || null,
        push_token: push_token || null,
        status: "watching",
      distance_km: calcDistance(departure_airport, arrival_airport),
      }, { onConflict: "user_id,flight_number,flight_date" })
      .select()
      .single();

    if (error) {
      console.error("[guardian/watch] DB error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, watch: data });
  } catch (err: any) {
    console.error("[guardian/watch]", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
