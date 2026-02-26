import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PRIMARY = rgb(30 / 255, 58 / 255, 95 / 255); // #1E3A5F
const GRAY = rgb(55 / 255, 65 / 255, 81 / 255); // #374151
const LIGHT_GRAY = rgb(107 / 255, 114 / 255, 128 / 255);
const CHECK_BG = rgb(243 / 255, 244 / 255, 246 / 255);

const CHECKLIST_ITEMS = [
  {
    title: '1. Privatlivspolitik',
    description:
      'Du skal have en klar og tilgængelig privatlivspolitik der beskriver, hvilke persondata du indsamler, hvorfor, hvem du deler med, og hvor længe du opbevarer.',
    law: 'GDPR Art. 13-14',
    action: 'Gennemgå og opdatér din privatlivspolitik. Sørg for at den er tilgængelig på din hjemmeside.',
  },
  {
    title: '2. Lovligt behandlingsgrundlag',
    description:
      'Du skal have et lovligt grundlag for at behandle persondata: samtykke, kontrakt, eller legitim interesse.',
    law: 'GDPR Art. 6',
    action: 'For hver type persondata, dokumentér hvilket behandlingsgrundlag du bruger.',
  },
  {
    title: '3. Databehandleraftaler (DPA)',
    description:
      'Alle leverandører der behandler persondata på dine vegne (hosting, email, CRM, regnskab) kræver en skriftlig databehandleraftale.',
    law: 'GDPR Art. 28',
    action: 'Lav en liste over leverandører. Tjek om du har en DPA med hver. Indhent manglende aftaler.',
  },
  {
    title: '4. Fortegnelse over behandlingsaktiviteter',
    description:
      'Dokumentér hvilke persondata du behandler, formålet, behandlingsgrundlaget, og slettefristen.',
    law: 'GDPR Art. 30',
    action: 'Opret et regneark med kolonner: datatype, formål, grundlag, modtagere, slettefrist.',
  },
  {
    title: '5. Cookie-consent',
    description:
      'Din hjemmeside skal have et lovligt cookie-banner med mulighed for at afvise ikke-nødvendige cookies.',
    law: 'Cookiebekendtgørelsen + ePrivacy',
    action: 'Implementér en cookie-consent-løsning. Sørg for at scripts først indlæses efter samtykke.',
  },
  {
    title: '6. Ret til indsigt',
    description:
      'Alle personer har ret til at se hvilke data du har om dem. Du skal besvare inden 30 dage.',
    law: 'GDPR Art. 15',
    action: 'Hav en procedure klar til at håndtere indsigtsanmodninger.',
  },
  {
    title: '7. Ret til sletning',
    description:
      'Registrerede kan bede om at få deres data slettet (medmindre du har lovkrav om opbevaring).',
    law: 'GDPR Art. 17',
    action: 'Sørg for at du kan slette persondata fra alle systemer: CRM, email-lister, backup.',
  },
  {
    title: '8. Databeskyttelse by design',
    description:
      'Tænk databeskyttelse ind fra starten i nye produkter og processer. Indsaml kun nødvendige data.',
    law: 'GDPR Art. 25',
    action: 'Ved nye projekter: spørg "hvilke data har vi brug for?" — ikke "hvad kan vi indsamle?".',
  },
  {
    title: '9. Sikkerhedsforanstaltninger',
    description:
      'Beskyt persondata med passende tekniske og organisatoriske tiltag: stærke passwords, 2FA, kryptering.',
    law: 'GDPR Art. 32',
    action: 'Aktivér to-faktor-autentificering på alle forretningskritiske systemer.',
  },
  {
    title: '10. Brudnotifikation',
    description:
      'Ved databrud: vurdér risikoen, anmeld til Datatilsynet inden 72 timer, og underret berørte personer.',
    law: 'GDPR Art. 33-34',
    action: 'Hav en beredskabsplan: hvem kontaktes, hvem anmelder, og hvornår.',
  },
];

export async function generateGdprChecklistPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_WIDTH = 595; // A4
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

  function drawText(text: string, x: number, yPos: number, options: {
    font?: typeof helvetica;
    size?: number;
    color?: ReturnType<typeof rgb>;
    maxWidth?: number;
  } = {}) {
    const font = options.font ?? helvetica;
    const size = options.size ?? 10;
    const color = options.color ?? GRAY;
    const maxWidth = options.maxWidth ?? CONTENT_WIDTH;

    // Simple word wrap
    const words = text.split(' ');
    let currentLine = '';
    let currentY = yPos;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth && currentLine) {
        page.drawText(currentLine, { x, y: currentY, size, font, color });
        currentY -= size * 1.4;
        currentLine = word;

        if (currentY < MARGIN) {
          addPage();
          currentY = y;
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, { x, y: currentY, size, font, color });
      currentY -= size * 1.4;
    }

    y = currentY;
  }

  // ─── Header ───
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 80,
    width: PAGE_WIDTH,
    height: 80,
    color: PRIMARY,
  });

  page.drawText('Retsklar', {
    x: MARGIN,
    y: PAGE_HEIGHT - 35,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('GDPR Tjekliste for Virksomheder — 2026', {
    x: MARGIN,
    y: PAGE_HEIGHT - 60,
    size: 13,
    font: helvetica,
    color: rgb(0.85, 0.9, 1),
  });

  y = PAGE_HEIGHT - 110;

  // ─── Intro ───
  drawText(
    'Denne tjekliste indeholder de 10 vigtigste GDPR-krav, din virksomhed skal overholde. ' +
    'Brug den som udgangspunkt for din GDPR-compliance og markér hvert punkt, når det er opfyldt.',
    MARGIN,
    y,
    { size: 10, color: GRAY }
  );

  y -= 20;

  // ─── Checklist items ───
  for (const item of CHECKLIST_ITEMS) {
    ensureSpace(120);

    // Background box
    page.drawRectangle({
      x: MARGIN - 5,
      y: y - 85,
      width: CONTENT_WIDTH + 10,
      height: 95,
      color: CHECK_BG,
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 0.5,
    });

    // Checkbox
    page.drawRectangle({
      x: MARGIN + 5,
      y: y - 6,
      width: 12,
      height: 12,
      borderColor: GRAY,
      borderWidth: 1,
    });

    // Title
    page.drawText(item.title, {
      x: MARGIN + 25,
      y: y - 3,
      size: 11,
      font: helveticaBold,
      color: PRIMARY,
    });

    y -= 18;

    // Description
    drawText(item.description, MARGIN + 10, y, {
      size: 9,
      color: GRAY,
      maxWidth: CONTENT_WIDTH - 20,
    });

    y -= 4;

    // Law reference
    page.drawText(`Lovhenvisning: ${item.law}`, {
      x: MARGIN + 10,
      y,
      size: 8,
      font: helvetica,
      color: LIGHT_GRAY,
    });
    y -= 14;

    // Action
    drawText(`Handling: ${item.action}`, MARGIN + 10, y, {
      size: 9,
      color: PRIMARY,
      font: helveticaBold,
      maxWidth: CONTENT_WIDTH - 20,
    });

    y -= 20;
  }

  // ─── Footer ───
  ensureSpace(60);
  y -= 10;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  });
  y -= 20;

  page.drawText('Genereret af Retsklar.dk', {
    x: MARGIN,
    y,
    size: 9,
    font: helveticaBold,
    color: PRIMARY,
  });
  y -= 14;

  drawText(
    'Vil du vide mere? Tag et gratis juridisk helbredstjek på retsklar.dk — det tager kun 5 minutter.',
    MARGIN,
    y,
    { size: 9, color: LIGHT_GRAY }
  );

  return doc.save();
}
