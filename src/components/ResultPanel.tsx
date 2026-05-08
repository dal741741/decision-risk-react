import { GAUGE_COLORS } from '../data/rubrics';
import type { RiskApiResponse } from '../types/risk';

interface Props {
  result: RiskApiResponse;
}

export default function ResultPanel({ result }: Props) {
  return (
    <div className="result-wrap">
      <div className="result-header">
        <div className="result-left">
          <span
            className={`band-pill ${
              result.risk_band === 'Low'
                ? 'bl'
                : result.risk_band === 'Moderate'
                ? 'bm'
                : result.risk_band === 'High'
                ? 'bh'
                : 'bc'
            }`}
          >
            {result.risk_band} Risk
          </span>

          <span className="result-decision">
            {result.decision.length > 50
              ? `${result.decision.slice(0, 50)}…`
              : result.decision}
          </span>
        </div>

        <div className="result-score">
          {result.composite_score.toFixed(2)}
          <small> / 5.00</small>
        </div>
      </div>

      <div className="result-indicators">
        {result.scores.map((item) => (
          <div className="ri" key={item.code}>
            <div className="ri-code">{item.code}</div>

            <div
              className="ri-val"
              style={{ color: GAUGE_COLORS[item.score] }}
            >
              {item.score}
            </div>

            <div className="ri-bar">
              <div
                className="ri-bar-fill"
                style={{
                  width: `${item.score * 20}%`,
                  background: GAUGE_COLORS[item.score],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="result-ai">
        <div className="result-ai-label">
          {result.model} Model Result
        </div>

        <div className="result-ai-text">
          <p>
            <strong>Industry:</strong> {result.industry}
          </p>

          <p>
            <strong>Model:</strong> {result.model}
          </p>

          <p>
            <strong>Risk Band:</strong> {result.risk_band}
          </p>
        </div>

        {result.ai_analysis ? (
          <>
            <div className="result-ai-label">
              AI Analysis
            </div>

            <div className="result-ai-text">
              {result.ai_analysis
                .split('\n')
                .filter(Boolean)
                .map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
            </div>
          </>
        ) : (
          <div
          className={`result-rec ${
            result.risk_band === 'Low'
              ? 'rr-l'
              : result.risk_band === 'Moderate'
              ? 'rr-m'
              : result.risk_band === 'High'
              ? 'rr-h'
              : 'rr-c'
          }`}
        >
          Recommendation: {result.recommendation}
        </div>
        )}

        
      </div>
    </div>
  );
}