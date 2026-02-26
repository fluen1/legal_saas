/**
 * Retsklar Document Design System
 * All formatting via document-level styles — zero inline run formatting.
 * Authoritative source: RETSKLAR-DOCX-SPEC.md
 */
import {
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
  type INumberingOptions,
  type ISectionPropertiesOptions,
  type IStylesOptions,
} from "docx";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const DS = {
  // Colours (pixel-matched to retsklar.dk — navy, not violet)
  NAVY: "0F172A",
  NAVY_MID: "1E293B",
  ACCENT: "1D4ED8",
  ACCENT_MID: "2563EB",
  ACCENT_LIGHT: "DBEAFE",
  ACCENT_FAINT: "EFF6FF",
  TEAL: "0D9488",
  TEAL_LIGHT: "CCFBF1",
  WARNING: "EA580C",
  WARNING_LT: "FFF7ED",
  DARK: "0F172A",
  MEDIUM: "475569",
  LIGHT: "94A3B8",
  BORDER: "E2E8F0",
  BG_LIGHT: "F8FAFC",
  WHITE: "FFFFFF",

  // Page (A4 DXA)
  PAGE_W: 11906,
  PAGE_H: 16838,
  MARGIN_TOP: 1200,
  MARGIN_BOTTOM: 1200,
  MARGIN_LEFT: 1300,
  MARGIN_RIGHT: 1300,
  CONTENT_W: 9306,
} as const;

/* ------------------------------------------------------------------ */
/*  Borders                                                            */
/* ------------------------------------------------------------------ */

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: DS.BORDER };
const noBorder = { style: BorderStyle.NONE, size: 0, color: DS.WHITE };

export const borders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};
export const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
};

/* ------------------------------------------------------------------ */
/*  Document-level styles (§5 + §6)                                    */
/* ------------------------------------------------------------------ */

export function getDocStyles(): IStylesOptions {
  return {
    default: {
      document: {
        run: { font: "Calibri", size: 22, color: DS.DARK },
        paragraph: { spacing: { after: 160, line: 276 } },
      },
    },
    paragraphStyles: [
      // --- Headings ---
      {
        id: "Heading1", name: "Heading 1",
        basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Georgia", color: DS.NAVY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2",
        basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Georgia", color: DS.NAVY },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3",
        basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: DS.NAVY },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
      // --- Title page ---
      {
        id: "DocumentTitle", name: "Document Title",
        basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Georgia", color: DS.NAVY },
        paragraph: { spacing: { before: 600, after: 80 }, alignment: AlignmentType.CENTER },
      },
      {
        id: "Subtitle", name: "Subtitle",
        basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, italics: true, color: DS.MEDIUM },
        paragraph: { spacing: { after: 200 }, alignment: AlignmentType.CENTER },
      },
      // --- Text variants ---
      {
        id: "SmallText", name: "Small Text",
        basedOn: "Normal", quickFormat: true,
        run: { size: 20, color: DS.MEDIUM },
        paragraph: { spacing: { after: 80 } },
      },
      {
        id: "TinyText", name: "Tiny Text",
        basedOn: "Normal", quickFormat: true,
        run: { size: 18, color: DS.LIGHT },
        paragraph: { spacing: { after: 60 } },
      },
      // --- Boxes ---
      {
        id: "BoxTitle", name: "Box Title",
        basedOn: "Normal", quickFormat: true,
        run: { size: 22, bold: true },
        paragraph: { spacing: { after: 60 } },
      },
      {
        id: "BoxBody", name: "Box Body",
        basedOn: "Normal", quickFormat: true,
        run: { size: 20, italics: true, color: DS.MEDIUM },
        paragraph: { spacing: { after: 0 } },
      },
      {
        id: "DisclaimerText", name: "Disclaimer Text",
        basedOn: "Normal", quickFormat: true,
        run: { size: 20, italics: true, color: DS.MEDIUM },
        paragraph: { spacing: { after: 80 } },
      },
      // --- CTA ---
      {
        id: "CTATitle", name: "CTA Title",
        basedOn: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Georgia", color: DS.NAVY },
        paragraph: { spacing: { after: 80 }, alignment: AlignmentType.CENTER },
      },
      // --- Lists ---
      {
        id: "CheckboxItem", name: "Checkbox Item",
        basedOn: "Normal", quickFormat: true,
        run: { size: 22, color: DS.DARK },
        paragraph: { spacing: { after: 80 } },
      },
      // --- Tables ---
      {
        id: "TableHeaderPara", name: "Table Header",
        basedOn: "Normal", quickFormat: true,
        run: { size: 22, bold: true, color: DS.WHITE },
        paragraph: { spacing: { after: 0 } },
      },
      {
        id: "TableCellPara", name: "Table Cell",
        basedOn: "Normal", quickFormat: true,
        run: { size: 22, color: DS.DARK },
        paragraph: { spacing: { after: 0 } },
      },
    ],
    characterStyles: [
      // --- Branding (header) ---
      {
        id: "BrandNameChar", name: "Brand Name",
        basedOn: "DefaultParagraphFont",
        run: { font: "Georgia", size: 28, bold: true, color: DS.NAVY },
      },
      {
        id: "BrandSuffixChar", name: "Brand Suffix",
        basedOn: "DefaultParagraphFont",
        run: { font: "Georgia", size: 28, color: DS.LIGHT },
      },
      // --- Branding (title page, large) ---
      {
        id: "BrandNameLargeChar", name: "Brand Name Large",
        basedOn: "DefaultParagraphFont",
        run: { font: "Georgia", size: 48, bold: true, color: DS.NAVY },
      },
      {
        id: "BrandSuffixLargeChar", name: "Brand Suffix Large",
        basedOn: "DefaultParagraphFont",
        run: { font: "Georgia", size: 48, color: DS.LIGHT },
      },
      // --- Section numbers ---
      {
        id: "AccentNumberChar", name: "Accent Number",
        basedOn: "DefaultParagraphFont",
        run: { font: "Georgia", size: 30, bold: true, color: DS.ACCENT },
      },
      // --- Box titles ---
      {
        id: "BoxTitleAccentChar", name: "Box Title Accent",
        basedOn: "DefaultParagraphFont",
        run: { bold: true, color: DS.ACCENT },
      },
      {
        id: "BoxTitleWarningChar", name: "Box Title Warning",
        basedOn: "DefaultParagraphFont",
        run: { bold: true, color: DS.WARNING },
      },
      {
        id: "BoxTitleDisclaimerChar", name: "Box Title Disclaimer",
        basedOn: "DefaultParagraphFont",
        run: { bold: true, color: DS.MEDIUM },
      },
      // --- Hyperlinks ---
      {
        id: "HyperlinkChar", name: "Hyperlink",
        basedOn: "DefaultParagraphFont",
        run: { color: DS.ACCENT_MID, underline: { type: UnderlineType.SINGLE } },
      },
      // --- Footer ---
      {
        id: "FooterBrandChar", name: "Footer Brand",
        basedOn: "DefaultParagraphFont",
        run: { size: 18, bold: true, color: DS.NAVY },
      },
      {
        id: "FooterLinkChar", name: "Footer Link",
        basedOn: "DefaultParagraphFont",
        run: { size: 18, color: DS.ACCENT_MID },
      },
      {
        id: "FooterMutedChar", name: "Footer Muted",
        basedOn: "DefaultParagraphFont",
        run: { size: 18, color: DS.LIGHT },
      },
      // --- Fill field label ---
      {
        id: "FieldLabelChar", name: "Field Label",
        basedOn: "DefaultParagraphFont",
        run: { bold: true },
      },
      // --- Bullet bold prefix ---
      {
        id: "BoldPrefixChar", name: "Bold Prefix",
        basedOn: "DefaultParagraphFont",
        run: { bold: true },
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Numbering (§7)                                                     */
/* ------------------------------------------------------------------ */

export function getNumbering(): INumberingOptions {
  return {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 260 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 360 } } },
        }],
      },
      {
        reference: "checkboxEmpty",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2610",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 540, hanging: 360 } },
            run: { font: "Segoe UI Symbol", size: 22 },
          },
        }],
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Section properties                                                 */
/* ------------------------------------------------------------------ */

export function sectionProps(): ISectionPropertiesOptions {
  return {
    page: {
      size: { width: DS.PAGE_W, height: DS.PAGE_H },
      margin: {
        top: DS.MARGIN_TOP,
        bottom: DS.MARGIN_BOTTOM,
        left: DS.MARGIN_LEFT,
        right: DS.MARGIN_RIGHT,
      },
    },
  };
}

export function sectionHeaders() {
  return { default: makeHeader() };
}

export function sectionFooters() {
  return { default: makeFooter() };
}

/* ------------------------------------------------------------------ */
/*  Header / Footer (§8.1, §8.2) — char styles, no inline             */
/* ------------------------------------------------------------------ */

function makeHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: DS.ACCENT, space: 8 },
        },
        children: [
          new TextRun({ text: "Retsklar", style: "BrandNameChar" }),
          new TextRun({ text: ".dk", style: "BrandSuffixChar" }),
        ],
      }),
    ],
  });
}

function makeFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.SINGLE, size: 4, color: DS.BORDER, space: 8 },
        },
        children: [
          new TextRun({ text: "Genereret af ", style: "FooterMutedChar" }),
          new TextRun({ text: "Retsklar.dk", style: "FooterBrandChar" }),
          new TextRun({ text: " \u2022 ", style: "FooterMutedChar" }),
          new TextRun({ text: "kontakt@retsklar.dk", style: "FooterLinkChar" }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Side ", style: "FooterMutedChar" }),
          new TextRun({ children: [PageNumber.CURRENT], style: "FooterMutedChar" }),
        ],
      }),
    ],
  });
}

/* ------------------------------------------------------------------ */
/*  Components (§8) — all use styles, zero inline formatting           */
/* ------------------------------------------------------------------ */

/** §8.3 Title-page hero */
export function titleHero(title: string, subtitle: string): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Retsklar", style: "BrandNameLargeChar" }),
        new TextRun({ text: ".dk", style: "BrandSuffixLargeChar" }),
      ],
    }),
    new Paragraph({
      style: "DocumentTitle",
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 8, color: DS.ACCENT, space: 16 },
      },
      children: [new TextRun({ text: title })],
    }),
    new Paragraph({
      style: "Subtitle",
      children: [new TextRun({ text: subtitle })],
    }),
  ];
}

/** §8.4 Section heading with accent number */
export function sectionHeading(num: string, title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [
      new TextRun({ text: `${num}. `, style: "AccentNumberChar" }),
      new TextRun({ text: title }),
    ],
  });
}

/** 1-cell box table helper */
function boxTable(opts: {
  bg: string;
  borderColor: string;
  leftBorderSize?: number;
  children: Paragraph[];
}): Table {
  const left = { style: BorderStyle.SINGLE, size: opts.leftBorderSize ?? 18, color: opts.borderColor };
  const other = { style: BorderStyle.SINGLE, size: 1, color: opts.borderColor };
  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths: [DS.CONTENT_W],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: DS.CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: opts.bg, color: "auto" },
        borders: { top: other, bottom: other, right: other, left },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: opts.children,
      })],
    })],
  });
}

/** §8.5 Lovhenvisningsboks (blue) */
export function lawRefBox(law: string, action: string): Table {
  return boxTable({
    bg: DS.ACCENT_LIGHT,
    borderColor: DS.ACCENT,
    children: [
      new Paragraph({
        style: "BoxTitle",
        children: [
          new TextRun({ text: "\u2696\uFE0F  " + law, style: "BoxTitleAccentChar" }),
        ],
      }),
      new Paragraph({
        style: "BoxBody",
        children: [new TextRun({ text: action })],
      }),
    ],
  });
}

/** §8.6 Info-boks (blue) */
export function infoBox(title: string, text: string): Table {
  return boxTable({
    bg: DS.ACCENT_LIGHT,
    borderColor: DS.ACCENT,
    children: [
      new Paragraph({
        style: "BoxTitle",
        children: [
          new TextRun({ text: "\u2139\uFE0F  " + title, style: "BoxTitleAccentChar" }),
        ],
      }),
      new Paragraph({
        style: "BoxBody",
        children: [new TextRun({ text })],
      }),
    ],
  });
}

/** §8.7 Advarselsboks (orange) */
export function warningBox(title: string, text: string): Table {
  return boxTable({
    bg: DS.WARNING_LT,
    borderColor: DS.WARNING,
    children: [
      new Paragraph({
        style: "BoxTitle",
        children: [
          new TextRun({ text: "\u26A0\uFE0F  " + title, style: "BoxTitleWarningChar" }),
        ],
      }),
      new Paragraph({
        style: "BoxBody",
        children: [new TextRun({ text })],
      }),
    ],
  });
}

/** §8.8 Disclaimer-boks (grey, uniform borders) */
export function disclaimerBox(text: string): Table {
  const thin = { style: BorderStyle.SINGLE, size: 1, color: DS.BORDER };
  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths: [DS.CONTENT_W],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: DS.CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: DS.BG_LIGHT, color: "auto" },
        borders: { top: thin, bottom: thin, left: thin, right: thin },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: [
          new Paragraph({
            style: "DisclaimerText",
            children: [
              new TextRun({ text: "Disclaimer: ", style: "BoxTitleDisclaimerChar" }),
              new TextRun({ text }),
            ],
          }),
        ],
      })],
    })],
  });
}

/** §8.9 CTA-boks */
export function ctaBox(text: string, url: string): Table {
  const thin = { style: BorderStyle.SINGLE, size: 1, color: DS.ACCENT };
  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths: [DS.CONTENT_W],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: DS.CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: DS.ACCENT_FAINT, color: "auto" },
        borders: { top: thin, bottom: thin, left: thin, right: thin },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: [
          new Paragraph({
            style: "CTATitle",
            children: [new TextRun({ text })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new ExternalHyperlink({
                link: `https://${url}`,
                children: [
                  new TextRun({ text: url, style: "HyperlinkChar" }),
                ],
              }),
            ],
          }),
        ],
      })],
    })],
  });
}

/** §8.10 Checkbox item */
export function checkboxItem(text: string): Paragraph {
  return new Paragraph({
    style: "CheckboxItem",
    numbering: { reference: "checkboxEmpty", level: 0 },
    children: [new TextRun({ text })],
  });
}

/** Bullet item with optional bold prefix */
export function bulletItem(text: string, opts?: { boldPrefix?: string }): Paragraph {
  const children: TextRun[] = [];
  if (opts?.boldPrefix) {
    children.push(new TextRun({ text: `${opts.boldPrefix} `, style: "BoldPrefixChar" }));
  }
  children.push(new TextRun({ text }));
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children,
  });
}

/** §8.11 Fill-field (label + underline) */
export function fillField(label: string): Table {
  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths: [3000, 6306],
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          borders: noBorders,
          margins: { top: 40, bottom: 40, left: 0, right: 80 },
          children: [
            new Paragraph({
              spacing: { after: 0 },
              children: [
                new TextRun({ text: `${label}:`, style: "FieldLabelChar" }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 6306, type: WidthType.DXA },
          borders: {
            top: noBorder, left: noBorder, right: noBorder,
            bottom: { style: BorderStyle.SINGLE, size: 2, color: DS.LIGHT },
          },
          margins: { top: 40, bottom: 40, left: 0, right: 0 },
          children: [new Paragraph({ spacing: { after: 0 }, children: [] })],
        }),
      ],
    })],
  });
}

/** §8.12 Data table */
export function makeTable(headers: string[], rows: string[][], columnWidths: number[]): Table {
  const headerCells = headers.map((h, i) =>
    new TableCell({
      width: { size: columnWidths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: DS.NAVY, color: "auto" },
      borders,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          style: "TableHeaderPara",
          children: [new TextRun({ text: h })],
        }),
      ],
    })
  );

  const bodyRows = rows.map((row, rowIdx) =>
    new TableRow({
      children: row.map((cell, colIdx) =>
        new TableCell({
          width: { size: columnWidths[colIdx], type: WidthType.DXA },
          shading: {
            type: ShadingType.CLEAR,
            fill: rowIdx % 2 === 0 ? DS.ACCENT_FAINT : DS.WHITE,
            color: "auto",
          },
          borders,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              style: "TableCellPara",
              children: [new TextRun({ text: cell })],
            }),
          ],
        })
      ),
    })
  );

  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths,
    rows: [new TableRow({ children: headerCells }), ...bodyRows],
  });
}

/** Normal body paragraph — inherits all from document default */
export function bodyText(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text })],
  });
}

/** Page break */
export function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}
