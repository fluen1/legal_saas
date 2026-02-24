import Anthropic from '@anthropic-ai/sdk';

let _anthropic: Anthropic | null = null;

function getClient() {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _anthropic;
}

export async function callClaude({
  systemPrompt,
  userPrompt,
  maxTokens = 4096,
  temperature = 0.3,
}: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }
  return textBlock.text;
}

/**
 * Asks Claude to fix invalid JSON. Used as retry when primary response fails to parse.
 */
export async function fixInvalidJSON(invalidJson: string): Promise<string> {
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    temperature: 0,
    system: 'You fix invalid JSON. Return ONLY valid JSON, no explanation, no markdown.',
    messages: [
      {
        role: 'user',
        content: `Fix this invalid JSON and return ONLY valid JSON:\n\n${invalidJson.slice(0, 50000)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }
  return textBlock.text;
}
