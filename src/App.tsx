import { useMemo, useState } from 'react';
import IndicatorCard from './components/IndicatorCard';
import ResultPanel from './components/ResultPanel';
import HistoryList from './components/HistoryList';
import { getBand, INDICATORS } from './data/rubrics';
import { analyzeRisk, type LlmProvider } from './services/llmService';
import type { EvaluationContext, IndicatorCode, Notes, Scores, EvaluationResult, RiskApiResponse } from './types/risk';

const today = () => new Date().toISOString().split('T')[0];
const initialScores: Scores = { DQ: 0, OV: 0, CA: 0, MS: 0 };
const initialNotes: Notes = { DQ: '', OV: '', CA: '', MS: '' };

export default function App() {
  const [provider, setProvider] = useState<LlmProvider>('Arivue');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('https://api.openai.com/v1/chat/completions');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [context, setContext] = useState<EvaluationContext>({
    decision: '',
    industry: '',
    model: '',
    evaluator: '',
    date: today(),
    notes: ''
  });
  const [scores, setScores] = useState<Scores>(initialScores);
  const [indicatorNotes, setIndicatorNotes] = useState<Notes>(initialNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RiskApiResponse | null>(null);
  const [history, setHistory] = useState<RiskApiResponse[]>([]);

  const allScored = useMemo(() => Object.values(scores).every((value) => value > 0), [scores]);
  const canEvaluate = context.decision.trim() && allScored && (provider === 'Arivue' || apiKey.trim());

  const composite = useMemo(() => {
    const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
    return Number((total / 4).toFixed(2));
  }, [scores]);

  function updateContext(field: keyof EvaluationContext, value: string) {
    setContext((previous) => ({ ...previous, [field]: value }));
  }

  function updateScore(code: IndicatorCode, value: number) {
    setScores((previous) => ({ ...previous, [code]: value }));
  }

  function updateIndicatorNote(code: IndicatorCode, value: string) {
    setIndicatorNotes((previous) => ({ ...previous, [code]: value }));
  }

  function clearForm() {
    setContext({ decision: '', industry: '', model: '', evaluator: '', date: today(), notes: '' });
    setScores({ ...initialScores });
    setIndicatorNotes({ ...initialNotes });
    setResult(null);
    setError('');
  }

  async function handleEvaluate() {
    if (!canEvaluate) return;
    setLoading(true);
    setError('');

    const band = getBand(composite);

    try {
      const aiText = await analyzeRisk({
        provider,
        apiKey,
        endpoint,
        modelName,
        context,
        scores,
        indicatorNotes,
        composite,
        bandName: band.name,
        bandAction: band.action
      });

     const nextResult: RiskApiResponse = {
  decision: context.decision,
  industry: context.industry,
  model: context.model,

  composite_score: composite,

  risk_band: band.name,

  recommendation: band.action,

  scores: Object.entries(scores).map(([code, score]) => ({
    code: code as 'DQ' | 'OV' | 'CA' | 'MS',
    score: score,
    notes:  '',
  })),
};

      setResult(nextResult);
      setHistory((previous) => [nextResult, ...previous]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the LLM provider.');
    } finally {
      setLoading(false);
    }
  }

  const INDUSTRIES = [
  "Healthcare",
  "Finance",
  "Retail"
];
const MODELS = [
  "Arivue",
  "GPT-4"  
];
  const modelLabel = provider === 'mock' ? 'Mock local analysis' : `${provider} · ${modelName}`;

  return (
    <>
      <nav className="nav">
        <div className="nav-logo"><div className="nav-logo-dot" />Decision Risk Scorer</div>
        <div className="nav-tag">Arivue Analytics × UTD</div>
      </nav>

      <section className="hero">
        <div className="hero-eyebrow">AI in Business · Decision Risk Framework</div>
        <h1 className="hero-title">AI Risk Evaluator</h1>
        <p className="hero-desc">Evaluate AI-driven decisions across four primary risk indicators, then get a structured AI analysis with mitigation steps.</p>
        <div className="hero-pills">
          <span className="pill">DQ — Data Quality</span>
          <span className="pill">OV — Output Variability</span>
          <span className="pill">CA — Contextual Assumptions</span>
          <span className="pill">MS — Model Stability</span>
        </div>
      </section>

      <main className="main">
        {/* <div className="api-notice">
          <strong>LLM Provider Setup.</strong> Use Mock mode to run without an API key, or choose Anthropic/OpenAI-compatible to call a real model. For production, route requests through your backend instead of exposing API keys in the browser.
          <div className="llm-grid">
            <select value={provider} onChange={(event) => {
              const value = event.target.value as LlmProvider;
              setProvider(value);
              if (value === 'anthropic') setModelName('claude-sonnet-4-20250514');
              if (value === 'openai-compatible') setModelName('gpt-4o-mini');
            }}>
              <option value="mock">Mock / Local</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="openai-compatible">OpenAI-compatible</option>
            </select>
            <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="API key" disabled={provider === 'mock'} />
            <input value={modelName} onChange={(event) => setModelName(event.target.value)} placeholder="Model name" />
            {provider === 'openai-compatible' && <input className="full-row" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="Endpoint URL" />}
          </div>
        </div> */}

        <div className="section-label">01 — Evaluation context</div>
        <div className="card">
          <div className="field-grid">
            <div className="field full"><label>Decision being evaluated</label><input value={context.decision} onChange={(e) => updateContext('decision', e.target.value)} placeholder="e.g. Trigger automated inventory reorder for SKU-4821" /></div>
             <div className="field">
         <label htmlFor="model">Industry / Domain</label>
  
            <select
                value={context.industry}
                onChange={(e) => updateContext('industry', e.target.value)}
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              </div>
              <div className="field">
  <label htmlFor="model">Model / System</label>
  
              <select
                value={context.model}
                onChange={(e) => updateContext('model', e.target.value)}
              >
                <option value="">Select Framework/Model</option>
                {MODELS.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              </div>
            <div className="field"><label>Evaluated by</label><input value={context.evaluator} onChange={(e) => updateContext('evaluator', e.target.value)} placeholder="e.g. Jane Smith" /></div>
            <div className="field"><label>Date</label><input type="date" value={context.date} onChange={(e) => updateContext('date', e.target.value)} /></div>
          </div>
        </div>

        <div className="section-label">02 — Score each indicator &nbsp;(1 = best · 5 = worst)</div>
        <div className="indicators-grid">
          {INDICATORS.map((indicator) => (
            <IndicatorCard key={indicator.code} indicator={indicator} score={scores[indicator.code]} note={indicatorNotes[indicator.code]} onScoreChange={updateScore} onNoteChange={updateIndicatorNote} />
          ))}
        </div>

        <div className="card">
          <div className="field"><label>Overall notes (optional)</label><input value={context.notes} onChange={(e) => updateContext('notes', e.target.value)} placeholder="e.g. Standard weekly reorder — data completeness is the main concern" /></div>
        </div>

        <div className="cta-row">
          <button className="btn-primary" disabled={!canEvaluate || loading} onClick={handleEvaluate}>{loading ? 'Analyzing risk profile...' : 'Evaluate risk profile →'}</button>
          <button className="btn-ghost" onClick={clearForm}>Clear form</button>
        </div>

        {loading && <div className="result-wrap"><div className="loading"><div className="spinner" />Analyzing risk profile...</div></div>}
        {error && <div className="result-wrap"><div className="loading error">Error: {error}</div></div>}
        {result && !loading && <ResultPanel result={result}  />}
        
        {/* <HistoryList history={history} /> */}
      </main>

      <footer>Decision Risk Scoring Tool · React + TypeScript · LLM-ready</footer>
    </>
  );
}
