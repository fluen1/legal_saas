/**
 * Ejeraftale Skabelon — DOCX builder
 */
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import {
  DS,
  getDocStyles,
  getNumbering,
  sectionProps,
  sectionHeaders,
  sectionFooters,
  titleHero,
  disclaimerBox,
  infoBox,
  sectionHeading,
  bodyText,
  fillField,
  lawRefBox,
  warningBox,
  makeTable,
  bulletItem,
  ctaBox,
  noBorders,
} from "./design-system";

export async function buildEjeraftale(): Promise<Buffer> {
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
            "Ejeraftale",
            "Skabelon til kapitalejere i anpartsselskaber (ApS)"
          ),

          disclaimerBox(
            "Denne skabelon er vejledende og udg\u00F8r ikke juridisk r\u00E5dgivning. Retsklar anbefaler, at aftalen tilpasses jeres konkrete situation med hj\u00E6lp fra en advokat. Skabelonen er baseret p\u00E5 selskabsloven og almindelig dansk aftaleret."
          ),

          infoBox(
            "S\u00E5dan bruger du skabelonen",
            "Udfyld felterne markeret med streg. Tilpas de punkter, der er markeret med [beskriv/bel\u00F8b], til jeres konkrete situation. Gennemg\u00E5 alle punkter med alle parter f\u00F8r underskrift."
          ),

          new Paragraph({
            style: "Subtitle",
            children: [
              new TextRun({ text: "Mellem nedenst\u00E5ende parter er der dags dato indg\u00E5et f\u00F8lgende ejeraftale vedr\u00F8rende det i punkt 2 n\u00E6vnte selskab." }),
            ],
          }),

          // ─── 1. Parterne ───
          sectionHeading("1", "Parterne"),
          bodyText(
            "Denne ejeraftale er indg\u00E5et mellem f\u00F8lgende kapitalejere:"
          ),

          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: "Ejer 1", style: "BoldPrefixChar" }),
            ],
          }),
          fillField("Navn"),
          fillField("Adresse"),
          fillField("CPR/CVR-nr."),

          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: "Ejer 2", style: "BoldPrefixChar" }),
            ],
          }),
          fillField("Navn"),
          fillField("Adresse"),
          fillField("CPR/CVR-nr."),

          new Paragraph({
            style: "DisclaimerText",
            children: [
              new TextRun({ text: '(Tilf\u00F8j yderligere ejere efter behov. Herefter samlet ben\u00E6vnt "Parterne".)' }),
            ],
          }),

          // ─── 2. Selskabet ───
          sectionHeading("2", "Selskabet"),
          fillField("Selskabets navn"),
          fillField("CVR-nummer"),
          fillField("Hjemstedsadresse"),
          fillField("Registreret kapital"),

          // ─── 3. Formål ───
          sectionHeading("3", "Form\u00E5l"),
          bodyText(
            "Denne aftale regulerer Parternes indbyrdes forhold som kapitalejere i Selskabet og supplerer Selskabets vedt\u00E6gter og selskabsloven."
          ),
          bodyText(
            "I tilf\u00E6lde af uoverensstemmelse mellem denne aftale og vedt\u00E6gterne har denne aftale forrang mellem Parterne."
          ),
          lawRefBox(
            "Selskabsloven (SL)",
            "Ejeraftalen supplerer selskabslovens regler. Aftalen binder kun Parterne indbyrdes \u2014 den har ikke virkning over for selskabet eller tredjemand."
          ),

          // ─── 4. Ejerskab og kapitalforhold ───
          sectionHeading("4", "Ejerskab og kapitalforhold"),
          bodyText(
            "Parternes ejerfordeling er som f\u00F8lger ved aftalens indg\u00E5else:"
          ),

          makeTable(
            ["Ejer", "Ejerandel (%)", "Nominelt bel\u00F8b"],
            [
              ["[Ejer 1]", "[___] %", "[___] kr."],
              ["[Ejer 2]", "[___] %", "[___] kr."],
            ],
            [3700, 2803, 2803]
          ),

          bodyText(
            "Kapitalforh\u00F8jelser kr\u00E6ver enstemmighed blandt Parterne, medmindre andet er aftalt i vedt\u00E6gterne."
          ),

          // ─── 5. Ledelse og beslutningskompetence ───
          sectionHeading("5", "Ledelse og beslutningskompetence"),
          bodyText(
            "5.1  Selskabets daglige ledelse varetages af den valgte direktion."
          ),
          bodyText(
            "5.2  F\u00F8lgende beslutninger kr\u00E6ver enstemmighed blandt Parterne:"
          ),

          bulletItem("\u00C6ndring af vedt\u00E6gter", {
            boldPrefix: "a)",
          }),
          bulletItem("Optagelse af l\u00E5n ud over kr. [bel\u00F8b]", {
            boldPrefix: "b)",
          }),
          bulletItem(
            "Ans\u00E6ttelse eller afskedigelse af direkt\u00F8r",
            { boldPrefix: "c)" }
          ),
          bulletItem(
            "K\u00F8b eller salg af aktiver over kr. [bel\u00F8b]",
            { boldPrefix: "d)" }
          ),
          bulletItem(
            "Indg\u00E5else af aftaler med n\u00E6rtst\u00E5ende parter",
            { boldPrefix: "e)" }
          ),
          bulletItem("Optagelse af nye kapitalejere", {
            boldPrefix: "f)",
          }),

          bodyText(
            "5.3  \u00D8vrige beslutninger tr\u00E6ffes ved simpelt flertal af kapitalandele."
          ),

          // ─── 6. Overdragelse af anparter ───
          sectionHeading("6", "Overdragelse af anparter"),
          bodyText(
            "6.1  Fork\u00F8bsret: \u00D8nsker en Part at s\u00E6lge sine anparter, skal disse f\u00F8rst tilbydes de \u00F8vrige Parter p\u00E5 samme vilk\u00E5r som det modtagne tilbud fra tredjemand. De \u00F8vrige Parter har 30 dages acceptfrist."
          ),
          bodyText(
            "6.2  Medsalgsret (tag-along): S\u00E6lger en Part sine anparter til tredjemand, har de \u00F8vrige Parter ret til at s\u00E6lge deres anparter p\u00E5 samme vilk\u00E5r."
          ),
          bodyText(
            "6.3  Medsalgspligt (drag-along): S\u00E5fremt Part(er) der repr\u00E6senterer mindst [___]% af kapitalen \u00F8nsker at s\u00E6lge alle anparter til tredjemand, er de \u00F8vrige Parter forpligtet til at s\u00E6lge p\u00E5 samme vilk\u00E5r."
          ),
          bodyText(
            "6.4  V\u00E6rdians\u00E6ttelse: Ved overdragelse mellem Parterne fasts\u00E6ttes prisen af en uafh\u00E6ngig revisor valgt af [metode]. Revisorens vurdering er bindende for Parterne."
          ),

          lawRefBox(
            "Selskabsloven \u00A7 66\u201377",
            "Vedt\u00E6gterne kan indeholde bestemmelser om fork\u00F8bsret, samtykke og indl\u00F8sning. Ejeraftalen b\u00F8r koordineres med vedt\u00E6gterne."
          ),

          // ─── 7. Konkurrence- og kundeklausuler ───
          sectionHeading("7", "Konkurrence- og kundeklausuler"),
          bodyText(
            "7.1  S\u00E5 l\u00E6nge en Part er kapitalejer i Selskabet, og i en periode p\u00E5 [___] m\u00E5neder efter udtr\u00E6den, m\u00E5 Parten ikke:"
          ),

          bulletItem(
            "Direkte eller indirekte drive eller deltage i konkurrerende virksomhed",
            { boldPrefix: "a)" }
          ),
          bulletItem(
            "Kontakte eller betjene Selskabets kunder",
            { boldPrefix: "b)" }
          ),
          bulletItem(
            "Ans\u00E6tte eller s\u00F8ge at ans\u00E6tte Selskabets medarbejdere",
            { boldPrefix: "c)" }
          ),

          bodyText(
            "7.2  Overtr\u00E6delse af denne bestemmelse udl\u00F8ser en konventionalbod p\u00E5 kr. [bel\u00F8b] per overtr\u00E6delse, uden at dette begr\u00E6nser Selskabets ret til at kr\u00E6ve erstatning."
          ),

          warningBox(
            "Bem\u00E6rk",
            "Konkurrenceklausuler skal v\u00E6re rimelige i omfang og varighed. Urimeligt brede klausuler risikerer at blive tilsidesat af domstolene jf. aftalelovens \u00A7 36."
          ),

          // ─── 8. Udbytte- og lønpolitik ───
          sectionHeading("8", "Udbytte- og l\u00F8npolitik"),
          bodyText(
            "8.1  Udbytte udbetales efter enstemmig beslutning blandt Parterne, under hensyntagen til Selskabets likviditetsbehov og forsvarlige kapitalberedskab jf. selskabslovens \u00A7 179\u2013182."
          ),
          bodyText(
            "8.2  Parter der er aktivt besk\u00E6ftiget i Selskabet afl\u00F8nnes med en markedskonform l\u00F8n, som aftales \u00E5rligt."
          ),

          // ─── 9. Misligholdelse og ophør ───
          sectionHeading("9", "Misligholdelse og oph\u00F8r"),
          bodyText(
            "9.1  V\u00E6sentlig misligholdelse af denne aftale giver de \u00F8vrige Parter ret til at kr\u00E6ve den misligholdende Parts anparter overdraget til en pris svarende til [___]% af den revisorvurderede v\u00E6rdi."
          ),
          bodyText(
            "9.2  Ved en Parts d\u00F8d overg\u00E5r anparterne til arvingerne, der indtr\u00E6der i afd\u00F8des rettigheder og forpligtelser under denne aftale. De \u00F8vrige Parter har dog fork\u00F8bsret i henhold til pkt. 6."
          ),
          bodyText(
            "9.3  Ved en Parts konkurs har de \u00F8vrige Parter fork\u00F8bsret i henhold til pkt. 6, og konkurrenceklausulen i pkt. 7 forbliver g\u00E6ldende."
          ),

          // ─── 10. Tvistløsning ───
          sectionHeading("10", "Tvistl\u00F8sning"),
          bodyText(
            "10.1  Tvister der udspringer af denne aftale s\u00F8ges f\u00F8rst l\u00F8st ved forhandling mellem Parterne."
          ),
          bodyText(
            "10.2  Kan tvisten ikke l\u00F8ses inden 30 dage, afg\u00F8res den ved [voldgift ved Voldgiftsinstituttet / de almindelige domstole] med [hjemsted] som v\u00E6rneting."
          ),
          bodyText("10.3  Denne aftale er undergivet dansk ret."),

          // ─── 11. Underskrifter ───
          sectionHeading("11", "Underskrifter"),

          // Dato / Sted on one line (2-col table, no borders)
          new Table({
            width: { size: DS.CONTENT_W, type: WidthType.DXA },
            columnWidths: [4653, 4653],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 4653, type: WidthType.DXA },
                    borders: noBorders,
                    children: [fillField("Dato")],
                  }),
                  new TableCell({
                    width: { size: 4653, type: WidthType.DXA },
                    borders: noBorders,
                    children: [fillField("Sted")],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 300, after: 80 },
            children: [
              new TextRun({ text: "Ejer 1", style: "BoldPrefixChar" }),
            ],
          }),
          fillField("Underskrift"),
          fillField("Navn (blokbogstaver)"),

          new Paragraph({
            spacing: { before: 300, after: 80 },
            children: [
              new TextRun({ text: "Ejer 2", style: "BoldPrefixChar" }),
            ],
          }),
          fillField("Underskrift"),
          fillField("Navn (blokbogstaver)"),

          // ─── CTA ───
          ctaBox(
            "F\u00E5 et juridisk helbredstjek af din virksomhed",
            "retsklar.dk"
          ),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
