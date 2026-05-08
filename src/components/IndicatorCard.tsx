import type { IndicatorCode, IndicatorConfig } from '../types/risk';

interface Props {
  indicator: IndicatorConfig;
  score: number;
  note: string;
  onScoreChange: (code: IndicatorCode, score: number) => void;
  onNoteChange: (code: IndicatorCode, note: string) => void;
}

export default function IndicatorCard({ indicator, score, note, onScoreChange, onNoteChange }: Props) {
  return (
    <div className={`indicator-card ${score > 0 ? 'scored' : ''}`}>
      <div className="indicator-top">
        <span className="code-badge">{indicator.code}</span>
        <span className="ind-name">{indicator.name}</span>
      </div>
      <div className="ind-desc">{indicator.description}</div>
      <div className="ind-score-label">Score: <span>{score ? `${score} / 5` : 'not set'}</span></div>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={`star ${score >= value ? `a${score}` : ''}`}
            onClick={() => onScoreChange(indicator.code, value)}
          >
            {value}
          </button>
        ))}
      </div>
      {score > 0 && <div className="rubric-hint">{indicator.hints[score]}</div>}
      <input
        className="ind-note"
        type="text"
        value={note}
        onChange={(event) => onNoteChange(indicator.code, event.target.value)}
        placeholder={indicator.placeholder}
      />
    </div>
  );
}
