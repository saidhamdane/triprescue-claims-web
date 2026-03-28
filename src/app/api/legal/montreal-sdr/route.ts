import { NextRequest, NextResponse } from "next/server";
import { getMontrealBaggageEstimate } from "../../../../lib/montreal-sdr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const result = await getMontrealBaggageEstimate({
      claimType: String(body?.claimType || ""),
      documentedLossEUR: Number(body?.documentedLossEUR || 0),
      specialDeclaration: Boolean(body?.specialDeclaration),
      declaredValueEUR: Number(body?.declaredValueEUR || 0),
      lang: String(body?.lang || "en"),
    });

    return NextResponse.json({
      ok: true,
      compensationEstimate: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to calculate Montreal SDR ceiling",
      },
      { status: 500 }
    );
  }
}
