export const MONTREAL_BAGGAGE_CAP_SDR = 1519;
export const MONTREAL_SDR_ENGINE_VERSION = "ecb-basket-v3";

const SDR_BASKET = {
  USD: 0.58448,
  EUR: 0.37090,
  CNY: 1.0962,
  JPY: 13.276,
  GBP: 0.079849,
} as const;

const fmtEUR = (value: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.round((Number(value) || 0) * 100) / 100);

const ECB_BASE = "https://data-api.ecb.europa.eu/service/data/EXR";

type MontrealInput = {
  claimType?: string;
  documentedLossEUR?: number;
  specialDeclaration?: boolean;
  declaredValueEUR?: number;
  lang?: string;
};

export type MontrealEstimate = {
  category: string;
  legalModel: string;
  ceilingSDR: number;
  sdrToEur: number;
  ceilingEUR: number;
  documentedLossEUR: number;
  amountEUR: number;
  rangeLabel: string;
  eligible: boolean;
  reason: string;
  sourceDate?: string;
  sourceUrl: string;
  fallbackUsed?: boolean;
  debugError?: string;
  engineVersion?: string;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function fmtEUR(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

async function fetchEcbRateToEur(currency: "USD" | "CNY" | "JPY" | "GBP") {
  const url = `${ECB_BASE}/D.${currency}.EUR.SP00.A?lastNObservations=1&detail=dataonly&format=csvdata`;

  const res = await fetch(url, {
    headers: {
      accept: "text/csv,*/*",
      "user-agent": "Mozilla/5.0 TripRescue/1.0",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`ECB_${currency}_STATUS:${res.status}`);
  }

  const body = (await res.text()).replace(/\r/g, "");
  const dateMatch = body.match(/(\d{4}-\d{2}-\d{2})/);

  if (!dateMatch) {
    throw new Error(`ECB_${currency}_NO_DATE:${body.slice(0, 220)}`);
  }

  const sourceDate = dateMatch[1];
  const afterDate = body.slice(body.indexOf(sourceDate) + sourceDate.length);

  let value: number | null = null;

  let m = afterDate.match(/^\s*,\s*([0-9]+(?:[.,][0-9]+)?)/);
  if (m) {
    value = Number(m[1].replace(",", "."));
  }

  if (!Number.isFinite(value as number)) {
    m = afterDate.match(/^\s*,\s*([0-9]+)\s*,\s*([0-9]{2,6})(?:\s*,|\s*$)/);
    if (m) {
      value = Number(`${m[1]}.${m[2]}`);
    }
  }

  if (!Number.isFinite(value as number) || (value as number) <= 0) {
    throw new Error(`ECB_${currency}_PARSE:${body.slice(0, 220)}`);
  }

  return {
    value: value as number,
    date: sourceDate,
    url,
  };
}

async function getLiveSdrToEur() {
  const [usd, cny, jpy, gbp] = await Promise.all([
    fetchEcbRateToEur("USD"),
    fetchEcbRateToEur("CNY"),
    fetchEcbRateToEur("JPY"),
    fetchEcbRateToEur("GBP"),
  ]);

  const sdrToEur = round2(
    SDR_BASKET.USD * usd.value +
    SDR_BASKET.EUR * 1 +
    SDR_BASKET.CNY * cny.value +
    SDR_BASKET.JPY * jpy.value +
    SDR_BASKET.GBP * gbp.value
  );

  return {
    sdrToEur,
    sourceDate: usd.date || cny.date || jpy.date || gbp.date,
    sourceUrl: [usd.url, cny.url, jpy.url, gbp.url].join(" | "),
  };
}

export async function getMontrealBaggageEstimate(
  input: MontrealInput = {}
): Promise<MontrealEstimate> {
  const documentedLossEUR = round2(Number(input.documentedLossEUR || 0));
  const declaredValueEUR = round2(Number(input.declaredValueEUR || 0));
  const specialDeclaration = Boolean(input.specialDeclaration);

  try {
    const live = await getLiveSdrToEur();

    const baseCeilingEUR = round2(MONTREAL_BAGGAGE_CAP_SDR * live.sdrToEur);
    const effectiveCeilingEUR =
      specialDeclaration && declaredValueEUR > 0
        ? Math.max(baseCeilingEUR, declaredValueEUR)
        : baseCeilingEUR;

    const likelyRecoverableEUR =
      documentedLossEUR > 0
        ? round2(Math.min(documentedLossEUR, effectiveCeilingEUR))
        : effectiveCeilingEUR;

    return {
      category: "baggage",
      legalModel: "mc99",
      ceilingSDR: MONTREAL_BAGGAGE_CAP_SDR,
      sdrToEur: live.sdrToEur,
      ceilingEUR: effectiveCeilingEUR,
      documentedLossEUR,
      amountEUR: likelyRecoverableEUR,
      rangeLabel: `Up to ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR)`,
      eligible: true,
      reason:
        documentedLossEUR > 0
          ? `Your documented loss is ${fmtEUR(documentedLossEUR)}. Montreal ceiling today is ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR).`
          : `Montreal ceiling today is ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR).`,
      sourceDate: live.sourceDate,
      sourceUrl: live.sourceUrl,
      fallbackUsed: false,
      engineVersion: MONTREAL_SDR_ENGINE_VERSION,
    };
  } catch (err: any) {
    const amountEUR = documentedLossEUR > 0 ? documentedLossEUR : 0;

    return {
      category: "baggage",
      legalModel: "mc99",
      ceilingSDR: MONTREAL_BAGGAGE_CAP_SDR,
      sdrToEur: 0,
      ceilingEUR: 0,
      documentedLossEUR,
      amountEUR,
      rangeLabel: `Up to ${MONTREAL_BAGGAGE_CAP_SDR} SDR`,
      eligible: true,
      reason:
        documentedLossEUR > 0
          ? `Your documented loss is ${fmtEUR(documentedLossEUR)}. Montreal baggage ceiling is ${MONTREAL_BAGGAGE_CAP_SDR} SDR, subject to proof and carrier review.`
          : `Montreal baggage ceiling is ${MONTREAL_BAGGAGE_CAP_SDR} SDR, subject to proof and carrier review.`,
      sourceUrl: ECB_BASE,
      fallbackUsed: true,
      debugError: err?.message || String(err),
      engineVersion: MONTREAL_SDR_ENGINE_VERSION,
    };
  }
}
