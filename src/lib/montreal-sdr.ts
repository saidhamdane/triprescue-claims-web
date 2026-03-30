export const MONTREAL_BAGGAGE_CAP_SDR = 1519;
export const MONTREAL_SDR_ENGINE_VERSION = "ecb-basket-v3.1";

const SDR_FALLBACK_EUR_RATE = 1.28;

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

export type MontrealInput = {
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

function parseEcbCsvLine(line: string, currency: string, url: string) {
  const cols = line.split(",", 9);
  const dateStr = cols[6]?.trim() ?? "";
  const obsRaw = cols[7]?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`ECB_${currency}_DATE_COL:got="${dateStr}"`);
  }
  const value = parseFloat(obsRaw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`ECB_${currency}_OBS_COL:got="${obsRaw}"`);
  }
  return { value, date: dateStr, url };
}

async function fetchEcbRateToEur(currency: "USD" | "CNY" | "JPY" | "GBP") {
  const url = `${ECB_BASE}/D.${currency}.EUR.SP00.A?lastNObservations=1&detail=dataonly&format=csvdata`;
  const res = await fetch(url, {
    headers: { accept: "text/csv,*/*", "user-agent": "Mozilla/5.0 TripRescue/1.0" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`ECB_${currency}_STATUS:${res.status}`);
  const raw = await res.text();
  const body = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!body) throw new Error(`ECB_${currency}_EMPTY`);
  const lines = body.split("\n").map(l => l.trim()).filter(
    l => l.length > 0 && !l.startsWith("KEY") && !l.startsWith("DATAFLOW") && !l.startsWith("#")
  );
  if (lines.length === 0) throw new Error(`ECB_${currency}_NO_DATA`);
  return parseEcbCsvLine(lines[lines.length - 1], currency, url);
}

async function getLiveSdrToEur() {
  const currencies = ["USD", "CNY", "JPY", "GBP"] as const;
  const RATE_FALLBACKS: Record<string, number> = {
    USD: 0.918, CNY: 0.127, JPY: 0.0062, GBP: 1.175,
  };
  const results = await Promise.allSettled(currencies.map(c => fetchEcbRateToEur(c)));
  let partialFallback = false;
  const rates: Record<string, number> = {};
  const dates: string[] = [];
  const urls: string[] = [];
  currencies.forEach((c, i) => {
    const r = results[i];
    if (r.status === "fulfilled") {
      rates[c] = r.value.value;
      dates.push(r.value.date);
      urls.push(r.value.url);
    } else {
      rates[c] = RATE_FALLBACKS[c];
      partialFallback = true;
    }
  });
  const sdrToEur = round2(
    SDR_BASKET.USD * rates["USD"] +
    SDR_BASKET.EUR * 1 +
    SDR_BASKET.CNY * rates["CNY"] +
    SDR_BASKET.JPY * rates["JPY"] +
    SDR_BASKET.GBP * rates["GBP"]
  );
  return {
    sdrToEur,
    sourceDate: dates[0] ?? new Date().toISOString().slice(0, 10),
    sourceUrl: urls.join(" | ") || ECB_BASE,
    partialFallback,
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
    if (live.sdrToEur <= 0.5 || live.sdrToEur > 2.5) {
      throw new Error(`ECB_RATE_SANITY:sdrToEur=${live.sdrToEur}`);
    }
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
      category: "baggage", legalModel: "mc99",
      ceilingSDR: MONTREAL_BAGGAGE_CAP_SDR,
      sdrToEur: live.sdrToEur,
      ceilingEUR: effectiveCeilingEUR,
      documentedLossEUR,
      amountEUR: likelyRecoverableEUR,
      rangeLabel: `Up to ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR)`,
      eligible: true,
      reason: documentedLossEUR > 0
        ? `Your documented loss is ${fmtEUR(documentedLossEUR)}. Montreal ceiling today is ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR).`
        : `Montreal ceiling today is ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR).`,
      sourceDate: live.sourceDate,
      sourceUrl: live.sourceUrl,
      fallbackUsed: live.partialFallback,
      engineVersion: MONTREAL_SDR_ENGINE_VERSION,
    };
  } catch (err: any) {
    const fallbackCeilingEUR = round2(MONTREAL_BAGGAGE_CAP_SDR * SDR_FALLBACK_EUR_RATE);
    const amountEUR = documentedLossEUR > 0
      ? round2(Math.min(documentedLossEUR, fallbackCeilingEUR))
      : fallbackCeilingEUR;
    return {
      category: "baggage", legalModel: "mc99",
      ceilingSDR: MONTREAL_BAGGAGE_CAP_SDR,
      sdrToEur: SDR_FALLBACK_EUR_RATE,
      ceilingEUR: fallbackCeilingEUR,
      documentedLossEUR,
      amountEUR,
      rangeLabel: `Up to ${fmtEUR(fallbackCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR)`,
      eligible: true,
      reason: documentedLossEUR > 0
        ? `Your documented loss is ${fmtEUR(documentedLossEUR)}. Montreal baggage ceiling is approx. ${fmtEUR(fallbackCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR), subject to proof and carrier review.`
        : `Montreal baggage ceiling is approx. ${fmtEUR(fallbackCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR), subject to proof and carrier review.`,
      sourceUrl: ECB_BASE,
      fallbackUsed: true,
      debugError: err?.message || String(err),
      engineVersion: MONTREAL_SDR_ENGINE_VERSION,
    };
  }
}
