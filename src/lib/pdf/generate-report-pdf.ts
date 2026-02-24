import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts, type Color } from 'pdf-lib';
import type {
  HealthCheckReport,
  ScoreLevel,
  RiskLevel,
} from '@/types/report';

const APP_NAME = 'Retsklar \u2014 Juridisk Helbredstjek';

// A4 dimensions in PDF points (1pt = 1/72 inch)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 71; // ~25 mm
const CONTENT_WIDTH = A4_WIDTH - 2 * MARGIN;
const FOOTER_ZONE = MARGIN + 35;

const FONT = {
  xs: 7,
  sm: 8.5,
  base: 10,
  md: 11,
  lg: 14,
  xl: 18,
  xxl: 22,
} as const;

const LH = 1.5;

function hex(h: string): Color {
  return rgb(
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255,
  );
}

const C = {
  primary: hex('#1E3A5F'),
  green: hex('#22C55E'),
  greenBg: hex('#DCFCE7'),
  red: hex('#EF4444'),
  redBg: hex('#FEE2E2'),
  yellow: hex('#F59E0B'),
  yellowBg: hex('#FEF3C7'),
  gray: hex('#6B7280'),
  lightGray: hex('#F5F5F5'),
  border: hex('#E5E7EB'),
  text: hex('#1F2937'),
  white: hex('#FFFFFF'),
  blueBg: hex('#DBEAFE'),
  blueText: hex('#1E40AF'),
  warnBg: hex('#FFFBEB'),
  warnBorder: hex('#FDE68A'),
  warnText: hex('#92400E'),
};

const SCORE_STYLE: Record<ScoreLevel, { color: Color; bg: Color; label: string }> = {
  red: { color: C.red, bg: C.redBg, label: 'Kritisk' },
  yellow: { color: C.yellow, bg: C.yellowBg, label: 'Bør forbedres' },
  green: { color: C.green, bg: C.greenBg, label: 'God stand' },
};

const RISK_STYLE: Record<RiskLevel, { bg: Color; text: Color; label: string }> = {
  critical: { bg: C.redBg, text: hex('#991B1B'), label: 'Kritisk' },
  important: { bg: C.yellowBg, text: hex('#92400E'), label: 'Vigtig' },
  recommended: { bg: C.blueBg, text: C.blueText, label: 'Anbefalet' },
};

const DA_MONTHS = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
];

function formatDateDa(iso: string): string {
  const d = new Date(iso || Date.now());
  return `${d.getDate()}. ${DA_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Replace characters outside WinAnsiEncoding (Latin-1) */
function sanitize(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013]/g, '-')
    .replace(/[\u2014]/g, '--')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[\u2022]/g, '*')
    .replace(/[^\x00-\xFF]/g, '');
}

function wrapText(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export async function generateReportPDF(report: HealthCheckReport): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const pages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;

  const dateStr = formatDateDa(report.generatedAt);

  // --- helpers (close over mutable `page` / `y`) ---

  function addPage() {
    page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
    pages.push(page);
    y = A4_HEIGHT - MARGIN;
  }

  function ensureSpace(needed: number) {
    if (y - needed < FOOTER_ZONE) addPage();
  }

  function line(x1: number, x2: number, yPos: number, color: Color = C.border, w = 0.5) {
    page.drawLine({ start: { x: x1, y: yPos }, end: { x: x2, y: yPos }, thickness: w, color });
  }

  function txt(
    text: string,
    x: number,
    yPos: number,
    f: PDFFont = regular,
    size: number = FONT.base,
    color: Color = C.text,
  ) {
    page.drawText(sanitize(text), { x, y: yPos, font: f, size, color });
  }

  function txtCenter(text: string, yPos: number, f: PDFFont, size: number, color: Color) {
    const w = f.widthOfTextAtSize(sanitize(text), size);
    txt(text, (A4_WIDTH - w) / 2, yPos, f, size, color);
  }

  function txtRight(text: string, yPos: number, f: PDFFont, size: number, color: Color) {
    const w = f.widthOfTextAtSize(sanitize(text), size);
    txt(text, A4_WIDTH - MARGIN - w, yPos, f, size, color);
  }

  /** Draws wrapped text starting at (x, yPos). Returns y after last line. */
  function wrappedText(
    text: string,
    x: number,
    yPos: number,
    maxW: number,
    f: PDFFont = regular,
    size: number = FONT.base,
    color: Color = C.text,
  ): number {
    const lines = wrapText(text, f, size, maxW);
    let cy = yPos;
    for (const l of lines) {
      txt(l, x, cy, f, size, color);
      cy -= size * LH;
    }
    return cy;
  }

  function rect(
    x: number,
    yBottom: number,
    w: number,
    h: number,
    fill?: Color,
    border?: Color,
    bw = 0.5,
  ) {
    page.drawRectangle({
      x,
      y: yBottom,
      width: w,
      height: h,
      color: fill,
      borderColor: border,
      borderWidth: border ? bw : 0,
    });
  }

  // ==========================================================================
  // START DRAWING
  // ==========================================================================

  addPage();

  // ── HEADER ─────────────────────────────────────────────────────────────────
  txt(APP_NAME, MARGIN, y, bold, FONT.xl, C.primary);
  txtRight(dateStr, y + 2, regular, FONT.sm, C.gray);
  y -= 12;
  line(MARGIN, A4_WIDTH - MARGIN, y, C.primary, 2);
  y -= 35;

  // ── OVERALL SCORE ──────────────────────────────────────────────────────────
  const ss = SCORE_STYLE[report.overallScore];
  const cx = A4_WIDTH / 2;
  const cr = 32;

  page.drawCircle({ x: cx, y: y - cr, size: cr, color: ss.bg, borderColor: ss.color, borderWidth: 3 });

  const slW = bold.widthOfTextAtSize(ss.label, FONT.md);
  txt(ss.label, cx - slW / 2, y - cr - FONT.md / 3, bold, FONT.md, ss.color);

  y -= cr * 2 + 18;

  txtCenter('Retsklar -- Juridisk Helbredstjek', y, bold, FONT.xxl, C.primary);
  y -= 28;

  // Score explanation (centered, wrapped)
  const explLines = wrapText(report.scoreExplanation, regular, FONT.base, CONTENT_WIDTH - 60);
  for (const el of explLines) {
    const ew = regular.widthOfTextAtSize(el, FONT.base);
    txt(el, (A4_WIDTH - ew) / 2, y, regular, FONT.base, C.gray);
    y -= FONT.base * LH;
  }
  y -= 8;

  // Issue summary counts
  const allIssues = report.areas.flatMap((a) => a.issues);
  const counts = {
    critical: allIssues.filter((i) => i.risk === 'critical').length,
    important: allIssues.filter((i) => i.risk === 'important').length,
    recommended: allIssues.filter((i) => i.risk === 'recommended').length,
  };
  const parts: string[] = [];
  if (counts.critical > 0) parts.push(`${counts.critical} kritiske`);
  if (counts.important > 0) parts.push(`${counts.important} vigtige`);
  if (counts.recommended > 0) parts.push(`${counts.recommended} anbefalede`);
  if (parts.length > 0) {
    txtCenter(`${parts.join(', ')} fund i alt`, y, regular, FONT.base, C.text);
    y -= 22;
  }

  line(MARGIN, A4_WIDTH - MARGIN, y);
  y -= 28;

  // ── COMPLIANCE AREAS ───────────────────────────────────────────────────────
  txt('Compliance-områder', MARGIN, y, bold, FONT.lg, C.primary);
  y -= 22;

  for (const area of report.areas) {
    ensureSpace(55);

    // Area header bar
    const ahH = 28;
    rect(MARGIN, y - ahH, CONTENT_WIDTH, ahH, C.lightGray, C.border);

    const areaColor = SCORE_STYLE[area.score].color;
    page.drawCircle({ x: MARGIN + 16, y: y - ahH / 2, size: 5, color: areaColor });

    txt(area.name, MARGIN + 30, y - ahH / 2 - 4, bold, FONT.md, C.text);

    const statusW = regular.widthOfTextAtSize(sanitize(area.status), FONT.sm);
    txt(area.status, A4_WIDTH - MARGIN - statusW - 10, y - ahH / 2 - 3, regular, FONT.sm, C.gray);

    y -= ahH + 4;

    // Issues
    for (const issue of area.issues) {
      ensureSpace(70);

      const rs = RISK_STYLE[issue.risk];
      const badgeTxt = rs.label;
      const badgeW = bold.widthOfTextAtSize(sanitize(badgeTxt), FONT.xs) + 12;
      const badgeH = 14;
      const badgeX = MARGIN + 16;

      rect(badgeX, y - badgeH + 2, badgeW, badgeH, rs.bg);
      txt(badgeTxt, badgeX + 6, y - badgeH + 5, bold, FONT.xs, rs.text);

      txt(issue.title, badgeX + badgeW + 8, y - badgeH + 5, bold, FONT.base, C.text);
      y -= badgeH + 6;

      y = wrappedText(issue.description, MARGIN + 26, y, CONTENT_WIDTH - 36, regular, FONT.sm, C.gray);
      y -= 2;

      const lawRefText = issue.lawReferences?.length
        ? issue.lawReferences.map((r) => `${r.law} ${r.paragraph}`).join(', ')
        : '';
      if (lawRefText) {
        txt(`Lovhenvisning: ${lawRefText}`, MARGIN + 26, y, italic, FONT.xs, C.primary);
        y -= FONT.xs * LH + 2;
      }

      y = wrappedText(`Handling: ${issue.action}`, MARGIN + 26, y, CONTENT_WIDTH - 36, regular, FONT.sm, C.text);
      y -= 10;
    }

    y -= 4;
    line(MARGIN, A4_WIDTH - MARGIN, y);
    y -= 18;
  }

  // ── ACTION PLAN TABLE ──────────────────────────────────────────────────────
  ensureSpace(80);
  txt('Prioriteret handlingsplan', MARGIN, y, bold, FONT.lg, C.primary);
  y -= 22;

  const col = {
    pW: CONTENT_WIDTH * 0.07,
    tW: CONTENT_WIDTH * 0.43,
    dW: CONTENT_WIDTH * 0.25,
    eW: CONTENT_WIDTH * 0.25,
  };

  // Table header
  const thH = 22;
  rect(MARGIN, y - thH, CONTENT_WIDTH, thH, C.primary);
  let cx2 = MARGIN + 8;
  txt('#', cx2, y - thH / 2 - 3, bold, FONT.sm, C.white);
  cx2 += col.pW;
  txt('Handling', cx2, y - thH / 2 - 3, bold, FONT.sm, C.white);
  cx2 += col.tW;
  txt('Deadline', cx2, y - thH / 2 - 3, bold, FONT.sm, C.white);
  cx2 += col.dW;
  txt('Tidsforbrug', cx2, y - thH / 2 - 3, bold, FONT.sm, C.white);
  y -= thH;

  // Table rows
  for (let i = 0; i < report.actionPlan.length; i++) {
    const item = report.actionPlan[i];
    const titleLines = wrapText(item.title, regular, FONT.sm, col.tW - 10);
    const rowH = Math.max(22, titleLines.length * FONT.sm * LH + 10);

    ensureSpace(rowH + 2);

    if (i % 2 === 0) {
      rect(MARGIN, y - rowH, CONTENT_WIDTH, rowH, C.lightGray);
    }
    line(MARGIN, A4_WIDTH - MARGIN, y - rowH, C.border);

    let rx = MARGIN + 8;
    txt(String(item.priority), rx, y - 14, bold, FONT.sm, C.primary);
    rx += col.pW;

    let tly = y - 10;
    for (const tl of titleLines) {
      txt(tl, rx, tly, regular, FONT.sm, C.text);
      tly -= FONT.sm * LH;
    }

    rx += col.tW;
    txt(item.deadlineRecommendation, rx, y - 14, regular, FONT.sm, C.gray);
    rx += col.dW;
    txt(item.estimatedTime, rx, y - 14, regular, FONT.sm, C.gray);

    y -= rowH;
  }

  y -= 25;

  // ── DISCLAIMER ─────────────────────────────────────────────────────────────
  const discText =
    'Denne rapport er AI-genereret og erstatter ikke individuel juridisk rådgivning fra en advokat eller juridisk rådgiver. ' +
    'Retsklar påtager sig intet ansvar for beslutninger truffet på baggrund af denne rapport. ' +
    'Kontakt en juridisk rådgiver for specifik rådgivning om din situation.';

  const discLines = wrapText(discText, regular, FONT.sm, CONTENT_WIDTH - 24);
  const discH = discLines.length * FONT.sm * LH + 28;

  ensureSpace(discH + 10);

  rect(MARGIN, y - discH, CONTENT_WIDTH, discH, C.warnBg, C.warnBorder, 1);
  txt('Ansvarsfraskrivelse', MARGIN + 12, y - 16, bold, FONT.sm, C.warnText);

  let dy = y - 30;
  for (const dl of discLines) {
    txt(dl, MARGIN + 12, dy, regular, FONT.sm, C.warnText);
    dy -= FONT.sm * LH;
  }

  // ── FOOTERS (drawn on every page) ─────────────────────────────────────────
  const total = pages.length;
  for (let i = 0; i < total; i++) {
    const p = pages[i];
    const fy = MARGIN - 10;

    p.drawLine({
      start: { x: MARGIN, y: fy + 14 },
      end: { x: A4_WIDTH - MARGIN, y: fy + 14 },
      thickness: 0.5,
      color: C.border,
    });

    p.drawText(sanitize(dateStr), { x: MARGIN, y: fy, font: regular, size: FONT.xs, color: C.gray });

    const brand = 'Genereret af Retsklar.dk';
    const bw = regular.widthOfTextAtSize(sanitize(brand), FONT.xs);
    p.drawText(sanitize(brand), {
      x: (A4_WIDTH - bw) / 2,
      y: fy,
      font: regular,
      size: FONT.xs,
      color: C.gray,
    });

    const pg = `Side ${i + 1} af ${total}`;
    const pw = regular.widthOfTextAtSize(pg, FONT.xs);
    p.drawText(pg, {
      x: A4_WIDTH - MARGIN - pw,
      y: fy,
      font: regular,
      size: FONT.xs,
      color: C.gray,
    });
  }

  return doc.save();
}
