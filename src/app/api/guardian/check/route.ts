import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.GUARDIAN_CRON_SECRET || "";
const AERO_KEY = process.env.AERODATABOX_API_KEY || "";

function getEu261Amount(km: number | null) {
  if (!km) return 250;
  if (km <= 1500) return 250;
  if (km <= 3500) return 400;
  return 600;
}

async function fetchFlightStatus(fn: string, date: string) {
  if (!AERO_KEY) {
    console.log("[guardian] No AERO_KEY found");
    return null;
  }
  try {
    const url = `https://aerodatabox.p.rapidapi.com/flights/number/${fn}/${date}`;
    console.log("[guardian] Fetching:", url);
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
        "x-rapidapi-key": AERO_KEY,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.log("[guardian] AeroDataBox status:", res.status);
      return null;
    }
    const data = await res.json();
    const f = Array.isArray(data) ? data[0] : data;
    if (!f) return null;

    const sArr = f.arrival?.scheduledTime?.utc;
    const aArr = f.arrival?.revisedTime?.utc || f.arrival?.actualTime?.utc;
    const sDep = f.departure?.scheduledTime?.utc;
    const aDep = f.departure?.revisedTime?.utc || f.departure?.actualTime?.utc;

    let delay = 0;
    if (aArr && sArr) {
      delay = Math.max(0, Math.round((new Date(aArr).getTime() - new Date(sArr).getTime()) / 60000));
    } else if (aDep && sDep) {
      delay = Math.max(0, Math.round((new Date(aDep).getTime() - new Date(sDep).getTime()) / 60000));
    }

    const status = (f.status || "").toLowerCase();
    return {
      delayMinutes: delay,
      cancelled: status.includes("cancel"),
      scheduledDep: sDep, actualDep: aDep,
      scheduledArr: sArr, actualArr: aArr,
    };
  } catch (err) {
    console.error("[guardian] fetch error:", err);
    return null;
  }
}

async function sendPush(token: string, title: string, body: string, data?: object) {
  if (!token?.startsWith("ExponentPushToken")) return;
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: token, title, body, data, sound: "default" }),
    });
  } catch {}
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Debug info
  const debug = {
    hasAeroKey: !!AERO_KEY,
    aeroKeyLength: AERO_KEY.length,
    hasSupabase: !!SUPABASE_URL,
  };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const { data: watches } = await supabase
    .from("flight_watches")
    .select("*")
    .in("status", ["watching", "delayed"])
    .gte("flight_date", today)
    .lte("flight_date", tomorrow);

  const results = [];

  for (const w of watches ?? []) {
    const fi = await fetchFlightStatus(w.flight_number, w.flight_date);

    if (!fi) {
      results.push({ id: w.id, flight: w.flight_number, skipped: true, reason: !AERO_KEY ? "no_api_key" : "no_data" });
      continue;
    }

    const updates: any = {
      delay_minutes: fi.delayMinutes,
      last_checked_at: new Date().toISOString(),
    };

    let notify = false, title = "", body = "";

    if (fi.cancelled) {
      const amt = getEu261Amount(null);
      Object.assign(updates, { status: "eligible", compensation_eligible: true, compensation_amount_eur: amt, compensation_reason: "Flight cancelled. EU261 applies." });
      notify = true; title = `✈️ Flight Cancelled — You May Get €${amt}`; body = `${w.flight_number} was cancelled. File your claim now.`;
    } else if (fi.delayMinutes >= 180 && w.status !== "notified") {
      const amt = getEu261Amount(null);
      Object.assign(updates, { status: "eligible", compensation_eligible: true, compensation_amount_eur: amt, compensation_reason: `Delayed ${fi.delayMinutes} min. EU261 applies.` });
      notify = true; title = `⏰ ${fi.delayMinutes}min delay — You May Get €${amt}`; body = `${w.flight_number} is delayed. Tap to file your claim.`;
    } else if (fi.delayMinutes >= 60) {
      updates.status = "delayed";
      if ((w.delay_minutes || 0) < 60) {
        notify = true; title = `⚠️ ${w.flight_number} delayed ${fi.delayMinutes}min`; body = `${180 - fi.delayMinutes} more minutes = EU261 compensation.`;
      }
    }

    if (notify) updates.notified_at = new Date().toISOString();
    await supabase.from("flight_watches").update(updates).eq("id", w.id);
    if (notify && w.push_token) await sendPush(w.push_token, title, body, { watchId: w.id, amount: updates.compensation_amount_eur });

    results.push({ id: w.id, flight: w.flight_number, delay: fi.delayMinutes, status: updates.status || w.status, notified: notify });
  }

  return NextResponse.json({ ok: true, checked: results.length, results, debug, ts: new Date().toISOString() });
}
