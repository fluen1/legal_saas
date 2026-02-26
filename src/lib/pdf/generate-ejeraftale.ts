import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TableCell,
  TableRow,
  Table,
  WidthType,
} from 'docx';

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 100 },
    children: [new TextRun({ text, bold: true })],
  });
}

function para(text: string, options?: { bold?: boolean; italic?: boolean; spacing?: number }) {
  return new Paragraph({
    spacing: { after: options?.spacing ?? 120 },
    children: [
      new TextRun({
        text,
        bold: options?.bold,
        italics: options?.italic,
        size: 22, // 11pt
      }),
    ],
  });
}

function blankField(label: string) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22 }),
      new TextRun({ text: '________________________________________', size: 22 }),
    ],
  });
}

export async function generateEjeraftaleDocx(): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          // ─── Title ───
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: 'EJERAFTALE', bold: true, size: 36, font: 'Calibri' }),
            ],
          }),

          para(
            'Mellem nedenstående parter er der dags dato indgået følgende ejeraftale vedrørende det i punkt 2 nævnte selskab.',
            { italic: true }
          ),

          // ─── 1. Parterne ───
          heading('1. Parterne', HeadingLevel.HEADING_1),
          para('Denne ejeraftale er indgået mellem følgende kapitalejere:'),
          blankField('Ejer 1 — Navn'),
          blankField('Ejer 1 — Adresse'),
          blankField('Ejer 1 — CPR/CVR-nr'),
          para(''),
          blankField('Ejer 2 — Navn'),
          blankField('Ejer 2 — Adresse'),
          blankField('Ejer 2 — CPR/CVR-nr'),
          para(
            '(Tilføj yderligere ejere efter behov. Herefter samlet benævnt "Parterne".)',
            { italic: true }
          ),

          // ─── 2. Selskabet ───
          heading('2. Selskabet', HeadingLevel.HEADING_1),
          blankField('Selskabets navn'),
          blankField('CVR-nummer'),
          blankField('Hjemstedsadresse'),
          blankField('Registreret kapital'),

          // ─── 3. Formål ───
          heading('3. Formål', HeadingLevel.HEADING_1),
          para(
            'Denne aftale regulerer Parternes indbyrdes forhold som kapitalejere i Selskabet og supplerer Selskabets vedtægter og selskabsloven.'
          ),
          para(
            'I tilfælde af uoverensstemmelse mellem denne aftale og vedtægterne, har denne aftale forrang mellem Parterne.'
          ),

          // ─── 4. Ejerskab og kapitalforhold ───
          heading('4. Ejerskab og kapitalforhold', HeadingLevel.HEADING_1),
          para('Parternes ejerfordeling er som følger ved aftalens indgåelse:'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [para('Ejer', { bold: true })],
                    borders: { bottom: { style: BorderStyle.SINGLE, size: 1 } },
                  }),
                  new TableCell({
                    children: [para('Ejerandel (%)', { bold: true })],
                    borders: { bottom: { style: BorderStyle.SINGLE, size: 1 } },
                  }),
                  new TableCell({
                    children: [para('Nominelt beløb', { bold: true })],
                    borders: { bottom: { style: BorderStyle.SINGLE, size: 1 } },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [para('[Ejer 1]')] }),
                  new TableCell({ children: [para('[___] %')] }),
                  new TableCell({ children: [para('[___] kr.')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [para('[Ejer 2]')] }),
                  new TableCell({ children: [para('[___] %')] }),
                  new TableCell({ children: [para('[___] kr.')] }),
                ],
              }),
            ],
          }),
          para(''),
          para('Kapitalforhøjelser kræver enstemmighed blandt Parterne, medmindre andet er aftalt i vedtægterne.'),

          // ─── 5. Ledelse og beslutningskompetence ───
          heading('5. Ledelse og beslutningskompetence', HeadingLevel.HEADING_1),
          para('5.1 Selskabets daglige ledelse varetages af den valgte direktion.'),
          para('5.2 Følgende beslutninger kræver enstemmighed blandt Parterne:'),
          para('  a) Ændring af vedtægter'),
          para('  b) Optagelse af lån ud over kr. [beløb]'),
          para('  c) Ansættelse eller afskedigelse af direktør'),
          para('  d) Køb eller salg af aktiver over kr. [beløb]'),
          para('  e) Indgåelse af aftaler med nærtstående parter'),
          para('  f) Optagelse af nye kapitalejere'),
          para('5.3 Øvrige beslutninger træffes ved simpelt flertal af kapitalandele.'),

          // ─── 6. Overdragelse af anparter ───
          heading('6. Overdragelse af anparter', HeadingLevel.HEADING_1),
          para('6.1 Forkøbsret: Ønsker en Part at sælge sine anparter, skal disse først tilbydes de øvrige Parter på samme vilkår som det modtagne tilbud fra tredjemand. De øvrige Parter har 30 dages acceptfrist.'),
          para('6.2 Medsalgsret (tag-along): Sælger en Part sine anparter til tredjemand, har de øvrige Parter ret til at sælge deres anparter på samme vilkår.'),
          para('6.3 Medsalgspligt (drag-along): Såfremt Part(er) der repræsenterer mindst [___]% af kapitalen ønsker at sælge alle anparter til tredjemand, er de øvrige Parter forpligtet til at sælge på samme vilkår.'),
          para('6.4 Værdiansættelse: Ved overdragelse mellem Parterne fastsættes prisen af en uafhængig revisor valgt af [metode]. Revisorens vurdering er bindende for Parterne.'),

          // ─── 7. Konkurrence- og kundeklausuler ───
          heading('7. Konkurrence- og kundeklausuler', HeadingLevel.HEADING_1),
          para('7.1 Så længe en Part er kapitalejer i Selskabet, og i en periode på [___] måneder efter udtræden, må Parten ikke:'),
          para('  a) Direkte eller indirekte drive eller deltage i konkurrerende virksomhed'),
          para('  b) Kontakte eller betjene Selskabets kunder'),
          para('  c) Ansætte eller søge at ansætte Selskabets medarbejdere'),
          para('7.2 Overtrædelse af denne bestemmelse udløser en konventionalbod på kr. [beløb] per overtrædelse, uden at dette begrænser Selskabets ret til at kræve erstatning.'),

          // ─── 8. Udbytte- og lønpolitik ───
          heading('8. Udbytte- og lønpolitik', HeadingLevel.HEADING_1),
          para('8.1 Udbytte udbetales efter enstemmig beslutning blandt Parterne, under hensyntagen til Selskabets likviditetsbehov og forsvarlige kapitalberedskab.'),
          para('8.2 Parter der er aktivt beskæftiget i Selskabet aflønnes med en markedskonform løn, som aftales årligt.'),

          // ─── 9. Misligholdelse og ophør ───
          heading('9. Misligholdelse og ophør', HeadingLevel.HEADING_1),
          para('9.1 Væsentlig misligholdelse af denne aftale giver de øvrige Parter ret til at kræve den misligholdende Parts anparter overdraget til en pris svarende til [___]% af den revisorvurderede værdi.'),
          para('9.2 Ved en Parts død overgår anparterne til arvingerne, der indtræder i afdødes rettigheder og forpligtelser under denne aftale. De øvrige Parter har dog forkøbsret i henhold til pkt. 6.'),
          para('9.3 Ved en Parts konkurs har de øvrige Parter forkøbsret i henhold til pkt. 6, og konkurrenceklausulen i pkt. 7 forbliver gældende.'),

          // ─── 10. Tvistløsning ───
          heading('10. Tvistløsning', HeadingLevel.HEADING_1),
          para('10.1 Tvister der udspringer af denne aftale søges først løst ved forhandling mellem Parterne.'),
          para('10.2 Kan tvisten ikke løses inden 30 dage, afgøres den ved [voldgift ved Voldgiftsinstituttet / de almindelige domstole] med [hjemsted] som værneting.'),
          para('10.3 Denne aftale er undergivet dansk ret.'),

          // ─── 11. Underskrifter ───
          heading('11. Underskrifter', HeadingLevel.HEADING_1),
          para('Dato: ________________'),
          para('Sted: ________________'),
          para(''),
          para(''),
          blankField('Ejer 1 — Underskrift'),
          blankField('Ejer 1 — Navn (blokbogstaver)'),
          para(''),
          blankField('Ejer 2 — Underskrift'),
          blankField('Ejer 2 — Navn (blokbogstaver)'),

          // ─── Disclaimer ───
          para(''),
          new Paragraph({
            spacing: { before: 400 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, space: 10 },
            },
            children: [
              new TextRun({
                text: 'Disclaimer: Denne skabelon er vejledende og udgør ikke juridisk rådgivning. Retsklar anbefaler, at aftalen tilpasses jeres konkrete situation med hjælp fra en advokat. Skabelonen er baseret på selskabsloven og almindelig dansk aftaleret.',
                italics: true,
                size: 18,
                color: '6B7280',
              }),
            ],
          }),

          para('Genereret af Retsklar.dk — retsklar.dk', { italic: true }),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
