/**
 * GDPR Tjekliste for Virksomheder — DOCX builder
 */
import { Document, Packer } from "docx";
import {
  getDocStyles,
  getNumbering,
  sectionProps,
  sectionHeaders,
  sectionFooters,
  titleHero,
  disclaimerBox,
  sectionHeading,
  bodyText,
  lawRefBox,
  checkboxItem,
  ctaBox,
  pageBreak,
} from "./design-system";

export async function buildGDPRTjekliste(): Promise<Buffer> {
  const doc = new Document({
    styles: getDocStyles(),
    numbering: getNumbering(),
    sections: [
      {
        properties: sectionProps(),
        headers: sectionHeaders(),
        footers: sectionFooters(),
        children: [
          // ─── Title page ───
          ...titleHero(
            "GDPR Tjekliste for Virksomheder",
            "De 10 vigtigste GDPR-krav din virksomhed skal overholde \u2014 2026"
          ),

          disclaimerBox(
            "Denne tjekliste er vejledende og udg\u00F8r ikke juridisk r\u00E5dgivning. Brug den som udgangspunkt for din GDPR-compliance og tilpas til din virksomheds konkrete situation."
          ),

          // ─── 1. Privatlivspolitik ───
          sectionHeading("1", "Privatlivspolitik"),
          bodyText(
            "Du skal have en klar og tilg\u00E6ngelig privatlivspolitik, der beskriver hvilke persondata du indsamler, hvorfor, hvem du deler med, og hvor l\u00E6nge du opbevarer."
          ),
          lawRefBox(
            "GDPR Art. 13\u201314",
            "Gennemg\u00E5 og opdat\u00E9r din privatlivspolitik. S\u00F8rg for at den er tilg\u00E6ngelig p\u00E5 din hjemmeside."
          ),
          checkboxItem("Privatlivspolitik \u2014 opfyldt"),

          // ─── 2. Lovligt behandlingsgrundlag ───
          sectionHeading("2", "Lovligt behandlingsgrundlag"),
          bodyText(
            "Du skal have et lovligt grundlag for at behandle persondata: samtykke, kontrakt, retlig forpligtelse eller legitim interesse."
          ),
          lawRefBox(
            "GDPR Art. 6",
            "For hver type persondata: dokument\u00E9r hvilket behandlingsgrundlag du bruger."
          ),
          checkboxItem("Lovligt behandlingsgrundlag \u2014 opfyldt"),

          // ─── 3. Databehandleraftaler (DPA) ───
          sectionHeading("3", "Databehandleraftaler (DPA)"),
          bodyText(
            "Alle leverand\u00F8rer, der behandler persondata p\u00E5 dine vegne (hosting, email, CRM, regnskab), kr\u00E6ver en skriftlig databehandleraftale."
          ),
          lawRefBox(
            "GDPR Art. 28",
            "Lav en liste over leverand\u00F8rer. Tjek om du har en DPA med hver. Indhent manglende aftaler."
          ),
          checkboxItem("Databehandleraftaler (DPA) \u2014 opfyldt"),

          // ─── 4. Fortegnelse over behandlingsaktiviteter ───
          sectionHeading("4", "Fortegnelse over behandlingsaktiviteter"),
          bodyText(
            "Dokument\u00E9r hvilke persondata du behandler, form\u00E5let, behandlingsgrundlaget og slettefristen."
          ),
          lawRefBox(
            "GDPR Art. 30",
            "Opret et regneark med kolonner: datatype, form\u00E5l, grundlag, modtagere, slettefrist."
          ),
          checkboxItem("Fortegnelse over behandlingsaktiviteter \u2014 opfyldt"),

          // ─── 5. Cookie-consent ───
          sectionHeading("5", "Cookie-consent"),
          bodyText(
            "Din hjemmeside skal have et lovligt cookie-banner med mulighed for at afvise ikke-n\u00F8dvendige cookies."
          ),
          lawRefBox(
            "Cookiebekendtg\u00F8relsen + ePrivacy",
            "Implement\u00E9r en cookie-consent-l\u00F8sning. S\u00F8rg for at scripts f\u00F8rst indl\u00E6ses efter samtykke."
          ),
          checkboxItem("Cookie-consent \u2014 opfyldt"),

          // ─── 6. Ret til indsigt ───
          sectionHeading("6", "Ret til indsigt"),
          bodyText(
            "Alle personer har ret til at se, hvilke data du har om dem. Du skal besvare inden 30 dage."
          ),
          lawRefBox(
            "GDPR Art. 15",
            "Hav en procedure klar til at h\u00E5ndtere indsigtsanmodninger."
          ),
          checkboxItem("Ret til indsigt \u2014 opfyldt"),

          // ─── 7. Ret til sletning ───
          sectionHeading("7", "Ret til sletning"),
          bodyText(
            "Registrerede kan bede om at f\u00E5 deres data slettet (medmindre du har lovkrav om opbevaring)."
          ),
          lawRefBox(
            "GDPR Art. 17",
            "S\u00F8rg for at du kan slette persondata fra alle systemer: CRM, email-lister, backup."
          ),
          checkboxItem("Ret til sletning \u2014 opfyldt"),

          // ─── 8. Databeskyttelse by design ───
          sectionHeading("8", "Databeskyttelse by design"),
          bodyText(
            "T\u00E6nk databeskyttelse ind fra starten i nye produkter og processer. Indsaml kun n\u00F8dvendige data."
          ),
          lawRefBox(
            "GDPR Art. 25",
            'Ved nye projekter: sp\u00F8rg "hvilke data har vi brug for?" \u2014 ikke "hvad kan vi indsamle?"'
          ),
          checkboxItem("Databeskyttelse by design \u2014 opfyldt"),

          // ─── 9. Sikkerhedsforanstaltninger ───
          sectionHeading("9", "Sikkerhedsforanstaltninger"),
          bodyText(
            "Beskyt persondata med passende tekniske og organisatoriske tiltag: st\u00E6rke passwords, 2FA, kryptering."
          ),
          lawRefBox(
            "GDPR Art. 32",
            "Aktiv\u00E9r to-faktor-autentificering p\u00E5 alle forretningskritiske systemer."
          ),
          checkboxItem("Sikkerhedsforanstaltninger \u2014 opfyldt"),

          // ─── 10. Brudnotifikation ───
          sectionHeading("10", "Brudnotifikation"),
          bodyText(
            "Ved databrud: vurd\u00E9r risikoen, anmeld til Datatilsynet inden 72 timer, og underret ber\u00F8rte personer."
          ),
          lawRefBox(
            "GDPR Art. 33\u201334",
            "Hav en beredskabsplan: hvem kontaktes, hvem anmelder, og hvorn\u00E5r."
          ),
          checkboxItem("Brudnotifikation \u2014 opfyldt"),

          // ─── CTA ───
          pageBreak(),
          ctaBox(
            "Tag et gratis juridisk helbredstjek af din virksomhed",
            "retsklar.dk"
          ),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
