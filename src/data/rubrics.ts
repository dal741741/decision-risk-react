import type { IndicatorConfig, RiskBand } from '../types/risk';

export const INDICATORS: IndicatorConfig[] = [
  {
    code: 'DQ',
    name: 'Data Quality — Freshness',
    description: 'How recent and complete is the input data at the time of decision?',
    placeholder: 'Optional note (e.g. 92% populated, refreshed 6h ago)',
    hints: {
      1: '≥95% fields populated, <1% anomalies, data updated within refresh window',
      2: '90–94% populated, 1–3% anomalies, minor staleness within 1 cycle',
      3: '80–89% populated, 3–7% anomalies, or 1–2 cycles overdue',
      4: '70–79% populated, 7–15% anomalies, or significantly stale',
      5: '<70% populated, >15% anomalies, or critically out of date'
    }
  },
  {
    code: 'OV',
    name: 'Output Variability',
    description: 'How much has the AI output fluctuated over recent periods?',
    placeholder: 'Optional note (e.g. CV ~12% over past 4 weeks)',
    hints: {
      1: 'CV <5% — output highly stable over rolling window',
      2: 'CV 5–10%, consistent trend direction',
      3: 'CV 10–20%, some directional inconsistency',
      4: 'CV 20–35%, frequent directional swings',
      5: 'CV >35% or output reverses direction frequently'
    }
  },
  {
    code: 'CA',
    name: 'Contextual Assumption Validity',
    description: 'Are the conditions under which the model was built still holding?',
    placeholder: 'Optional note (e.g. minor seasonal shift flagged)',
    hints: {
      1: 'All assumptions valid — normal seasonality, no disruptions',
      2: '1 minor assumption flagged (small promo, minor shift)',
      3: '1–2 moderate assumptions flagged (active promo, supply shift)',
      4: '2–3 significant violations (major market event, regulatory change)',
      5: 'Core assumptions invalid — major external shock'
    }
  },
  {
    code: 'MS',
    name: 'Model Stability',
    description: 'Has the model drifted or shown changes in performance metrics?',
    placeholder: 'Optional note (e.g. retrained 18 days ago, no drift)',
    hints: {
      1: 'No drift, retrained ≤30 days ago, metric delta <2%',
      2: 'Minor drift, retrained 30–60 days, 2–5% delta',
      3: 'Moderate drift, retrained 60–90 days, 5–10% delta',
      4: 'Significant drift, retrained 90–180 days, 10–20% delta',
      5: 'Severe drift, >180 days or >20% delta, or no monitoring'
    }
  }
];

export const GAUGE_COLORS: Record<number, string> = {
  1: '#639922',
  2: '#378ADD',
  3: '#BA7517',
  4: '#D85A30',
  5: '#E24B4A'
};

export function getBand(composite: number): RiskBand {
  if (composite <= 2) return { name: 'Low', cls: 'l', action: 'Proceed with standard monitoring' };
  if (composite <= 3) return { name: 'Moderate', cls: 'm', action: 'Proceed with documented caveats' };
  if (composite <= 4) return { name: 'High', cls: 'h', action: 'Pause — escalate for review before acting' };
  return { name: 'Critical', cls: 'c', action: 'Block — do not act without remediation' };
}
