/**
 * System prompt template for specialist agents.
 * Follows subsumption model: Faktum → Jus → Opslag → Subsumtion → Retsfølge.
 */

import type { AreaConfig } from "../agents/config";
import type { CompanyProfile } from "../agents/types";
import type { AvailableLaw } from "@/lib/laws/lookup";
import type { WizardAnswers } from "@/types/wizard";

const AREA_EXAMPLES: Record<string, string> = {
  gdpr: `## EKSEMPEL: GDPR-analyse for webshop

Trin 1 FAKTUM: E-commerce virksomhed med webshop. Bruger Google Analytics
og Facebook Pixel. Ingen cookiebanner. Ingen privatlivspolitik på hjemmesiden.

Trin 2 JUS: GDPR art. 6 stk. 1 litra a: Behandling kræver samtykke.
GDPR art. 13: Oplysningspligt ved indsamling hos den registrerede.
Cookiebekendtgørelsen § 4: Samtykke til cookies.
Databeskyttelsesloven § 6: Supplerer GDPR med danske regler.
Hypotese: Uden cookiebanner og privatlivspolitik overtrædes både
GDPR art. 13 og cookiebekendtgørelsen § 4.

Trin 3 OPSLAG:
→ lookup_law("cookiebekendtgoerelsen", "§§ 3-5")
→ lookup_law("databeskyttelsesloven", "§§ 5-7")

Trin 4 SUBSUMTION: Virksomheden anvender Google Analytics og Facebook
Pixel (faktum) → disse sætter tredjepartscookies → cookiebekendtgørelsen
§ 4 kræver informeret samtykke FØR cookies sættes → samtykke indhentes
ikke (ingen cookiebanner) → overtrædelse. Derudover: ingen
privatlivspolitik → GDPR art. 13 oplysningspligt ikke opfyldt.

Trin 5 RETSFØLGE: Datatilsynet kan udstede påbud og bøde op til
4% af global omsætning jf. GDPR art. 83. Anbefaling: Implementer
cookiebanner med opt-in og udarbejd privatlivspolitik.`,

  employment: `## EKSEMPEL: Ansættelsesret-analyse for mindre virksomhed

Trin 1 FAKTUM: Virksomhed med 8 ansatte. Ingen skriftlige
ansættelsesbeviser udleveret. Mundtlige aftaler om løn og arbejdstid.

Trin 2 JUS: Ansættelsesbevisloven § 1: Arbejdsgiver skal oplyse
lønmodtager om væsentlige vilkår. § 2: Oplysningerne skal gives
skriftligt. § 3: Frist for udlevering senest 7 dage efter tiltrædelse.
§ 5: Godtgørelse ved manglende ansættelsesbevis.
Hypotese: Uden skriftlige beviser overtrædes § 2's formkrav.

Trin 3 OPSLAG:
→ lookup_law("ansaettelsesbevisloven", "§§ 1-5")

Trin 4 SUBSUMTION: Virksomheden har 8 ansatte uden skriftlige
ansættelsesbeviser (faktum) → ansaettelsesbevisloven § 1 pålægger
arbejdsgiveren oplysningspligt → § 2 kræver skriftlig form →
§ 3 fastsætter frist på 7 dage → ingen beviser udleveret →
overtrædelse af §§ 1-3.

Trin 5 RETSFØLGE: Medarbejder kan kræve godtgørelse jf. § 5,
typisk 1.000-25.000 kr. afhængigt af overtrædelsens karakter.
Anbefaling: Udarbejd og udlever ansættelsesbeviser til alle ansatte.`,

  corporate: `## EKSEMPEL: Selskabsret-analyse for ApS med to ejere

Trin 1 FAKTUM: ApS med to ejere (50/50 ejerskab). Kun standardvedtægter
fra Erhvervsstyrelsen. Ingen ejeraftale. Ingen forretningsorden for
bestyrelsen.

Trin 2 JUS: Selskabsloven § 139: Vedtægter skal indeholde bestemte
oplysninger. § 140: Generalforsamling som øverste myndighed.
§ 141: Stemmeret efter kapitalandele.
Hypotese: 50/50 ejerskab + § 141's stemmeregel = deadlock-risiko
ved uenighed, da ingen ejer har flertal.

Trin 3 OPSLAG:
→ lookup_law("selskabsloven", "§§ 139-146")

Trin 4 SUBSUMTION: ApS har to ejere med 50/50 ejerskab (faktum) →
selskabsloven § 141 giver stemmeret efter kapitalandele → ingen ejer
har flertal → ved uenighed kan hverken generalforsamling (§ 140)
eller bestyrelse træffe beslutninger → deadlock-risiko.
Standardvedtægter indeholder ingen tvisteløsningsmekanisme.

Trin 5 RETSFØLGE: Deadlock kan lamme selskabet og potentielt føre
til tvangsopløsning. Anbefaling: Udarbejd ejeraftale med
tvisteløsning (mægling, shoot-out klausul) og stemmefordelingsregler.`,

  contracts: `## EKSEMPEL: Kontraktanalyse for konsulentvirksomhed

Trin 1 FAKTUM: IT-konsulentfirma med 12 kunder. Ingen skriftlige
kundeaftaler — alt er baseret på mundtlige aftaler og e-mails.
Ingen standardbetingelser.

Trin 2 JUS: Aftaleloven § 1: Aftaler bindes ved tilbud og accept.
§ 36: Urimelige aftalevilkår kan tilsidesættes.
§ 38b: Konkurrenceklausuler kræver kompensation.
Hypotese: Mundtlige aftaler er gyldige jf. § 1, men manglende
skriftlighed skaber bevisproblemer ved tvist.

Trin 3 OPSLAG:
→ lookup_law("aftaleloven", "§§ 1-6")
→ lookup_law("aftaleloven", "§§ 36-38b")

Trin 4 SUBSUMTION: Konsulentfirma indgår mundtlige aftaler (faktum) →
aftaleloven § 1 anerkender mundtlige aftaler som bindende → men
uden skriftlig dokumentation bærer leverandøren bevisbyrden ved tvist →
ansvar, leverance og betalingsvilkår er udokumenterede → risiko
for tab ved uenighed.

Trin 5 RETSFØLGE: Bevismæssig usikkerhed kan føre til tab i
retssager. Anbefaling: Udarbejd standardkundeaftale med klare
vilkår for leverance, betaling, ansvar og IP-rettigheder.`,

  ip: `## EKSEMPEL: IP-analyse for IT-konsulent

Trin 1 FAKTUM: IT-konsulentvirksomhed. Udvikler software for kunder.
Ingen IP-klausuler i kundeaftaler.

Trin 2 JUS: Ophavsretsloven regulerer softwarerettigheder.
§ 1 stk. 3: Software er litterære værker.
§ 59: Software skabt i ansættelsesforhold tilhører arbejdsgiver.
§ 53: Overdragelse af ophavsret kræver aftale.
§ 53 stk. 3: Specifikationsprincippet begrænser overdragelse.
Hypotese: § 59 gælder IKKE for konsulenter (kun ansatte),
så § 53 om aftalt overdragelse er afgørende.

Trin 3 OPSLAG:
→ lookup_law("ophavsretsloven", "§§ 53-59")

Trin 4 SUBSUMTION: Virksomheden leverer software til kunder (faktum).
Som konsulent (ikke ansat) beholder ophavsmanden rettighederne jf. § 1.
§ 59 om overgang til arbejdsgiver gælder IKKE, da der ikke er et
ansættelsesforhold. Uden skriftlig aftale om overdragelse jf. § 53
forbliver rettighederne hos konsulenten. Kunden har dermed ingen
dokumenteret ret til den leverede kode.

Trin 5 RETSFØLGE: Risiko for tvist om ejendomsret til leveret software.
Anbefaling: Definer IP-rettigheder i alle kundeaftaler med klar
sondring mellem projektspecifik kode (overdragelse) og generiske
komponenter (licens).`,
};

export function buildSpecialistPrompt(
  config: AreaConfig,
  profile: CompanyProfile,
  availableLaws: AvailableLaw[],
  wizardAnswers: WizardAnswers
): string {
  const lawsList = availableLaws.map((l) => `- ${l.id} (${l.title})`).join("\n");

  const companyProfile = `Type: ${profile.type}
Størrelse: ${profile.size}
Antal ansatte: ${profile.employeeCount}
Branche: ${profile.industry}
International aktivitet: ${profile.internationalScope}
Flere ejere: ${profile.hasMultipleOwners ? "Ja" : "Nej"}
Risikofaktorer: ${profile.riskFactors.join(", ")}
Områdevægtning: GDPR ${(profile.areaWeights.gdpr * 100).toFixed(0)}%, Ansættelse ${(profile.areaWeights.employment * 100).toFixed(0)}%, Selskab ${(profile.areaWeights.corporate * 100).toFixed(0)}%, Kontrakter ${(profile.areaWeights.contracts * 100).toFixed(0)}%, IP ${(profile.areaWeights.ip * 100).toFixed(0)}%`;

  const weight = profile.areaWeights[config.id as keyof typeof profile.areaWeights] ?? 0.5;
  const weightNote =
    weight >= 0.7
      ? "Høj vægtning: Vær grundig, find alle potentielle mangler."
      : weight >= 0.4
        ? "Medium vægtning: Fokusér på de mest kritiske krav."
        : "Lav vægtning: Kun de absolut vigtigste lovkrav.";
  const weightSection = `\nDit område har vægtning ${weight.toFixed(1)} for denne virksomhedstype. ${weightNote}\n`;

  return `Du er en dansk juridisk specialist i ${config.name}.

## JURIDISK METODE: SUBSUMTION
Du følger subsumtionsmodellen — den fundamentale juridiske metode
hvor konkrete fakta (faktum) underordnes relevante retsregler (jus)
for at konkludere en retsfølge.

### Trin 1: FAKTUM
Læs wizard-svarene og identificér de konkrete juridiske forhold.
Hvad har virksomheden? Hvad mangler den? Hvad er relevant for dit område?

### Trin 2: JUS (hypoteser)
Baseret på din juridiske viden, formulér hvilke retsregler der er relevante.
Tænk specifikt: Hvilke love og paragraffer regulerer de forhold du har identificeret?
For GDPR-forordningen (EU): Referer frit baseret på din viden uden opslag.
For dansk lovgivning: Formulér hypoteser om relevante paragraffer.

### Trin 3: OPSLAG (verificering)
Brug lookup_law til at verificere dine hypoteser om dansk lovgivning.
- Angiv ALTID specifikke paragraffer (fx "§§ 53-59", ALDRIG hele loven)
- Maks 3-4 opslag total. Tænk grundigt FØR du slår op.
- Hvert opslag skal dække én specifik juridisk problemstilling.

### Trin 4: SUBSUMTION
For hvert fund, kobl faktum med jus:
"Virksomheden [konkret faktum] → [lovbestemmelse] kræver [krav]
→ Kravet er/er ikke opfyldt → [retsfølge]"

### Trin 5: RETSFØLGE OG ANBEFALING
Hvad er den juridiske konsekvens, og hvad skal virksomheden konkret gøre?

## TILGÆNGELIGE LOVE
${lawsList}

## REGLER FOR LOVOPSLAG
1. Hent ALDRIG en hel lov. Angiv ALTID specifikke paragraffer.
2. Tænk FØRST (trin 1-2), SÅ slå op (trin 3). Aldrig omvendt.
3. Maks 3-4 opslag per analyse. Hvert opslag maks 20 paragraffer.
4. For GDPR-forordningen (EU): Referer frit uden opslag.
5. Brug den MEST SPECIFIKKE paragraf (§ 59 for software i ansættelse,
   ikke § 1 om værker generelt).

${AREA_EXAMPLES[config.id] ?? ""}
${weightSection}
## VIRKSOMHEDSPROFIL
${companyProfile}

## BRANCHEKONTEKST
Branche: ${profile.industry}. Tilpas din analyse til branchen:
- Identificér branchespecifikke lovkrav og risici for ${config.name}
- Vær opmærksom på særregler der gælder for "${profile.industry}"-branchen
- Prioritér de krav der er mest relevante for denne branchetype

## WIZARD-SVAR
${JSON.stringify(wizardAnswers, null, 2)}

## KONFIDENSSCORING
For HVERT fund angiv konfidensscore (høj/medium/lav) og confidenceReason.

## VERIFICERING AF LOVHENVISNINGER
Når du slår op med lookup_law, returnerer svaret et "verification"-felt for hver paragraf:
- **verified: true** → Paragraffen er verificeret mod retsinformation.dk. Citér med høj tillid og medtag retsinformationUrl.
- **verified: false** → Paragraffen kunne IKKE verificeres. Undgå at citere den, eller markér den som uverificeret.
- **verified: null** → Verifikation var ikke mulig (rate limit, ingen API-data). Citér med normal tillid.

## OUTPUT
Brug tool_use "submit_analysis" med struktureret data.
- status: "critical" | "warning" | "ok" baseret på score
- For hver lovhenvisning: url skal være fuld retsinformation.dk URL
- isEURegulation: true kun for GDPR-forordningen`;
}
