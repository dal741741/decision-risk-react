import { INDICATORS } from '../data/rubrics';
import type { EvaluationContext, Notes, Scores } from '../types/risk';

export type LlmProvider = 'mock' | 'anthropic' | 'openai-compatible' | 'Arivue';

export interface AnalyzeRiskInput {
  provider: LlmProvider;
  apiKey: string;
  endpoint?: string;
  modelName: string;
  context: EvaluationContext;
  scores: Scores;
  indicatorNotes: Notes;
  composite: number;
  bandName: string;
  bandAction: string;
}

export function buildRiskPrompt(input: AnalyzeRiskInput): string {
  const indDetails = INDICATORS.map((indicator) => {
    const score = input.scores[indicator.code];
    const note = input.indicatorNotes[indicator.code].trim();
    return `- ${indicator.code}: Score ${score}/5 — Level means: "${indicator.hints[score]}"${note ? `. Note: ${note}` : ''}`;
  }).join('\n');

  return `You are a decision risk analysis expert. Analyze this AI decision risk evaluation and provide a structured, actionable report.

EVALUATION:
- Decision: ${input.context.decision}
- Industry: ${input.context.industry || 'Unspecified'}
- AI Model: ${input.context.model || 'Unspecified'}
- Evaluated By: ${input.context.evaluator || 'Anonymous'}
- Date: ${input.context.date}
- Notes: ${input.context.notes || 'None'}

INDICATOR SCORES (1=best, 5=worst):
${indDetails}

COMPOSITE SCORE: ${input.composite}/5.00 | RISK BAND: ${input.bandName} | ACTION: ${input.bandAction}

Provide:
1. A 2–3 sentence overall risk assessment specific to this decision and industry context.
2. The single biggest risk driver (highest score) and why it matters most for THIS specific decision.
3. For any indicator scored 3 or above: one concrete, specific mitigation step.
4. One decisive final recommendation sentence.

Be specific and direct. No generic advice.`;
}

export async function analyzeRisk(input: AnalyzeRiskInput): Promise<string> {
  if (input.provider === 'mock') {
    return mockAnalysis(input);
  }

   if (input.provider === 'Arivue') {
    const result = await getRiskAnalysis(input);
    return result;
  }

  const prompt = buildRiskPrompt(input);

  if (input.provider === 'anthropic') {
    return callAnthropic(input, prompt);
  }

  return callOpenAiCompatible(input, prompt);
}

async function callAnthropic(input: AnalyzeRiskInput, prompt: string): Promise<string> {
  if (!input.apiKey.trim()) throw new Error('API key is required.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': input.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: input.modelName || 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || 'Anthropic request failed.');

  return data.content?.map((block: { text?: string }) => block.text || '').join('') || 'Analysis unavailable.';
}

async function callOpenAiCompatible(input: AnalyzeRiskInput, prompt: string): Promise<string> {
  if (!input.apiKey.trim()) throw new Error('API key is required.');
  if (!input.endpoint?.trim()) throw new Error('Endpoint is required for OpenAI-compatible providers.');

  const response = await fetch(input.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer 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`
    },
    body: JSON.stringify({
      model: input.modelName,
      messages: [
        { role: 'system', content: 'You are a concise decision risk analysis expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });

  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || 'LLM request failed.');

  return data.choices?.[0]?.message?.content || 'Analysis unavailable.';
}

function mockAnalysis(input: AnalyzeRiskInput): string {
  const highest = INDICATORS.reduce((top, current) =>
    input.scores[current.code] > input.scores[top.code] ? current : top
  );

  const mitigations = INDICATORS
    .filter((indicator) => input.scores[indicator.code] >= 3)
    .map((indicator) => `For ${indicator.code}, document the issue and validate the decision with a human reviewer before execution.`)
    .join('\n');

  return `Overall risk is ${input.bandName.toLowerCase()} for this decision because the composite score is ${input.composite.toFixed(2)}/5.00. The recommended action is: ${input.bandAction}.

The biggest risk driver is ${highest.code} (${highest.name}) because it has the highest score and can directly affect whether the AI recommendation should be trusted for this decision.

${mitigations || 'All indicators are below 3, so standard monitoring is sufficient.'}

Final recommendation: ${input.bandAction}.`;
}

async function getRiskAnalysis(input: AnalyzeRiskInput): Promise<string> {

  // Post request 
  const response = await fetch("https://decision-risk-api.vercel.app/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      decision: input.context.decision,
      industry: input.context.industry,
      model_name: input.context.model,
      evaluated_by: "",

      dq: input.scores.DQ,
      ov: input.scores.OV,
      ca: input.scores.CA,
      ms: input.scores.MS,

      notes: input.context.notes
    }),
  });

  const data = await response.json();

  console.log(data);

  return JSON.stringify(data, null, 2);
}
 

