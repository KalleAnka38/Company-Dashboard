export interface Company {
  id: number;
  name: string;
  sector: string;
  website?: string;
  employees: number;
  growth_rate: number;
  recent_funding: boolean;
  stale_design: boolean;
  clarity_score: number;
  churn_indicators: number;
  hq?: string;
  last_updated?: string;
  created_at: string;
  updated_at: string;
  score?: number;
}
export interface SavedView {
  id: number;
  name: string;
  querystring: string;
  created_at: string;
}
export interface FilterParams {
  sectors?: string[];
  employees_min?: number;
  employees_max?: number;
  growth_min?: number;
  min_score?: number;
  only_stale?: boolean;
  only_funding?: boolean;
  low_clarity?: boolean;
  churn_risk?: boolean;
  sort_by?: 'score' | 'growth_rate' | 'employees' | 'clarity_score';
  limit?: number;
  offset?: number;
  w_growth?: number;
  w_stale?: number;
  w_clarity?: number;
  w_churn?: number;
  w_funding?: number;
  w_midsize?: number;
}