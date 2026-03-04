/**
 * tool_use schema for specialist agent output.
 */

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const specialistTool: Tool = {
  name: "submit_analysis",
  description: "Submit the legal compliance analysis for this area",
  input_schema: {
    type: "object",
    required: ["area", "areaName", "status", "score", "issues", "positives", "summary"],
    properties: {
      area: { type: "string", enum: ["gdpr", "employment", "corporate", "contracts", "ip"] },
      areaName: { type: "string" },
      status: { type: "string", enum: ["critical", "warning", "ok"] },
      score: { type: "number", minimum: 0, maximum: 100 },
      issues: {
        type: "array",
        items: {
          type: "object",
          required: [
            "title",
            "teaser",
            "description",
            "riskLevel",
            "confidence",
            "confidenceReason",
            "lawReferences",
            "action",
            "timeEstimate",
            "deadline",
          ],
          properties: {
            title: { type: "string" },
            teaser: { type: "string", description: "One-sentence consequence (max 15 words). Focus on risk/cost/liability. No action verbs." },
            description: { type: "string" },
            riskLevel: { type: "string", enum: ["critical", "important", "recommended"] },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            confidenceReason: { type: "string" },
            lawReferences: {
              type: "array",
              items: {
                type: "object",
                required: ["law", "paragraph", "description", "url", "isEURegulation"],
                properties: {
                  law: { type: "string" },
                  paragraph: { type: "string" },
                  stk: { type: "string" },
                  description: { type: "string" },
                  url: { type: "string" },
                  isEURegulation: { type: "boolean" },
                },
              },
            },
            action: { type: "string" },
            timeEstimate: { type: "string" },
            deadline: { type: "string" },
          },
        },
      },
      positives: { type: "array", items: { type: "string" } },
      summary: { type: "string" },
    },
  },
};
