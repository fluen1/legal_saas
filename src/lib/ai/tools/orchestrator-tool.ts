/**
 * tool_use schema for orchestrator output.
 */

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

const lawRefSchema = {
  type: "object" as const,
  required: ["law", "paragraph", "description", "url", "isEURegulation"],
  properties: {
    law: { type: "string" },
    paragraph: { type: "string" },
    stk: { type: "string" },
    description: { type: "string" },
    url: { type: "string" },
    isEURegulation: { type: "boolean" },
  },
};

const issueSchema = {
  type: "object" as const,
  required: [
    "title",
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
    description: { type: "string" },
    riskLevel: { type: "string", enum: ["critical", "important", "recommended"] },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    confidenceReason: { type: "string" },
    lawReferences: { type: "array", items: lawRefSchema },
    action: { type: "string" },
    timeEstimate: { type: "string" },
    deadline: { type: "string" },
  },
};

export const orchestratorTool: Tool = {
  name: "submit_report",
  description: "Submit the final orchestrated legal compliance report",
  input_schema: {
    type: "object" as const,
    required: ["overallScore", "scoreLevel", "scoreSummary", "areas", "actionPlan"],
    properties: {
      overallScore: { type: "number", minimum: 0, maximum: 100 },
      scoreLevel: { type: "string", enum: ["red", "yellow", "green"] },
      scoreSummary: { type: "string" },
      areas: {
        type: "array",
        items: {
          type: "object",
          required: ["area", "areaName", "status", "score", "issues", "positives", "summary"],
          properties: {
            area: { type: "string" },
            areaName: { type: "string" },
            status: { type: "string", enum: ["critical", "warning", "ok"] },
            score: { type: "number" },
            issues: { type: "array", items: issueSchema },
            positives: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
          },
        },
      },
      actionPlan: {
        type: "array",
        items: {
          type: "object",
          required: ["priority", "title", "description", "area", "riskLevel", "timeEstimate", "deadline", "lawReferences"],
          properties: {
            priority: { type: "number" },
            title: { type: "string" },
            description: { type: "string" },
            area: { type: "string" },
            riskLevel: { type: "string", enum: ["critical", "important", "recommended"] },
            timeEstimate: { type: "string" },
            deadline: { type: "string" },
            lawReferences: { type: "array", items: lawRefSchema },
          },
        },
      },
    },
  },
};
