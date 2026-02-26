/**
 * Fraflytningsguide — DOCX builder
 */
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import {
  DS,
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
  warningBox,
  infoBox,
  checkboxItem,
  bulletItem,
  ctaBox,
  makeTable,
  pageBreak,
} from "./design-system";

export async function buildFraflytningsguide(): Promise<Buffer> {
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
            "Fraflytningsguide",
            "Beskyt dit depositum \u2014 trin for trin"
          ),

          disclaimerBox(
            "Denne guide er vejledende og udg\u00F8r ikke juridisk r\u00E5dgivning. Retsklar anbefaler, at du s\u00F8ger professionel r\u00E5dgivning ved tvister af st\u00F8rre karakter."
          ),

          // ─── 1. Før fraflytning ───
          sectionHeading("1", "F\u00F8r fraflytning"),
          bodyText(
            "F\u00F8r du afleverer n\u00F8glerne, er grundig dokumentation dit vigtigste v\u00E5ben. Brug tjeklisten herunder."
          ),

          checkboxItem(
            "Fotograf\u00E9r HELE lejligheden (alle rum, v\u00E6gge, gulve, lofter) med datostempel"
          ),
          checkboxItem(
            "Gem kvitteringer for professionel reng\u00F8ring (anbefales altid)"
          ),
          checkboxItem(
            "Gennemg\u00E5 din indflytningsrapport \u2014 sammenlign med nuv\u00E6rende stand"
          ),
          checkboxItem(
            "Dokument\u00E9r eksisterende skader, der var der ved indflytning"
          ),
          checkboxItem(
            "S\u00F8rg for at alle n\u00F8gler er samlet og klar til aflevering"
          ),
          checkboxItem(
            "Afl\u00E6s forbrugsm\u00E5lere og fotograf\u00E9r dem"
          ),

          lawRefBox(
            "Lejeloven \u00A7 98",
            "Lejer skal aflevere det lejede i samme stand som ved indflytning, bortset fra forringelse som f\u00F8lge af almindeligt slid og \u00E6lde."
          ),

          // ─── 2. Selve fraflytningssynet ───
          sectionHeading("2", "Selve fraflytningssynet"),
          bodyText(
            "Fraflytningssynet er dit vigtigste bevismoment. V\u00E6r til stede, v\u00E6r forberedt, og dokument\u00E9r alt."
          ),

          checkboxItem(
            "Du har RET til at v\u00E6re til stede ved fraflytningssynet"
          ),
          checkboxItem(
            "Udlejer SKAL indkalde dig med mindst 1 uges varsel"
          ),
          checkboxItem("Tag en person med som vidne"),
          checkboxItem(
            "Fotograf\u00E9r alt der p\u00E5peges som skade eller mangel"
          ),
          checkboxItem(
            "Skriv IKKE under p\u00E5 noget du er uenig i"
          ),
          checkboxItem(
            "Bed om en kopi af fraflytningsrapporten p\u00E5 stedet"
          ),
          checkboxItem(
            "Not\u00E9r dato, tidspunkt og hvem der var til stede"
          ),

          lawRefBox(
            "Lejeloven \u00A7 98, stk. 3\u20134",
            "Udlejer skal indkalde lejer til fraflytningssyn med mindst 1 uges varsel. Udlejer, der udlejer mere end \u00E9n beboelseslejlighed, skal afholde syn senest 2 uger efter, at udlejer er blevet bekendt med fraflytningen."
          ),

          warningBox(
            "Vigtigt",
            "Hvis udlejer IKKE indkalder dig til syn, mister udlejer som udgangspunkt retten til at kr\u00E6ve istands\u00E6ttelse."
          ),

          // ─── 3. Uenighed om depositum ───
          sectionHeading("3", "Uenighed om depositum"),
          bodyText(
            "Har du modtaget en opg\u00F8relse, du er uenig i? Her er dine rettigheder."
          ),

          bulletItem(
            "Udlejer skal fremsende opg\u00F8relse inden 14 dage efter fraflytningssynet"
          ),
          bulletItem(
            "\u26A0\uFE0F Overholder udlejer ikke fristen, mister de retten til at kr\u00E6ve betaling"
          ),
          bulletItem(
            "Kr\u00E6v specificeret opg\u00F8relse med dokumentation for hvert fradrag"
          ),
          bulletItem(
            "Uenig med fradraget? Send skriftlig indsigelse (email er OK)"
          ),
          bulletItem(
            "Udlejer m\u00E5 KUN tr\u00E6kke fra for skader ud over normalt slid"
          ),
          bulletItem(
            "Maling og lakering af gulve er normalt lejers pligt \u2014 men kun i rimeligt omfang"
          ),

          lawRefBox(
            "Lejeloven \u00A7 98, stk. 5",
            "Udlejers krav om istandsættelse skal fremsendes inden 14 dage efter synsdatoen. Overholdes fristen ikke, bortfalder udlejers krav."
          ),

          // ─── 4. Huslejenævnet ───
          sectionHeading("4", "Huslejen\u00E6vnet"),
          bodyText(
            "Kan du ikke blive enig med udlejer, kan du indbringe sagen for Huslejen\u00E6vnet."
          ),

          makeTable(
            ["Emne", "Detalje"],
            [
              ["Klagegebyr (2026)", "367 kr."],
              ["Udlejer betaler ved fuldt medhold", "7.027 kr."],
              ["Klagefrist", "12 m\u00E5neder efter fraflytning"],
              [
                "Behandlingstid",
                "Typisk 3\u20136 m\u00E5neder (kan v\u00E6re l\u00E6ngere)",
              ],
              [
                "Anke",
                "Boligretten inden 4 uger efter afg\u00F8relse",
              ],
            ],
            [4653, 4653]
          ),

          lawRefBox(
            "Lejeloven \u00A7 106 og boligforholdsloven \u00A7 82",
            "Huslejen\u00E6vnet afg\u00F8r tvister mellem lejere og udlejere i private lejem\u00E5l. Gebyrer reguleres \u00E5rligt pr. 1. januar."
          ),

          infoBox(
            "Tip",
            "Huslejen\u00E6vnet kan neds\u00E6tte eller fjerne udlejers krav. Det er billigt at klage og risikoen er lav \u2014 du mister ikke gebyret, selvom du ikke f\u00E5r medhold."
          ),

          // ─── Komplet tjekliste (final page) ───
          pageBreak(),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Komplet fraflytnings-tjekliste",
                font: DS.FONT_HEADING,
                size: 30,
                bold: true,
                color: DS.PRIMARY,
              }),
            ],
          }),

          checkboxItem("Alle rum fotograferet med datostempel"),
          checkboxItem(
            "Professionel reng\u00F8ring udf\u00F8rt (gem kvittering)"
          ),
          checkboxItem(
            "Indflytningsrapport fundet og gennemg\u00E5et"
          ),
          checkboxItem("Alle n\u00F8gler samlet"),
          checkboxItem(
            "Forbrugsm\u00E5lere afl\u00E6st og fotograferet"
          ),
          checkboxItem("Vidne arrangeret til fraflytningssyn"),
          checkboxItem("Fraflytningsrapport modtaget"),
          checkboxItem(
            "Frist for opg\u00F8relse (14 dage) noteret i kalender"
          ),
          checkboxItem("Eventuel indsigelse sendt skriftligt"),
          checkboxItem(
            "Huslejen\u00E6vn overvejet ved uenighed"
          ),

          ctaBox(
            "Brug for juridisk hj\u00E6lp? Bes\u00F8g os p\u00E5",
            "retsklar.dk"
          ),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
