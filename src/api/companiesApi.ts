// src/api/companiesApi.ts

import { Company, FilterParams } from '../utils/types';
import { logSecurityEvent } from '../lib/security/logger';
// If you want to re-enable Supabase later, keep this import;
// it won't be used while USE_CRUNCHBASE_ONLY = true.
import { supabase } from '../lib/supabase/client';

/**
 * -----------------------------
 * Crunchbase (client-side) setup
 * -----------------------------
 * NOTE: This uses a Vite-exposed env var, which means the key is visible
 * in the browser bundle. Fine for testing, but use a serverless proxy for prod.
 */
const USE_CRUNCHBASE_ONLY = true;

const CRUNCHBASE_KEY = import.meta.env.VITE_CRUNCHBASE_API_KEY;
const CRUNCHBASE_BASE = 'https://api.crunchbase.com/v3.1/odm-organizations';

function buildCbUrl(query: string, items = 20, page = 1) {
  if (!CRUNCHBASE_KEY) {
    throw new Error(
      'Missing VITE_CRUNCHBASE_API_KEY. Set it in .env.local and in Vercel project env vars.'
    );
  }
  const u = new URL(CRUNCHBASE_BASE);
  u.searchParams.set('user_key', CRUNCHBASE_KEY);
  if (query) u.searchParams.set('query', query);
  u.searchParams.set('items_per_page', String(items));
  u.searchParams.set('page', String(page));
  return u.toString();
}

function mapCbOrgToCompany(org: any): Company {
  const p = org?.properties ?? {};
  // Map as much as we can into your Company shape
  return {
    name: p.name ?? '',
    sector: p.industry_groups ?? p.category_groups ?? null,
    employees: p.num_employees_min ?? p.num_employees_max ?? null,
    growth: null,                        // derive/customize later if needed
    funding: p.total_funding_usd ?? null,
    scale: null,
    clarity: null,
    churn: null,
    score: p.rank ?? null,
    // add anything else your UI reads here if needed
  } as unknown as Company;
}

async function fetchFromCrunchbase(query: string, items = 20, page = 1): Promise<Company[]> {
  const url = buildCbUrl(query, items, page);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Crunchbase HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const itemsArr: any[] = json?.data?.items ?? [];
  return itemsArr.map(mapCbOrgToCompany);
}

/**
 * Main entry: fetchCompanies
 * - With USE_CRUNCHBASE_ONLY = true, we always hit Crunchbase.
 * - Flip to false later to try Supabase first and fallback to Crunchbase.
 */
export const fetchCompanies = async (params: FilterParams): Promise<Company[]> => {
  const limit = Math.min(params.limit ?? 50, 500);
  const offset = Math.max(params.offset ?? 0, 0);
  const page = Math.floor(offset / Math.max(limit, 1)) + 1;

  // Build a keyword: prefer explicit text search, otherwise first sector, otherwise a safe default
  const keyword =
    (params.search || params.sectors?.[0] || '').toString().trim() || 'software';

  if (USE_CRUNCHBASE_ONLY) {
    return await fetchFromCrunchbase(keyword, Math.min(limit, 50), page);
  }

  // --- Supabase-first mode (disabled while USE_CRUNCHBASE_ONLY = true) ---
  try {
    let query = supabase.from('companies').select('*');

    if (params.sectors && params.sectors.length > 0) query = query.in('sector', params.sectors);
    if (params.employees_min != null) query = query.gte('employees', params.employees_min);
    if (params.employees_max != null) query = query.lte('employees', params.employees_max);
    if (params.growth_min != null) query = query.gte('growth_rate', params.growth_min);
    if (params.only_stable) query = query.eq('scale_design', true);
    if (params.only_funding) query = query.eq('recent_funding', true);
    if (params.low_clarity) query = query.lte('clarity_score', 5);
    if (params.churn_risk) query = query.gte('churn_indicators', 1);

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data as unknown) as Company[];
  } catch (err: any) {
    console.warn('Supabase error, falling back to Crunchbase:', err?.message || err);
    logSecurityEvent?.('supabase_fetch_error', { message: String(err) });
    return await fetchFromCrunchbase(keyword, Math.min(limit, 50), page);
  }
};
