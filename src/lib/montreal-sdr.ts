export const MONTREAL_BAGGAGE_CAP_SDR = 1519;

const IMF_SDR_URL =
  "https://www.imf.org/external/np/fin/data/rms_sdrv.aspx";

const ECB_USD_EUR_CSV_URL =
  "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?lastNObservations=1&format=csvdata";

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

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchSdrUsdFromImf() {
  const res = await fetch(IMF_SDR_URL, {
    headers: {
      "user-agent": "Mozilla/5.0 TripRescue/1.0",
      accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`IMF SDR page failed: ${res.status}`);
  }

  const html = await res.text();
  const text = stripHtml(html);

  const rateMatch = text.match(/SDR1\s*=\s*US\$\s*([0-9.]+)/i);
  const dateMatch = text.match(
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}/i
  );

  if (!rateMatch) {
    throw new Error("Could not parse SDR1 = US$ rate from IMF page");
  }

  return {
    sdrToUsd: Number(rateMatch[1]),
    sourceDate: dateMatch?.[0],
    sourceUrl: IMF_SDR_URL,
  };
}

async function fetchUsdEurFromEcb() {
  const res = await fetch(ECB_USD_EUR_CSV_URL, {
    headers: {
      accept: "text/csv,*/*",
      "user-agent": "Mozilla/5.0 TripRescue/1.0",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`ECB EXR API failed: ${res.status}`);
  }

  const csv = await res.text();
  const lines = csv
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("ECB CSV returned no observations");
  }

  // Robust parse: last non-empty line, last field = OBS_VALUE
  const last = lines[lines.length - 1];
  const parts = last.split(",");

  const obs = Number(parts[parts.length - 1]?.replace(/^"|"$/g, ""));
  const dateField = parts.find((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.replace(/^"|"$/g, "")));

  if (!Number.isFinite(obs) || obs <= 0) {
    throw new Error("Could not parse USD/EUR from ECB CSV");
  }

  return {
    usdToEur: obs,
    sourceDate: dateField?.replace(/^"|"$/g, ""),
    sourceUrl: ECB_USD_EUR_CSV_URL,
  };
}

export async function getMontrealBaggageEstimate(
  input: MontrealInput = {}
): Promise<MontrealEstimate> {
  const documentedLossEUR = round2(Number(input.documentedLossEUR || 0));
  const declaredValueEUR = round2(Number(input.declaredValueEUR || 0));
  const specialDeclaration = Boolean(input.specialDeclaration);

  try {
    const [imf, ecb] = await Promise.all([
      fetchSdrUsdFromImf(),
      fetchUsdEurFromEcb(),
    ]);

    const sdrToEur = round2(imf.sdrToUsd * ecb.usdToEur);
    const baseCeilingEUR = round2(MONTREAL_BAGGAGE_CAP_SDR * sdrToEur);
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
      sdrToEur,
      ceilingEUR: effectiveCeilingEUR,
      documentedLossEUR,
      amountEUR: likelyRecoverableEUR,
      rangeLabel: `Up to ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR)`,
      eligible: true,
      reason:
        documentedLossEUR > 0
          ? `Your documented loss is ${fmtEUR(documentedLossEUR)}. Montreal ceiling today is ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR).`
          : `Montreal ceiling today is ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR).`,
      sourceDate: imf.sourceDate || ecb.sourceDate,
      sourceUrl: `${imf.sourceUrl} | ${ecb.sourceUrl}`,
      fallbackUsed: false,
    };
  } catch {
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
      sourceUrl: IMF_SDR_URL,
      fallbackUsed: true,
    };
  }
}
