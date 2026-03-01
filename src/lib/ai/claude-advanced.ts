/**
 * Advanced Claude API wrapper for multi-agent pipeline.
 * Supports: prompt caching, tool_use, extended thinking, streaming.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { createLogger, requireEnv } from "@/lib/logger";

let _client: Anthropic | null = null;

function getClient() {
  if (!_client) {
    _client = new Anthropic({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
      timeout: 10 * 60 * 1000, // 10 minutes
    });
  }
  return _client;
}

const log = createLogger("Claude");
const MODEL = "claude-sonnet-4-6";

export interface CallClaudeOptions {
  systemPrompt: string;
  userMessage: string;
  tools?: Tool[];
  toolChoice?: { type: "tool"; name: string } | { type: "any" };
  enableThinking?: boolean;
  thinkingBudget?: number;
  maxTokens?: number;
  useCache?: boolean;
  requestContext?: string;
}

export interface CallClaudeResult {
  text: string | null;
  toolUse: { name: string; input: unknown } | null;
}

/**
 * Shared request helper: streams the response and returns the final message.
 * Uses streaming to avoid SDK timeout limits on large max_tokens.
 */
async function doStreamRequest(
  client: Anthropic,
  params: Record<string, unknown>,
  context?: string
): Promise<Anthropic.Messages.Message> {
  const ctx = context ? `[${context}]` : "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const callStart = Date.now();
    try {
      log.info(`${ctx} API call attempt ${attempt + 1}/3`);
      const { stream: _ignored, ...streamParams } = params;
      const stream = client.messages.stream(streamParams as Parameters<typeof client.messages.stream>[0]);
      const response = await stream.finalMessage();
      log.info(`${ctx} API call completed in ${((Date.now() - callStart) / 1000).toFixed(1)}s`);
      return response;
    } catch (err: unknown) {
      const elapsed = ((Date.now() - callStart) / 1000).toFixed(1);
      const status = (err as { status?: number })?.status;
      const headers = (err as { headers?: { get?: (n: string) => string } })?.headers;
      const retryAfter = headers?.get?.("retry-after") ?? headers?.get?.("Retry-After");
      // Retry on 429 (rate limit) and 529 (overloaded) — both are transient
      const isRetryable = status === 429 || status === 529;
      if (isRetryable && attempt < 2) {
        const retryAfterMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : null;
        const exponentialMs = 5000 * Math.pow(2, attempt); // 5s, 10s
        const waitMs = retryAfterMs
          ? Math.max(retryAfterMs, 5000)
          : Math.min(exponentialMs, 30000);
        log.warn(`${ctx} HTTP ${status} after ${elapsed}s — waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt + 1}/3)`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      log.error(`${ctx} API call failed after ${elapsed}s: status=${status ?? "unknown"}`);
      throw err;
    }
  }
  throw new Error(`${ctx} Max retries exceeded`);
}

function extractResult(response: Anthropic.Messages.Message): CallClaudeResult {
  const content = response.content ?? [];
  if (response.stop_reason === "max_tokens") {
    log.warn('ADVARSEL: Response trunkeret (stop_reason=max_tokens). Output kan være ufuldstændigt.');
  }
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

export async function callClaudeAdvanced(options: CallClaudeOptions): Promise<CallClaudeResult> {
  const client = getClient();

  const systemContent =
    options.useCache !== false
      ? [{ type: "text" as const, text: options.systemPrompt, cache_control: { type: "ephemeral" as const } }]
      : options.systemPrompt;

  const params: Record<string, unknown> = {
    model: MODEL,
    max_tokens: options.maxTokens ?? 16384,
    system: systemContent,
    messages: [{ role: "user" as const, content: options.userMessage }],
    ...(options.tools?.length
      ? {
          tools: options.tools,
          tool_choice:
            options.enableThinking
              ? { type: "auto" as const }
              : (options.toolChoice ?? { type: "any" as const }),
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
  };

  const response = await doStreamRequest(client, params, options.requestContext);
  return extractResult(response);
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

  const buildParams = (msgs: Message[]): Record<string, unknown> => ({
    model: MODEL,
    max_tokens: options.maxTokens ?? 16384,
    system: systemContent,
    messages: msgs,
    ...(options.tools?.length
      ? {
          tools: options.tools,
          tool_choice:
            options.enableThinking
              ? { type: "auto" as const }
              : (options.toolChoice ?? { type: "any" as const }),
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
  });

  for (let round = 0; round < maxRounds; round++) {
    log.info(`[${options.requestContext ?? "tool-loop"}] Tool round ${round + 1}/${maxRounds}`);
    const response = await doStreamRequest(client, buildParams(messages), options.requestContext);
    const content = response.content ?? [];
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