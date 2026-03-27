export type SupportedLang = "en" | "de" | "fr" | "it" | "es";

export type CompensationEstimate = {
  eligible: boolean | null;
  amountEUR: number | null;
  rangeLabel: string;
  reason: string;
  category: "ec261" | "baggage" | "mobility" | "unknown";
};

function normalizeType(input: any) {
  return String(
    input?.incidentType ||
    input?.type ||
    input?.category ||
    input?.title ||
    ""
  ).toLowerCase();
}

function num(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function estimateCompensation(params: {
  incidentType?: string;
  distanceKm?: number | null;
  delayHours?: number | null;
  lang?: SupportedLang;
}) : CompensationEstimate {
  const t = normalizeType({ incidentType: params.incidentType });
  const distanceKm = num(params.distanceKm);
  const delayHours = num(params.delayHours);

  const isDelay =
    t.includes("delay") || t.includes("late") || t.includes("delayed");
  const isCancellation =
    t.includes("cancel") || t.includes("cancellation");
  const isDeniedBoarding =
    t.includes("denied") || t.includes("boarding");
  const isBaggage =
    t.includes("baggage") ||
    t.includes("luggage") ||
    t.includes("bag") ||
    t.includes("lost") ||
    t.includes("damaged");
  const isReducedMobility =
    t.includes("reduced mobility") ||
    t.includes("disabled") ||
    t.includes("assistance");

  if (isBaggage) {
    return {
      eligible: null,
      amountEUR: null,
      rangeLabel: "Variable",
      reason:
        "Baggage claims under the Montreal framework depend on documented loss, damage, delay, and liability limits.",
      category: "baggage",
    };
  }

  if (isReducedMobility) {
    return {
      eligible: null,
      amountEUR: null,
      rangeLabel: "Case specific",
      reason:
        "Reduced mobility and assistance claims are assessed based on the assistance failure, discrimination, and resulting harm.",
      category: "mobility",
    };
  }

  if (!(isDelay || isCancellation || isDeniedBoarding)) {
    return {
      eligible: null,
      amountEUR: null,
      rangeLabel: "Pending review",
      reason:
        "The incident type does not clearly match a standard EC261 compensation category.",
      category: "unknown",
    };
  }

  if (isDelay && delayHours !== null && delayHours < 3) {
    return {
      eligible: false,
      amountEUR: 0,
      rangeLabel: "Below threshold",
      reason:
        "For many EC261 delay scenarios, compensation usually requires a long delay threshold, commonly 3 hours or more at arrival.",
      category: "ec261",
    };
  }

  if (distanceKm === null) {
    return {
      eligible: true,
      amountEUR: null,
      rangeLabel: "€250–€600",
      reason:
        "The case appears potentially eligible under EC261, but a distance-based estimate needs the route length.",
      category: "ec261",
    };
  }

  if (distanceKm <= 1500) {
    return {
      eligible: true,
      amountEUR: 250,
      rangeLabel: "€250",
      reason:
        "Short-haul EC261 estimate for eligible disruption cases up to 1500 km.",
      category: "ec261",
    };
  }

  if (distanceKm > 1500 && distanceKm <= 3500) {
    return {
      eligible: true,
      amountEUR: 400,
      rangeLabel: "€400",
      reason:
        "Mid-range EC261 estimate for eligible disruption cases between 1500 km and 3500 km.",
      category: "ec261",
    };
  }

  return {
    eligible: true,
    amountEUR: 600,
    rangeLabel: "€600",
    reason:
      "Long-haul EC261 estimate for eligible disruption cases above 3500 km.",
    category: "ec261",
  };
}
