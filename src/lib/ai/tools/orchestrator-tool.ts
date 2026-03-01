/**
 * Slim tool_use schema for orchestrator output.
 * Only scoring + prioritized action plan — no specialist data duplication.
 */

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const orchestratorTool: Tool = {
  name: "submit_report",
  description: "Submit scoring and prioritized action plan (specialist areas are merged separately)",
  input_schema: {
    type: "object" as const,
    required: ["overallScore", "scoreLevel", "scoreSummary", "areaScores", "actionPlan"],
    properties: {
      overallScore: { type: "number", minimum: 0, maximum: 100 },
      scoreLevel: { type: "string", enum: ["red", "yellow", "green"] },
      scoreSummary: { type: "string", description: "2-3 sætninger, max 100 ord" },
      areaScores: {
        type: "array",
        description: "Score per specialist-område",
        items: {
          type: "object",
          required: ["area", "score", "status"],
          properties: {
            area: { type: "string", description: "Area ID fra specialist (fx 'gdpr', 'employment')" },
            score: { type: "number", minimum: 0, maximum: 100 },
            status: { type: "string", enum: ["critical", "warning", "ok"] },
          },
        },
      },
      actionPlan: {
        type: "array",
        description: "Top 10 prioriterede handlinger cherry-picked fra specialists",
        items: {
          type: "object",
          required: ["priority", "title", "description", "area", "riskLevel", "timeEstimate", "deadline"],
          properties: {
            priority: { type: "number" },
            title: { type: "string" },
            description: { type: "string", description: "Kort, 1 sætning" },
            area: { type: "string" },
            riskLevel: { type: "string", enum: ["critical", "important", "recommended"] },
            timeEstimate: { type: "string" },
            deadline: { type: "string" },
          },
        },
      },
    },
  },
};
