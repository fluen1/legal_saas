/**
 * Advanced Claude API wrapper for multi-agent pipeline.
 * Supports: prompt caching, tool_use, extended thinking.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

let _client: Anthropic | null = null;

function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

const MODEL = "claude-opus-4-6";

export interface CallClaudeOptions {
  systemPrompt: string;
  userMessage: string;
  tools?: Tool[];
  toolChoice?: { type: "tool"; name: string } | { type: "any" };
  enableThinking?: boolean;
  thinkingBudget?: number;
  useCache?: boolean;
}

export interface CallClaudeResult {
  text: string | null;
  toolUse: { name: string; input: unknown } | null;
}

export async function callClaudeAdvanced(options: CallClaudeOptions): Promise<CallClaudeResult> {
  const client = getClient();

  const systemContent =
    options.useCache !== false
      ? [{ type: "text" as const, text: options.systemPrompt, cache_control: { type: "ephemeral" as const } }]
      : options.systemPrompt;

  const createParams = {
    model: MODEL,
    max_tokens: 16384,
    system: systemContent,
    messages: [{ role: "user" as const, content: options.userMessage }],
    ...(options.tools?.length
      ? {
          tools: options.tools,
          tool_choice:
            options.enableThinking
              ? ({ type: "auto" as const } as const)
              : (options.toolChoice ?? ({ type: "any" as const } as const)),
        }
      : {}),
  };

  const finalParams = {
    ...createParams,
    stream: false as const,
    ...(options.enableThinking
      ? {
          thinking: {
            type: "enabled" as const,
            budget_tokens: options.thinkingBudget ?? 5000,
          },
        }
      : {}),
  } as Parameters<typeof client.messages.create>[0];

  let response!: Awaited<ReturnType<typeof client.messages.create>>;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await client.messages.create(finalParams);
      break;
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const headers = (err as { headers?: { get?: (n: string) => string } })?.headers;
      const retryAfter = headers?.get?.("retry-after") ?? headers?.get?.("Retry-After");
      if (status === 429 && attempt < 2) {
        const suggested = retryAfter ? parseInt(retryAfter, 10) * 1000 : 120000;
        const waitMs = Math.max(suggested, 60000);
        console.warn(`[Claude] Rate limit 429 — venter ${Math.round(waitMs / 1000)}s...`);
        await new Promise((r) => setTimeout(r, waitMs));
        console.warn(`[Claude] Forsøger igen (forsøg ${attempt + 2}/3)...`);
        continue;
      }
      throw err;
    }
  }

  const content = "content" in response ? response.content : [];
  const toolBlock = content.find((b) => b.type === "tool_use");
  const textBlock = content.find((b) => b.type === "text");

  return {
    text: textBlock && textBlock.type === "text" ? textBlock.text : null,
    toolUse:
      toolBlock && toolBlock.type === "tool_use"
        ? { name: toolBlock.name, input: toolBlock.input }
        : null,
  };
}

export type ToolExecutor = (name: string, input: unknown) => Promise<string>;

export interface CallClaudeWithToolLoopOptions extends CallClaudeOptions {
  executeTool: ToolExecutor;
  finalToolNames: string[];
  maxToolRounds?: number;
}

/**
 * Runs Claude with a tool loop: when Claude returns tool_use blocks,
 * executes them and continues until a final tool is returned.
 */
export async function callClaudeWithToolLoop(
  options: CallClaudeWithToolLoopOptions
): Promise<CallClaudeResult> {
  const client = getClient();
  const maxRounds = options.maxToolRounds ?? 8;
  const finalToolNames = new Set(options.finalToolNames);

  const systemContent =
    options.useCache !== false
      ? [{ type: "text" as const, text: options.systemPrompt, cache_control: { type: "ephemeral" as const } }]
      : options.systemPrompt;

  type Message = { role: "user" | "assistant"; content: string | unknown[] };
  const messages: Message[] = [{ role: "user", content: options.userMessage }];

  const createParams = (msgs: Message[]) =>
    ({
      model: MODEL,
      max_tokens: 16384,
      system: systemContent,
      messages: msgs,
      stream: false as const,
      ...(options.tools?.length
        ? {
            tools: options.tools,
            tool_choice:
              options.enableThinking
                ? ({ type: "auto" as const } as const)
                : (options.toolChoice ?? ({ type: "any" as const } as const)),
          }
        : {}),
      ...(options.enableThinking
        ? {
            thinking: {
              type: "enabled" as const,
              budget_tokens: options.thinkingBudget ?? 5000,
            },
          }
        : {}),
    }) as Parameters<typeof client.messages.create>[0];

  const doRequest = async (msgs: Message[]) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await client.messages.create(createParams(msgs));
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        const headers = (err as { headers?: { get?: (n: string) => string } })?.headers;
        const retryAfter = headers?.get?.("retry-after") ?? headers?.get?.("Retry-After");
        if (status === 429 && attempt < 2) {
          const suggested = retryAfter ? parseInt(retryAfter, 10) * 1000 : 120000;
          const waitMs = Math.max(suggested, 60000);
          console.warn(`[Claude] Rate limit 429 — venter ${Math.round(waitMs / 1000)}s...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        throw err;
      }
    }
    throw new Error("Max retries exceeded");
  };

  for (let round = 0; round < maxRounds; round++) {
    const response = await doRequest(messages);
    const content = "content" in response ? response.content : [];
    const toolUses = content.filter(
      (b) => "type" in b && b.type === "tool_use" && "id" in b && "name" in b && "input" in b
    ) as Array<{ type: "tool_use"; id: string; name: string; input: unknown }>;
    const textBlock = content.find((b) => "type" in b && b.type === "text");

    for (const tu of toolUses) {
      if (finalToolNames.has(tu.name)) {
        return {
          text: textBlock && "text" in textBlock ? textBlock.text : null,
          toolUse: { name: tu.name, input: tu.input },
        };
      }
    }

    if (toolUses.length === 0) {
      return {
        text: textBlock && "text" in textBlock ? textBlock.text : null,
        toolUse: null,
      };
    }

    const toolResults: { type: "tool_result"; tool_use_id: string; content: string }[] = [];
    for (const tu of toolUses) {
      const result = await options.executeTool(tu.name, tu.input);
      toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: result });
    }

    messages.push({ role: "assistant", content });
    messages.push({ role: "user", content: toolResults });
  }

  throw new Error(`Tool loop exceeded ${maxRounds} rounds without final tool`);
}
