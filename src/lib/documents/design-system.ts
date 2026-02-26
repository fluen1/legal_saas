/**
 * Retsklar Document Design System
 * Shared styles, constants, and components for all DOCX documents.
 */
import {
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
  Footer,
  Header,
  LevelFormat,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type INumberingOptions,
  type IParagraphStyleOptions,
  type ISectionPropertiesOptions,
  type IStylesOptions,
  type ITableCellOptions,
} from "docx";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const DS = {
  // Colours
  PRIMARY: "6D28D9",
  PRIMARY_LIGHT: "EDE9FE",
  PRIMARY_MID: "8B5CF6",
  SECONDARY: "2563EB",
  SECONDARY_LT: "DBEAFE",
  TEAL: "0D9488",
  TEAL_LIGHT: "CCFBF1",
  WARNING: "EA580C",
  WARNING_LT: "FFF7ED",
  DARK: "1E293B",
  MEDIUM: "475569",
  LIGHT: "94A3B8",
  BORDER: "E2E8F0",
  BG_LIGHT: "F8FAFC",
  WHITE: "FFFFFF",

  // Fonts
  FONT_HEADING: "Georgia",
  FONT_BODY: "Calibri",
  FONT_SYMBOL: "Segoe UI Symbol",

  // Page (A4 DXA)
  PAGE_W: 11906,
  PAGE_H: 16838,
  MARGIN_TOP: 1200,
  MARGIN_BOTTOM: 1200,
  MARGIN_LEFT: 1300,
  MARGIN_RIGHT: 1300,
  CONTENT_W: 9306, // PAGE_W - MARGIN_LEFT - MARGIN_RIGHT
} as const;

/* ------------------------------------------------------------------ */
/*  Borders helpers                                                    */
/* ------------------------------------------------------------------ */

const thinBorder = (color = DS.BORDER) => ({
  style: BorderStyle.SINGLE,
  size: 1,
  color,
});

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: DS.WHITE,
};

export const borders = {
  top: thinBorder(),
  bottom: thinBorder(),
  left: thinBorder(),
  right: thinBorder(),
};

export const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
};

/* ------------------------------------------------------------------ */
/*  Document-level styles                                              */
/* ------------------------------------------------------------------ */

export function getDocStyles(): IStylesOptions {
  return {
    default: {
      document: {
        run: { font: DS.FONT_BODY, size: 22, color: DS.DARK },
        paragraph: { spacing: { after: 160, line: 276 } },
      },
      hyperlink: {
        run: { color: DS.SECONDARY, underline: {} },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 30, bold: true, font: DS.FONT_HEADING, color: DS.PRIMARY },
        paragraph: {
          spacing: { before: 360, after: 200 },
          outlineLevel: 0,
        },
      } as IParagraphStyleOptions,
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: DS.FONT_HEADING, color: DS.PRIMARY },
        paragraph: {
          spacing: { before: 280, after: 160 },
          outlineLevel: 1,
        },
      } as IParagraphStyleOptions,
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: DS.FONT_BODY, color: DS.DARK },
        paragraph: {
          spacing: { before: 200, after: 120 },
          outlineLevel: 2,
        },
      } as IParagraphStyleOptions,
      {
        id: "SmallText",
        name: "Small Text",
        basedOn: "Normal",
        quickFormat: true,
        run: { size: 20, color: DS.MEDIUM },
        paragraph: { spacing: { after: 80 } },
      } as IParagraphStyleOptions,
      {
        id: "TinyText",
        name: "Tiny Text",
        basedOn: "Normal",
        quickFormat: true,
        run: { size: 18, color: DS.LIGHT },
        paragraph: { spacing: { after: 60 } },
      } as IParagraphStyleOptions,
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Numbering                                                          */
/* ------------------------------------------------------------------ */

export function getNumbering(): INumberingOptions {
  return {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 540, hanging: 260 } },
            },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 540, hanging: 360 } },
            },
          },
        ],
      },
      {
        reference: "checkboxEmpty",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2610",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 540, hanging: 360 } },
              run: { font: DS.FONT_SYMBOL, size: 22 },
            },
          },
        ],
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Section properties (page size, margins, header, footer)            */
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

/** Headers config — place at section level (sibling of `properties`) */
export function sectionHeaders() {
  return { default: makeHeader() };
}

/** Footers config — place at section level (sibling of `properties`) */
export function sectionFooters() {
  return { default: makeFooter() };
}

function makeHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: DS.PRIMARY,
            space: 8,
          },
        },
        children: [
          new TextRun({
            text: "Retsklar",
            font: DS.FONT_HEADING,
            size: 28,
            bold: true,
            color: DS.PRIMARY,
          }),
          new TextRun({
            text: ".dk",
            font: DS.FONT_HEADING,
            size: 28,
            color: DS.LIGHT,
          }),
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
          top: {
            style: BorderStyle.SINGLE,
            size: 4,
            color: DS.BORDER,
            space: 8,
          },
        },
        children: [
          new TextRun({ text: "Genereret af ", size: 18, color: DS.LIGHT }),
          new TextRun({
            text: "Retsklar.dk",
            size: 18,
            color: DS.PRIMARY,
            bold: true,
          }),
          new TextRun({ text: " \u2022 ", size: 18, color: DS.LIGHT }),
          new TextRun({
            text: "kontakt@retsklar.dk",
            size: 18,
            color: DS.SECONDARY,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Side ", size: 18, color: DS.LIGHT }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
            color: DS.LIGHT,
          }),
        ],
      }),
    ],
  });
}

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

/** Title-page hero block (centred, decorative) */
export function titleHero(title: string, subtitle: string): Paragraph[] {
  return [
    // Spacer
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    // Brand
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Retsklar",
          font: DS.FONT_HEADING,
          size: 48,
          bold: true,
          color: DS.PRIMARY,
        }),
        new TextRun({
          text: ".dk",
          font: DS.FONT_HEADING,
          size: 48,
          color: DS.LIGHT,
        }),
      ],
    }),
    // Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: DS.PRIMARY_MID,
          space: 16,
        },
      },
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: title,
          font: DS.FONT_HEADING,
          size: 36,
          bold: true,
          color: DS.DARK,
        }),
      ],
    }),
    // Subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: subtitle,
          font: DS.FONT_BODY,
          size: 22,
          italics: true,
          color: DS.MEDIUM,
        }),
      ],
    }),
  ];
}

/** Section heading with coloured number prefix: "X. Title" */
export function sectionHeading(num: string, title: string): Paragraph {
  return new Paragraph({
    style: "Heading1",
    children: [
      new TextRun({
        text: `${num}. `,
        font: DS.FONT_HEADING,
        size: 30,
        bold: true,
        color: DS.PRIMARY_MID,
      }),
      new TextRun({
        text: title,
        font: DS.FONT_HEADING,
        size: 30,
        bold: true,
        color: DS.PRIMARY,
      }),
    ],
  });
}

/** 1-cell-table "card" box — used for law-ref, info, warning, disclaimer, CTA */
function boxTable(opts: {
  bg: string;
  borderColor: string;
  leftBorderSize?: number;
  children: Paragraph[];
}): Table {
  const leftBorder = {
    style: BorderStyle.SINGLE,
    size: opts.leftBorderSize ?? 18,
    color: opts.borderColor,
  };
  const otherBorder = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: opts.borderColor,
  };

  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths: [DS.CONTENT_W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: DS.CONTENT_W, type: WidthType.DXA },
            shading: {
              type: ShadingType.CLEAR,
              fill: opts.bg,
              color: "auto",
            },
            borders: {
              top: otherBorder,
              bottom: otherBorder,
              right: otherBorder,
              left: leftBorder,
            },
            margins: {
              top: 120,
              bottom: 120,
              left: 200,
              right: 200,
            },
            children: opts.children,
          }),
        ],
      }),
    ],
  });
}

/** Lovhenvisningsboks (purple) */
export function lawRefBox(law: string, action: string): Table {
  return boxTable({
    bg: DS.PRIMARY_LIGHT,
    borderColor: DS.PRIMARY_MID,
    children: [
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: "\u2696\uFE0F  ", size: 22 }),
          new TextRun({
            text: law,
            bold: true,
            size: 22,
            color: DS.PRIMARY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: action,
            italics: true,
            size: 20,
            color: DS.MEDIUM,
          }),
        ],
      }),
    ],
  });
}

/** Info-boks (blue) */
export function infoBox(title: string, text: string): Table {
  return boxTable({
    bg: DS.SECONDARY_LT,
    borderColor: DS.SECONDARY,
    children: [
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: "\u2139\uFE0F  ", size: 22 }),
          new TextRun({
            text: title,
            bold: true,
            size: 22,
            color: DS.SECONDARY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 0 },
        children: [
          new TextRun({ text, size: 20, color: DS.MEDIUM }),
        ],
      }),
    ],
  });
}

/** Advarselsboks (orange) */
export function warningBox(title: string, text: string): Table {
  return boxTable({
    bg: DS.WARNING_LT,
    borderColor: DS.WARNING,
    children: [
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: "\u26A0\uFE0F  ", size: 22 }),
          new TextRun({
            text: title,
            bold: true,
            size: 22,
            color: DS.WARNING,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 0 },
        children: [
          new TextRun({ text, size: 20, color: DS.MEDIUM }),
        ],
      }),
    ],
  });
}

/** Disclaimer-boks (grey, no fat left border) */
export function disclaimerBox(text: string): Table {
  const thin = { style: BorderStyle.SINGLE, size: 1, color: DS.BORDER };
  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths: [DS.CONTENT_W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: DS.CONTENT_W, type: WidthType.DXA },
            shading: {
              type: ShadingType.CLEAR,
              fill: DS.BG_LIGHT,
              color: "auto",
            },
            borders: { top: thin, bottom: thin, left: thin, right: thin },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  new TextRun({
                    text: "Disclaimer: ",
                    bold: true,
                    size: 20,
                    color: DS.MEDIUM,
                  }),
                  new TextRun({
                    text,
                    italics: true,
                    size: 20,
                    color: DS.MEDIUM,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** CTA-boks (purple, centred) */
export function ctaBox(text: string, url: string): Table {
  const thin = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: DS.PRIMARY_MID,
  };
  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths: [DS.CONTENT_W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: DS.CONTENT_W, type: WidthType.DXA },
            shading: {
              type: ShadingType.CLEAR,
              fill: DS.PRIMARY_LIGHT,
              color: "auto",
            },
            borders: { top: thin, bottom: thin, left: thin, right: thin },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text,
                    bold: true,
                    size: 26,
                    color: DS.PRIMARY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 0 },
                children: [
                  new ExternalHyperlink({
                    link: `https://${url}`,
                    children: [
                      new TextRun({
                        text: url,
                        style: "Hyperlink",
                        size: 22,
                        color: DS.SECONDARY,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Checkbox item (empty checkbox bullet) */
export function checkboxItem(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: "checkboxEmpty", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, color: DS.DARK })],
  });
}

/** Bullet item */
export function bulletItem(
  text: string,
  opts?: { boldPrefix?: string }
): Paragraph {
  const children: TextRun[] = [];
  if (opts?.boldPrefix) {
    children.push(
      new TextRun({
        text: `${opts.boldPrefix} `,
        bold: true,
        size: 22,
        color: DS.DARK,
      })
    );
  }
  children.push(new TextRun({ text, size: 22, color: DS.DARK }));

  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children,
  });
}

/** Fill-field for ejeraftale: label + underline */
export function fillField(label: string): Table {
  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths: [3000, 6306],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            borders: noBorders,
            margins: { top: 40, bottom: 40, left: 0, right: 80 },
            children: [
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  new TextRun({
                    text: `${label}:`,
                    bold: true,
                    size: 22,
                    color: DS.DARK,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 6306, type: WidthType.DXA },
            borders: {
              top: noBorder,
              left: noBorder,
              right: noBorder,
              bottom: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: DS.LIGHT,
              },
            },
            margins: { top: 40, bottom: 40, left: 0, right: 0 },
            children: [new Paragraph({ spacing: { after: 0 }, children: [] })],
          }),
        ],
      }),
    ],
  });
}

/** Data table with header row + alternating body rows */
export function makeTable(
  headers: string[],
  rows: string[][],
  columnWidths: number[]
): Table {
  const headerCells = headers.map(
    (h, i) =>
      new TableCell({
        width: { size: columnWidths[i], type: WidthType.DXA },
        shading: {
          type: ShadingType.CLEAR,
          fill: DS.PRIMARY,
          color: "auto",
        },
        borders,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: h,
                bold: true,
                size: 22,
                color: DS.WHITE,
              }),
            ],
          }),
        ],
      } as ITableCellOptions)
  );

  const bodyRows = rows.map(
    (row, rowIdx) =>
      new TableRow({
        children: row.map(
          (cell, colIdx) =>
            new TableCell({
              width: { size: columnWidths[colIdx], type: WidthType.DXA },
              shading: {
                type: ShadingType.CLEAR,
                fill: rowIdx % 2 === 0 ? DS.PRIMARY_LIGHT : DS.WHITE,
                color: "auto",
              },
              borders,
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  spacing: { after: 0 },
                  children: [
                    new TextRun({ text: cell, size: 22, color: DS.DARK }),
                  ],
                }),
              ],
            } as ITableCellOptions)
        ),
      })
  );

  return new Table({
    width: { size: DS.CONTENT_W, type: WidthType.DXA },
    columnWidths,
    rows: [new TableRow({ children: headerCells }), ...bodyRows],
  });
}

/** Normal body paragraph */
export function bodyText(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: DS.DARK })],
  });
}

/** Page break paragraph */
export function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}
