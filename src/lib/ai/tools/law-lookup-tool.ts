/**
 * Anthropic tool_use definition for law lookup.
 * Agents use this to fetch law text on demand instead of receiving full texts in the prompt.
 */

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const lawLookupTool: Tool = {
  name: "lookup_law",
  description:
    "Slå op i den danske lovdatabase. Returnerer lovtekst for den specificerede lov og evt. specifikke paragraffer. Brug dette til at verificere lovhenvisninger og finde præcis lovtekst. Du kan kalde dette tool flere gange.",
  input_schema: {
    type: "object",
    properties: {
      lawId: {
        type: "string",
        description:
          "ID for loven, fx 'ophavsretsloven', 'selskabsloven', 'databeskyttelsesloven'",
      },
      paragraphs: {
        type: "string",
        description:
          "Valgfrit. Specifikke paragraffer, fx '§§ 53-59', '§ 15a', '§ 3, stk. 1'. Udelad for at få hele loven.",
      },
    },
    required: ["lawId"],
  },
};
