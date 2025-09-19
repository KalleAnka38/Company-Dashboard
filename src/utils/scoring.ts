import { Company, FilterParams } from './types';

// Clamp a number between min and max
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export function computeScore(c: {
  growth_rate: number;
  stale_design: boolean;
  clarity_score: number;
  churn_indicators: number;
  recent_funding: boolean;
  employees: number;
}, w: {
  growth: number;
  stale: number;
  clarity: number;
  churn: number;
  funding: number;
  midsize: number;
}) {
  const growth = clamp(c.growth_rate ?? 0, 0, 50) / 50;
  const stale = c.stale_design ? 1 : 0;
  const clarity = (10 - clamp(c.clarity_score ?? 0, 0, 10)) / 10;
  const churn = clamp(c.churn_indicators ?? 0, 0, 3) / 3;
  const funding = c.recent_funding ? 1 : 0;
  const midsize = (c.employees ?? 0) >= 50 && (c.employees ?? 0) <= 1000 ? 1 : 0;
  const numer = w.growth * growth + w.stale * stale + w.clarity * clarity + w.churn * churn + w.funding * funding + w.midsize * midsize;
  const denom = w.growth + w.stale + w.clarity + w.churn + w.funding + w.midsize || 1;
  return Math.round(100 * numer / denom);
}

// Calculate score for a company based on weights (adapter for backward compatibility)
export const calculateScore = (company: Company, weights: FilterParams): number => {
  return computeScore(company, {
    growth: weights.w_growth ?? 2.0,
    stale: weights.w_stale ?? 1.0,
    clarity: weights.w_clarity ?? 1.5,
    churn: weights.w_churn ?? 1.2,
    funding: weights.w_funding ?? 0.8,
    midsize: weights.w_midsize ?? 1.0
  });
};

// Apply filters to companies
export const applyFilters = (companies: Company[], filters: FilterParams): Company[] => {
  return companies.filter(company => {
    // Apply sector filter
    if (filters.sectors && filters.sectors.length > 0 && !filters.sectors.includes(company.sector)) {
      return false;
    }

    // Apply employee range filter
    if (filters.employees_min !== undefined && company.employees < filters.employees_min) {
      return false;
    }
    if (filters.employees_max !== undefined && company.employees > filters.employees_max) {
      return false;
    }

    // Apply growth minimum filter
    if (filters.growth_min !== undefined && company.growth_rate < filters.growth_min) {
      return false;
    }

    // Apply boolean filters
    if (filters.only_stale && !company.stale_design) {
      return false;
    }
    if (filters.only_funding && !company.recent_funding) {
      return false;
    }
    if (filters.low_clarity && company.clarity_score > 5) {
      return false;
    }
    if (filters.churn_risk && company.churn_indicators < 1) {
      return false;
    }

    // Calculate score for min_score filter
    const score = calculateScore(company, filters);
    if (filters.min_score !== undefined && score < filters.min_score) {
      return false;
    }
    return true;
  });
};