import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PRIMARY = rgb(30 / 255, 58 / 255, 95 / 255);
const GRAY = rgb(55 / 255, 65 / 255, 81 / 255);
const LIGHT_GRAY = rgb(107 / 255, 114 / 255, 128 / 255);
const SECTION_BG = rgb(243 / 255, 244 / 255, 246 / 255);

const SECTIONS = [
  {
    title: '1. Før fraflytning',
    items: [
      'Fotografér HELE lejligheden (alle rum, vægge, gulve, lofter) med datostempel',
      'Gem kvitteringer for professionel rengøring (anbefales altid)',
      'Gennemgå din indflytningsrapport — sammenlign med nuværende stand',
      'Dokumentér eksisterende skader der var der ved indflytning',
      'Sørg for at alle nøgler er samlet og klar til aflevering',
      'Aflæs forbrugsmålere og fotografér dem',
    ],
    law: 'Lejeloven § 98 — Lejers vedligeholdelsespligt',
  },
  {
    title: '2. Selve fraflytningssynet',
    items: [
      'Du har RET til at være til stede ved fraflytningssynet',
      'Udlejer SKAL indkalde dig med mindst 1 uges varsel (Lejeloven § 98, stk. 3)',
      'Tag en person med som vidne',
      'Fotografér alt der påpeges som skade eller mangel',
      'Skriv IKKE under på noget du er uenig i',
      'Bed om en kopi af fraflytningsrapporten på stedet',
      'Notér dato, tidspunkt og hvem der var til stede',
    ],
    law: 'Lejeloven § 98, stk. 3-4 — Fraflytningssyn',
  },
  {
    title: '3. Uenighed om depositum',
    items: [
      'Udlejer skal fremsende opgørelse inden 14 dage efter fraflytningssynet',
      'Overholder udlejer ikke fristen, mister de retten til at kræve betaling',
      'Kræv specificeret opgørelse med dokumentation for hvert fradrag',
      'Uenig med fradraget? Send skriftlig indsigelse (email er OK)',
      'Udlejer må KUN trække fra for skader ud over normalt slid',
      'Maling og lakering af gulve er normalt lejers pligt — men kun i rimeligt omfang',
    ],
    law: 'Lejeloven § 98, stk. 5 — Frist for opgørelse',
  },
  {
    title: '4. Huslejenævnet',
    items: [
      'Kan du ikke blive enig med udlejer, kan du klage til Huslejenævnet',
      'Gebyret er 357 kr (2026) — udlejer betaler 6.827 kr hvis du vinder',
      'Du skal klage inden 12 måneder efter fraflytning',
      'Nævnet kan nedsætte eller fjerne udlejers krav',
      'Behandlingstiden er typisk 3-6 måneder',
      'Nævnets afgørelse kan indbringes for boligretten inden 4 uger',
    ],
    law: 'Lejeloven § 105-107 — Huslejenævn',
  },
];

const FINAL_CHECKLIST = [
  'Alle rum fotograferet med datostempel',
  'Professionel rengøring udført (gem kvittering)',
  'Indflytningsrapport fundet og gennemgået',
  'Alle nøgler samlet',
  'Forbrugsmålere aflæst og fotograferet',
  'Vidne arrangeret til fraflytningssyn',
  'Fraflytningsrapport modtaget',
  'Frist for opgørelse (14 dage) noteret',
  'Eventuel indsigelse sendt skriftligt',
  'Huslejenævn overvejet ved uenighed',
];

export async function generateFraflytningsguidePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN = 50;
  const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function addPage() {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) addPage();
  }

  function drawWrappedText(text: string, x: number, options: {
    font?: typeof helvetica;
    size?: number;
    color?: ReturnType<typeof rgb>;
    maxWidth?: number;
  } = {}) {
    const font = options.font ?? helvetica;
    const size = options.size ?? 10;
    const color = options.color ?? GRAY;
    const maxWidth = options.maxWidth ?? CONTENT_WIDTH;
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, size) > maxWidth && currentLine) {
        page.drawText(currentLine, { x, y, size, font, color });
        y -= size * 1.4;
        currentLine = word;
        if (y < MARGIN) addPage();
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      page.drawText(currentLine, { x, y, size, font, color });
      y -= size * 1.4;
    }
  }

  // ─── Header ───
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 80, width: PAGE_WIDTH, height: 80, color: PRIMARY });
  page.drawText('Retsklar', { x: MARGIN, y: PAGE_HEIGHT - 35, size: 20, font: helveticaBold, color: rgb(1, 1, 1) });
  page.drawText('Fraflytningsguide — Beskyt Dit Depositum', { x: MARGIN, y: PAGE_HEIGHT - 60, size: 13, font: helvetica, color: rgb(0.85, 0.9, 1) });

  y = PAGE_HEIGHT - 110;

  drawWrappedText(
    'Denne guide hjælper dig trin for trin med at sikre, at du får dit depositum tilbage ved fraflytning. ' +
    'Baseret på de mest almindelige tvister og den gældende lejelov.',
    MARGIN,
    { size: 10, color: GRAY }
  );
  y -= 15;

  // ─── Sections ───
  for (const section of SECTIONS) {
    ensureSpace(30 + section.items.length * 16);

    page.drawText(section.title, { x: MARGIN, y, size: 13, font: helveticaBold, color: PRIMARY });
    y -= 18;

    for (const item of section.items) {
      ensureSpace(20);
      // Checkbox
      page.drawRectangle({ x: MARGIN + 5, y: y - 2, width: 10, height: 10, borderColor: GRAY, borderWidth: 0.8 });
      drawWrappedText(item, MARGIN + 22, { size: 9, color: GRAY, maxWidth: CONTENT_WIDTH - 30 });
      y -= 4;
    }

    // Law reference
    ensureSpace(16);
    page.drawText(section.law, { x: MARGIN + 5, y, size: 8, font: helvetica, color: LIGHT_GRAY });
    y -= 22;
  }

  // ─── Final checklist ───
  ensureSpace(40);
  page.drawText('Komplet tjekliste', { x: MARGIN, y, size: 13, font: helveticaBold, color: PRIMARY });
  y -= 18;

  for (const item of FINAL_CHECKLIST) {
    ensureSpace(18);
    page.drawRectangle({ x: MARGIN + 5, y: y - 2, width: 10, height: 10, borderColor: GRAY, borderWidth: 0.8 });
    drawWrappedText(item, MARGIN + 22, { size: 9, color: GRAY, maxWidth: CONTENT_WIDTH - 30 });
    y -= 4;
  }

  // ─── Footer ───
  ensureSpace(50);
  y -= 10;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, color: rgb(0.9, 0.9, 0.9), thickness: 1 });
  y -= 20;
  page.drawText('Genereret af Retsklar.dk', { x: MARGIN, y, size: 9, font: helveticaBold, color: PRIMARY });
  y -= 14;
  drawWrappedText('Brug for juridisk hjælp? Besøg retsklar.dk eller kontakt kontakt@retsklar.dk', MARGIN, { size: 9, color: LIGHT_GRAY });

  return doc.save();
}
