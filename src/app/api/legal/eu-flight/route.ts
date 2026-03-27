import { NextRequest, NextResponse } from "next/server";
import { getEuFlightLegalBasis } from "../../../../lib/eu-flight-legal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incidentType = String(body?.incidentType || "");
    const lang = body?.lang || "en";

    const result = getEuFlightLegalBasis({ incidentType, lang });

    return NextResponse.json({
      ok: true,
      legalBasis: result,
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
