import type { EvaluationResult } from '../types/risk';

interface Props {
  history: EvaluationResult[];
}

export default function HistoryList({ history }: Props) {
  if (!history.length) return null;

  return (
    <div className="history-area">
      <div className="section-label">Previous evaluations</div>
      <div className="history-wrap">
        {history.map((entry, index) => (
          <div className="history-item" key={`${entry.context.decision}-${index}`}>
            <div>
              <div className="hi-decision">
                {entry.context.decision.length > 60 ? `${entry.context.decision.slice(0, 60)}…` : entry.context.decision}
              </div>
              <div className="hi-meta">{entry.context.industry || 'Unspecified'} · {entry.context.model || 'Unspecified'} · {entry.context.date}</div>
            </div>
            <div className="hi-right">
              <span className={`band-pill b${entry.band.cls}`}>{entry.band.name}</span>
              <span className="hi-score">{entry.composite.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
