// lib/utils.ts
import { FilterParams, Company } from '@/types';
// Clamp a number between min and max
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
// Sanitize a string to prevent XSS
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"&]/g, '');
};
// Validate numeric input
export const isValidNumber = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  return !isNaN(Number(value));
};
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
  // Validate inputs to prevent NaN results
  const growth = clamp(c.growth_rate ?? 0, 0, 50) / 50;
  const stale = c.stale_design ? 1 : 0;
  const clarity = (10 - clamp(c.clarity_score ?? 0, 0, 10)) / 10;
  const churn = clamp(c.churn_indicators ?? 0, 0, 3) / 3;
  const funding = c.recent_funding ? 1 : 0;
  const midsize = (c.employees ?? 0) >= 50 && (c.employees ?? 0) <= 1000 ? 1 : 0;
  // Validate weights to prevent division by zero
  const safeWeights = {
    growth: Math.max(0, w.growth || 0),
    stale: Math.max(0, w.stale || 0),
    clarity: Math.max(0, w.clarity || 0),
    churn: Math.max(0, w.churn || 0),
    funding: Math.max(0, w.funding || 0),
    midsize: Math.max(0, w.midsize || 0)
  };
  const numer = safeWeights.growth * growth + safeWeights.stale * stale + safeWeights.clarity * clarity + safeWeights.churn * churn + safeWeights.funding * funding + safeWeights.midsize * midsize;
  const denom = safeWeights.growth + safeWeights.stale + safeWeights.clarity + safeWeights.churn + safeWeights.funding + safeWeights.midsize || 1;
  return Math.round(100 * numer / denom);
}
// Calculate score for a company based on weights
export const calculateScore = (company: Company, weights: FilterParams): number => {
  // Validate company object to prevent runtime errors
  if (!company) return 0;
  return computeScore(company, {
    growth: weights.w_growth ?? 2.0,
    stale: weights.w_stale ?? 1.0,
    clarity: weights.w_clarity ?? 1.5,
    churn: weights.w_churn ?? 1.2,
    funding: weights.w_funding ?? 0.8,
    midsize: weights.w_midsize ?? 1.0
  });
};
// Function to validate API key
export const validateApiKey = (apiKey: string | null): boolean => {
  if (!apiKey) return false;
  // Check against environment variable
  const validApiKey = process.env.API_KEY;
  // Use constant-time comparison to prevent timing attacks
  // This is a simple implementation - in production, use a crypto library
  if (!validApiKey || apiKey.length !== validApiKey.length) return false;
  let result = 0;
  for (let i = 0; i < apiKey.length; i++) {
    result |= apiKey.charCodeAt(i) ^ validApiKey.charCodeAt(i);
  }
  return result === 0;
};
// Generate a secure random token
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};