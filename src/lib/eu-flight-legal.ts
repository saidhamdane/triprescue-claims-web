export type SupportedLang = "en" | "de" | "fr" | "it" | "es";

export type LegalBasis = {
  title: string;
  regulation: string;
  celex: string;
  officialUri: string;
  officialUrl: string;
  summary: string;
  compensationHint: string;
};

function detectType(input: any) {
  const t = String(
    input?.incidentType ||
    input?.type ||
    input?.category ||
    input?.title ||
    ""
  ).toLowerCase();

  return {
    isDelay: t.includes("delay") || t.includes("late") || t.includes("delayed"),
    isCancellation: t.includes("cancel"),
    isDeniedBoarding: t.includes("denied") || t.includes("boarding"),
    isBaggage:
      t.includes("baggage") ||
      t.includes("luggage") ||
      t.includes("bag") ||
      t.includes("lost") ||
      t.includes("damaged"),
    isReducedMobility:
      t.includes("reduced mobility") ||
      t.includes("disabled") ||
      t.includes("assistance"),
  };
}

function officialUrlForCelex(celex: string) {
  if (!celex) return "";
  return `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${celex}`;
}

export function getEuFlightLegalBasis(params: {
  incidentType?: string;
  lang?: SupportedLang;
}): LegalBasis {
  const lang = params.lang ?? "en";
  const flags = detectType({ incidentType: params.incidentType });

  const mk = (
    title: string,
    regulation: string,
    celex: string,
    summary: string,
    compensationHint: string
  ): LegalBasis => ({
    title,
    regulation,
    celex,
    officialUri: celex ? `celex:${celex}` : "",
    officialUrl: officialUrlForCelex(celex),
    summary,
    compensationHint,
  });

  if (lang === "es") {
    if (flags.isDelay || flags.isCancellation || flags.isDeniedBoarding) {
      return mk(
        "Base legal aplicable",
        "Reglamento (CE) n.º 261/2004",
        "32004R0261",
        "Este caso puede estar cubierto por el Reglamento (CE) 261/2004 sobre compensación y asistencia a los pasajeros aéreos en caso de gran retraso, cancelación o denegación de embarque.",
        "La compensación potencial suele situarse entre 250 € y 600 € según la distancia y las circunstancias."
      );
    }
    if (flags.isBaggage) {
      return mk(
        "Base legal aplicable",
        "Convenio de Montreal / Reglamento (CE) n.º 889/2002",
        "32002R0889",
        "Los incidentes de equipaje perdido, dañado o retrasado suelen evaluarse conforme al Convenio de Montreal aplicado en la UE por el Reglamento (CE) 889/2002.",
        "La cuantía depende de la pérdida acreditada y de los límites aplicables."
      );
    }
    if (flags.isReducedMobility) {
      return mk(
        "Base legal aplicable",
        "Reglamento (CE) n.º 1107/2006",
        "32006R1107",
        "Los derechos de las personas con discapacidad o movilidad reducida en el transporte aéreo están protegidos por el Reglamento (CE) 1107/2006.",
        "La reclamación depende del incumplimiento concreto de asistencia o del trato recibido."
      );
    }
  }

  if (lang === "de") {
    if (flags.isDelay || flags.isCancellation || flags.isDeniedBoarding) {
      return mk(
        "Anwendbare Rechtsgrundlage",
        "Verordnung (EG) Nr. 261/2004",
        "32004R0261",
        "Dieser Fall kann unter die Verordnung (EG) 261/2004 zu Ausgleichs- und Unterstützungsleistungen bei großer Verspätung, Annullierung oder Nichtbeförderung fallen.",
        "Die mögliche Entschädigung liegt häufig zwischen 250 € und 600 €."
      );
    }
    if (flags.isBaggage) {
      return mk(
        "Anwendbare Rechtsgrundlage",
        "Montrealer Übereinkommen / Verordnung (EG) Nr. 889/2002",
        "32002R0889",
        "Verlorenes, beschädigtes oder verspätetes Gepäck wird in der Regel nach dem Montrealer Übereinkommen bewertet, das in der EU durch die Verordnung (EG) 889/2002 umgesetzt wird.",
        "Die Erstattung hängt vom nachgewiesenen Schaden und den Haftungsgrenzen ab."
      );
    }
    if (flags.isReducedMobility) {
      return mk(
        "Anwendbare Rechtsgrundlage",
        "Verordnung (EG) Nr. 1107/2006",
        "32006R1107",
        "Die Rechte von behinderten Personen und Personen mit eingeschränkter Mobilität im Luftverkehr werden durch die Verordnung (EG) 1107/2006 geschützt.",
        "Die Beurteilung hängt vom konkreten Assistenz- oder Diskriminierungsvorfall ab."
      );
    }
  }

  if (lang === "fr") {
    if (flags.isDelay || flags.isCancellation || flags.isDeniedBoarding) {
      return mk(
        "Base juridique applicable",
        "Règlement (CE) n° 261/2004",
        "32004R0261",
        "Ce dossier peut relever du Règlement (CE) 261/2004 relatif à l’indemnisation et à l’assistance des passagers en cas de retard important, d’annulation ou de refus d’embarquement.",
        "L’indemnisation potentielle se situe souvent entre 250 € et 600 €."
      );
    }
    if (flags.isBaggage) {
      return mk(
        "Base juridique applicable",
        "Convention de Montréal / Règlement (CE) n° 889/2002",
        "32002R0889",
        "Les bagages perdus, endommagés ou retardés sont généralement appréciés au regard de la Convention de Montréal appliquée dans l’UE par le Règlement (CE) 889/2002.",
        "Le montant dépend du préjudice justifié et des plafonds applicables."
      );
    }
    if (flags.isReducedMobility) {
      return mk(
        "Base juridique applicable",
        "Règlement (CE) n° 1107/2006",
        "32006R1107",
        "Les droits des personnes handicapées et des personnes à mobilité réduite voyageant par avion sont protégés par le Règlement (CE) 1107/2006.",
        "L’analyse dépend du manquement concret d’assistance ou du traitement subi."
      );
    }
  }

  if (lang === "it") {
    if (flags.isDelay || flags.isCancellation || flags.isDeniedBoarding) {
      return mk(
        "Base giuridica applicabile",
        "Regolamento (CE) n. 261/2004",
        "32004R0261",
        "Questo caso può rientrare nel Regolamento (CE) 261/2004 relativo a compensazione e assistenza ai passeggeri in caso di ritardo prolungato, cancellazione o negato imbarco.",
        "La compensazione potenziale è spesso compresa tra 250 € e 600 €."
      );
    }
    if (flags.isBaggage) {
      return mk(
        "Base giuridica applicabile",
        "Convenzione di Montreal / Regolamento (CE) n. 889/2002",
        "32002R0889",
        "I casi di bagaglio smarrito, danneggiato o ritardato sono normalmente valutati alla luce della Convenzione di Montreal applicata nell’UE dal Regolamento (CE) 889/2002.",
        "L’importo dipende dal danno documentato e dai limiti applicabili."
      );
    }
    if (flags.isReducedMobility) {
      return mk(
        "Base giuridica applicabile",
        "Regolamento (CE) n. 1107/2006",
        "32006R1107",
        "I diritti delle persone con disabilità o mobilità ridotta nel trasporto aereo sono disciplinati dal Regolamento (CE) 1107/2006.",
        "La valutazione dipende dal concreto inadempimento dell’assistenza o dal trattamento ricevuto."
      );
    }
  }

  if (flags.isDelay || flags.isCancellation || flags.isDeniedBoarding) {
    return mk(
      "Applicable legal basis",
      "Regulation (EC) No 261/2004",
      "32004R0261",
      "This case may fall under EC Regulation 261/2004 covering compensation and passenger assistance in cases of long delay, cancellation, or denied boarding.",
      "Potential compensation is commonly between €250 and €600 depending on route distance and circumstances."
    );
  }

  if (flags.isBaggage) {
    return mk(
      "Applicable legal basis",
      "Montreal Convention / Regulation (EC) No 889/2002",
      "32002R0889",
      "Lost, damaged, or delayed baggage claims are commonly assessed under the Montreal Convention as applied in the EU by Regulation (EC) No 889/2002.",
      "Compensation depends on documented loss and applicable liability limits."
    );
  }

  if (flags.isReducedMobility) {
    return mk(
      "Applicable legal basis",
      "Regulation (EC) No 1107/2006",
      "32006R1107",
      "The rights of disabled persons and persons with reduced mobility travelling by air are protected by Regulation (EC) No 1107/2006.",
      "The claim depends on the specific failure of assistance or discriminatory treatment."
    );
  }

  return {
    title: "Applicable legal basis",
    regulation: "General EU air passenger rights framework",
    celex: "",
    officialUri: "",
    officialUrl: "",
    summary:
      "This claim may require assessment under applicable EU air passenger rights and carrier obligations.",
    compensationHint:
      "Compensation depends on the incident type, evidence, and route involved.",
  };
}
