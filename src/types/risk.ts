export type IndicatorCode = 'DQ' | 'OV' | 'CA' | 'MS';

export interface IndicatorConfig {
  code: IndicatorCode;
  name: string;
  description: string;
  placeholder: string;
  hints: Record<number, string>;
}

export interface EvaluationContext {
  decision: string;
  industry: string;
  model: string;
  evaluator: string;
  date: string;
  notes: string;
}

export interface RiskBand {
  name: string;
  cls: 'l' | 'm' | 'h' | 'c';
  action: string;
}

export interface EvaluationResult {
  context: EvaluationContext;
  scores: Scores;
  indicatorNotes: Notes;
  composite: number;
  band: RiskBand;
  aiText: string;
}

// export type RiskApiResponse = {
//   decision: string;
//   industry: string;
//   model: string;
//   composite_score: number;
//   risk_band: string;
//   recommendation: string;
//   scores: {
//     code: 'DQ' | 'OV' | 'CA' | 'MS';
//     score: 1 | 2 | 3 | 4 | 5;
//     notes: string;
//   }[];
// };

export type RiskScore = {
  code: IndicatorCode;
  score: number;
  notes: string;
};

export type Scores = Record<IndicatorCode, number>;

export type Notes = Record<IndicatorCode, string>;

export type RiskApiResponse = {
  decision: string;

  industry: string;

  model: string;

  composite_score: number;

  risk_band: string;

  recommendation: string;

  ai_analysis?: string;

  scores: RiskScore[];
};