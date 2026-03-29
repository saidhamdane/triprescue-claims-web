import { NextRequest, NextResponse } from "next/server";
import { getMontrealBaggageEstimate, MONTREAL_SDR_ENGINE_VERSION } from "../../../../lib/montreal-sdr";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";


const fmtEuroValue = (value: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.round((Number(value) || 0) * 100) / 100);

const sanitizeMontrealEstimate = (estimate: any) => {
  if (!estimate || typeof estimate !== "object") return estimate;

  const ceilingSDR = Number(estimate?.ceilingSDR || 1519);
  let sdrToEur = Number(estimate?.sdrToEur || 0);
  let ceilingEUR = Number(estimate?.ceilingEUR || 0);
  const documentedLossEUR = Number(estimate?.documentedLossEUR || 0);

  const impliedPerSdr =
    ceilingSDR > 0 && ceilingEUR > 0 ? ceilingEUR / ceilingSDR : 0;

  // Emergency guard:
  // valid EUR per SDR should be a small number (~1-5), not hundreds/thousands.
  if (impliedPerSdr > 100 || sdrToEur > 100) {
    if (ceilingEUR > 0) ceilingEUR = ceilingEUR / 1000;
    if (sdrToEur > 0) sdrToEur = sdrToEur / 1000;
  }

  ceilingEUR = Math.round((Number(ceilingEUR) || 0) * 100) / 100;
  sdrToEur = Math.round((Number(sdrToEur) || 0) * 100000) / 100000;

  const amountEUR =
    documentedLossEUR > 0 && ceilingEUR > 0
      ? Math.round(Math.min(documentedLossEUR, ceilingEUR) * 100) / 100
      : Math.round((Number(estimate?.amountEUR) || 0) * 100) / 100;

  const reason =
    documentedLossEUR > 0 && ceilingEUR > 0
      ? `Your documented loss is ${fmtEuroValue(documentedLossEUR)}. Montreal ceiling today is ${fmtEuroValue(ceilingEUR)} (${ceilingSDR} SDR).`
      : ceilingEUR > 0
      ? `Montreal ceiling today is ${fmtEuroValue(ceilingEUR)} (${ceilingSDR} SDR).`
      : String(
          estimate?.reason ||
            "Montreal baggage claims depend on documented loss, damage, delay, and liability limits."
        );

  return {
    ...estimate,
    sdrToEur,
    ceilingEUR,
    amountEUR,
    rangeLabel:
      ceilingEUR > 0
        ? `Up to ${fmtEuroValue(ceilingEUR)} (${ceilingSDR} SDR)`
        : String(estimate?.rangeLabel || `Up to ${ceilingSDR} SDR`),
    reason,
  };
};



const formatEurHard = (value: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.round((Number(value) || 0) * 100) / 100);

const hardNormalizeMontrealEstimate = (estimate: any) => {
  if (!estimate || typeof estimate !== "object") return estimate;

  const ceilingSDR = Number(estimate?.ceilingSDR || 1519);
  const documentedLossEUR = Math.round((Number(estimate?.documentedLossEUR || 0)) * 100) / 100;

  let sdrToEur = Number(estimate?.sdrToEur || 0);
  let ceilingEUR = Number(estimate?.ceilingEUR || 0);

  // emergency guard against x1000 scaling
  if (sdrToEur > 100) sdrToEur = sdrToEur / 1000;
  if (ceilingEUR > 100000) ceilingEUR = ceilingEUR / 1000;

  // secondary guard using implied EUR/SDR
  const impliedPerSdr =
    ceilingSDR > 0 && ceilingEUR > 0 ? ceilingEUR / ceilingSDR : 0;

  if (impliedPerSdr > 100) {
    ceilingEUR = ceilingEUR / 1000;
  }

  sdrToEur = Math.round((Number(sdrToEur) || 0) * 100000) / 100000;
  ceilingEUR = Math.round((Number(ceilingEUR) || 0) * 100) / 100;

  const amountEUR =
    documentedLossEUR > 0 && ceilingEUR > 0
      ? Math.round(Math.min(documentedLossEUR, ceilingEUR) * 100) / 100
      : Math.round((Number(estimate?.amountEUR || 0)) * 100) / 100;

  const reason =
    documentedLossEUR > 0 && ceilingEUR > 0
      ? `Your documented loss is ${formatEurHard(documentedLossEUR)}. Montreal ceiling today is ${formatEurHard(ceilingEUR)} (${ceilingSDR} SDR).`
      : ceilingEUR > 0
      ? `Montreal ceiling today is ${formatEurHard(ceilingEUR)} (${ceilingSDR} SDR).`
      : String(
          estimate?.reason ||
            "Montreal baggage claims depend on documented loss, damage, delay, and liability limits."
        );

  return {
    ...estimate,
    sdrToEur,
    ceilingEUR,
    documentedLossEUR,
    amountEUR,
    rangeLabel:
      ceilingEUR > 0
        ? `Up to ${formatEurHard(ceilingEUR)} (${ceilingSDR} SDR)`
        : String(estimate?.rangeLabel || `Up to ${ceilingSDR} SDR`),
    reason,
  };
};


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const claimType = String(body?.claimType || body?.incidentType || "").trim();
    const documentedLossEUR = Number(body?.documentedLossEUR || 0);
    const declaredValueEUR = Number(body?.declaredValueEUR || 0);
    const specialDeclaration = Boolean(body?.specialDeclaration);
    const lang = String(body?.lang || "en");

    const rawCompensationEstimate = await getMontrealBaggageEstimate({
      claimType,
      documentedLossEUR,
      declaredValueEUR,
      specialDeclaration,
      lang,
    });

    const compensationEstimate = sanitizeMontrealEstimate(rawCompensationEstimate);

    return NextResponse.json(
      {
        ok: true,
        engineVersion: "ecb-basket-v4-forcefix",
        compensationEstimate: hardNormalizeMontrealEstimate(compensationEstimate),
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
