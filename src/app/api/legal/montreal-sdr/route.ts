import { NextRequest, NextResponse } from "next/server";
import { getMontrealBaggageEstimate, MONTREAL_SDR_ENGINE_VERSION } from "../../../../lib/montreal-sdr";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const claimType = String(body?.claimType || body?.incidentType || "").trim();
    const documentedLossEUR = Number(body?.documentedLossEUR || 0);
    const declaredValueEUR = Number(body?.declaredValueEUR || 0);
    const specialDeclaration = Boolean(body?.specialDeclaration);
    const lang = String(body?.lang || "en");

    const compensationEstimate = await getMontrealBaggageEstimate({
      claimType,
      documentedLossEUR,
      declaredValueEUR,
      specialDeclaration,
      lang,
    });

    return NextResponse.json(
      {
        ok: true,
        engineVersion: MONTREAL_SDR_ENGINE_VERSION,
        compensationEstimate,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        engineVersion: MONTREAL_SDR_ENGINE_VERSION,
        error: error?.message || "Failed to resolve Montreal baggage estimate",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
