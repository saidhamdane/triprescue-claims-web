const IMF_SDR_URLS = [
  "https://www.imf.org/external/np/fin/data/rms_sdrv.aspx",
  "https://www.imf.org/external/np/fin/data/rms_five.aspx",
];

export const MONTREAL_BAGGAGE_CAP_SDR = 1519;

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

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function parseImfPage(html: string) {
  const text = stripHtml(html);

  const usdPerSdrMatch = text.match(/SDR1\s*=\s*US\$\s*([0-9.]+)/i);
  const euroLineMatch =
    text.match(/Euro\s+[0-9.]+\s+([0-9.]+)\s+[0-9.]+/i) ||
    text.match(/Euro\s+([0-9.]+)\s+[0-9.]+\s+[0-9.]+/i);

  const dateMatch =
    text.match(/SDR rates as of:\s*([A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2},\s+\d{4})/i) ||
    text.match(/([A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2},\s+\d{4})/i);

  const usdPerSdr = usdPerSdrMatch ? Number(usdPerSdrMatch[1]) : NaN;
  const usdPerEur = euroLineMatch ? Number(euroLineMatch[1]) : NaN;

  if (!Number.isFinite(usdPerSdr) || !Number.isFinite(usdPerEur) || usdPerEur <= 0) {
    throw new Error("Could not parse IMF SDR/EUR rates");
  }

  return {
    sourceDate: dateMatch?.[1] || undefined,
    usdPerSdr,
    usdPerEur,
    sdrToEur: round2(usdPerSdr / usdPerEur),
  };
}

async function fetchImfRates() {
  for (const url of IMF_SDR_URLS) {
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 TripRescue/1.0",
          accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
      });

      if (!res.ok) continue;

      const html = await res.text();
      const parsed = parseImfPage(html);

      return {
        ...parsed,
        sourceUrl: url,
      };
    } catch {
      // try next source
    }
  }

  return null;
}

export async function getMontrealBaggageEstimate(
  input: MontrealInput = {}
): Promise<MontrealEstimate> {
  const documentedLossEUR = round2(Number(input.documentedLossEUR || 0));
  const declaredValueEUR = round2(Number(input.declaredValueEUR || 0));
  const specialDeclaration = Boolean(input.specialDeclaration);

  const rates = await fetchImfRates();

  if (!rates) {
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
        `Montreal baggage ceiling is ${MONTREAL_BAGGAGE_CAP_SDR} SDR. ` +
        (documentedLossEUR > 0
          ? `Your documented loss is ${fmtEUR(documentedLossEUR)}.`
          : `Documented loss was not provided.`),
      sourceUrl: "https://www.imf.org/external/np/fin/data/rms_sdrv.aspx",
      fallbackUsed: true,
    };
  }

  const baseCeilingEUR = round2(MONTREAL_BAGGAGE_CAP_SDR * rates.sdrToEur);
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
    sdrToEur: rates.sdrToEur,
    ceilingEUR: effectiveCeilingEUR,
    documentedLossEUR,
    amountEUR: likelyRecoverableEUR,
    rangeLabel: `Up to ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR)`,
    eligible: true,
    reason:
      documentedLossEUR > 0
        ? `Your documented loss is ${fmtEUR(documentedLossEUR)}. Montreal ceiling today is ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR).`
        : `Montreal ceiling today is ${fmtEUR(effectiveCeilingEUR)} (${MONTREAL_BAGGAGE_CAP_SDR} SDR).`,
    sourceDate: rates.sourceDate,
    sourceUrl: rates.sourceUrl,
    fallbackUsed: false,
  };
}
