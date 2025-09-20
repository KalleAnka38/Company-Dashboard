import { Company, FilterParams, SavedView } from '../utils/types';
import { applyFilters, calculateScore } from '../utils/scoring';
import { mockCompanies, mockSavedViews } from '../utils/mockData';
import { supabase } from '../lib/supabase/client';
import { logSecurityEvent } from '../lib/security/logger';

// --------------------------------------------------------------------
// Crunchbase helpers (client-side test only)
// --------------------------------------------------------------------
const CRUNCHBASE_KEY = import.meta.env.VITE_CRUNCHBASE_API_KEY;
const CRUNCHBASE_BASE = 'https://api.crunchbase.com/v3.1/odm-organizations';

function buildCbUrl(query: string, items = 20, page = 1) {
  if (!CRUNCHBASE_KEY) throw new Error('Missing VITE_CRUNCHBASE_API_KEY');
  const u = new URL(CRUNCHBASE_BASE);
  u.searchParams.set('user_key', CRUNCHBASE_KEY);
  if (query) u.searchParams.set('query', query);
  u.searchParams.set('items_per_page', String(items));
  u.searchParams.set('page', String(page));
  return u.toString();
}

function mapCbOrg(org: any) {
  const p = org?.properties ?? {};
  return {
    name: p.name ?? '',
    sector: p.industry_groups ?? p.category_groups ?? null,
    employees: p.num_employees_min ?? p.num_employees_max ?? null,
    growth: null,
    funding: p.total_funding_usd ?? null,
    scale: null,
    clarity: null,
    churn: null,
    score: p.rank ?? null,
    homepage: p.homepage_url ?? null,
    founded_on: p.founded_on ?? null,
  };
}

async function fetchFromCrunchbase(query: string, items = 20, page = 1) {
  const url = buildCbUrl(query, items, page);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Crunchbase HTTP ${res.status}`);
  const json = await res.json();
  const itemsArr = json?.data?.items ?? [];
  return itemsArr.map(mapCbOrg);
}

// --------------------------------------------------------------------
// Fetch companies with filters (Supabase first, Crunchbase fallback)
// --------------------------------------------------------------------
export const fetchCompanies = async (params: FilterParams): Promise<Company[]> => {
  // Toggle this true if you want to bypass Supabase completely during testing
  const USE_CRUNCHBASE_ONLY = false;

  const limit = Math.min(params.limit ?? 50, 500);
  const offset = Math.max(params.offset ?? 0, 0);
  const page = Math.floor(offset / Math.max(limit, 1)) + 1;
  const keyword =
    (params.search || params.sectors?.[0] || '').toString().trim() || 'software';

  if (USE_CRUNCHBASE_ONLY) {
    const rows = await fetchFromCrunchbase(keyword, Math.min(limit, 50), page);
    return rows as unknown as Company[];
  }

  try {
    // -----------------------------
    // Supabase query
    // -----------------------------
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

    return data as Company[];
  } catch (err) {
    console.warn('Supabase error, falling back to Crunchbase:', err);
    const rows = await fetchFromCrunchbase(keyword, Math.min(limit, 50), page);
    return rows as unknown as Company[];
  }
};
