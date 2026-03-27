import { NextRequest, NextResponse } from "next/server";
import { getEuFlightLegalBasis } from "../../../../lib/eu-flight-legal";
import { estimateCompensation } from "../../../../lib/eu-flight-compensation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incidentType = String(body?.incidentType || "");
    const lang = body?.lang || "en";
    const distanceKm = body?.distanceKm ?? null;
    const delayHours = body?.delayHours ?? null;

    const result = getEuFlightLegalBasis({ incidentType, lang });
    const estimate = estimateCompensation({ incidentType, distanceKm, delayHours, lang });

    return NextResponse.json({
      ok: true,
      legalBasis: result,
      compensationEstimate: estimate,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to resolve legal basis",
      },
      { status: 500 }
    );
  }
}
