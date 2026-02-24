/**
 * Area configuration for specialist agents.
 */

export interface AreaConfig {
  id: string;
  name: string;
  laws: string[];
  gdprArticles?: string;
}

export const AREA_CONFIGS: AreaConfig[] = [
  {
    id: "gdpr",
    name: "GDPR & Persondata",
    laws: ["databeskyttelsesloven", "cookiebekendtgoerelsen"],
    gdprArticles: `
GDPR-forordningen (EU 2016/679) — du kender denne fra din træning.
Nøgleartikler for SMV'er:
- Art. 5: Grundlæggende principper for behandling
- Art. 6: Lovlighed af behandling (samtykke, legitim interesse, mv.)
- Art. 7: Betingelser for samtykke
- Art. 9: Følsomme personoplysninger
- Art. 12-14: Oplysningspligt (privatlivspolitik)
- Art. 15-22: Registreredes rettigheder (indsigt, sletning, portabilitet)
- Art. 24-25: Dataansvar og privacy by design
- Art. 28: Databehandleraftale (DPA)
- Art. 30: Fortegnelse over behandlingsaktiviteter
- Art. 32: Behandlingssikkerhed
- Art. 33-34: Brud på persondatasikkerhed (notification)
- Art. 35-36: DPIA (Data Protection Impact Assessment)
- Art. 37-39: DPO (Data Protection Officer)
- Art. 44-49: Overførsel til tredjelande
- Art. 83: Administrative bøder (op til 4% af global omsætning)
`,
  },
  {
    id: "employment",
    name: "Ansættelsesret",
    laws: ["ansaettelsesbevisloven", "arbejdsmiljoeloven", "funktionaerloven", "ferieloven"],
  },
  {
    id: "corporate",
    name: "Selskabsret & Governance",
    laws: ["selskabsloven", "aarsregnskabsloven", "bogfoeringsloven"],
  },
  {
    id: "contracts",
    name: "Kontrakter & Kommercielle Aftaler",
    laws: ["aftaleloven", "koebeloven", "markedsfoeringsloven"],
  },
  {
    id: "ip",
    name: "IP & Immaterielle Rettigheder",
    laws: ["ophavsretsloven", "varemaerkeloven"],
  },
];
