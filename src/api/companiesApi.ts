// src/api/companiesApi.ts
import { supabase } from '@/lib/supabase/client';
import { logSecurityEvent } from '@/lib/security/logger';
import { Company, FilterParams, SavedView } from '@/utils/types';
import { applyFilters, calculateScore } from '@/utils/scoring';
import { mockCompanies, mockSavedViews } from '@/utils/mockData';

// API Key (for Crunchbase or other APIs if needed)
const API_KEY = import.meta.env.VITE_CRUNCHBASE_API_KEY;


// =============================
// Fetch Companies with Filters
// =============================
export const fetchCompanies = async (params: FilterParams): Promise<Company[]> => {
  try {
    // Build Supabase query
    let query = supabase.from('companies').select('*');

    if (params.sectors && params.sectors.length > 0) {
      query = query.in('sector', params.sectors);
    }
    if (params.employees_min !== undefined) {
      query = query.gte('employees', params.employees_min);
    }
    if (params.employees_max !== undefined) {
      query = query.lte('employees', params.employees_max);
    }
    if (params.growth_min !== undefined) {
      query = query.gte('growth_rate', params.growth_min);
    }
    if (params.only_stale) {
      query = query.eq('stale_design', true);
    }
    if (params.only_funding) {
      query = query.eq('recent_funding', true);
    }
    if (params.low_clarity) {
      query = query.lte('clarity_score', 5);
    }
    if (params.churn_risk) {
      query = query.gte('churn_indicators', 1);
    }

    // Pagination
    const limit = Math.min(params.limit ?? 50, 500);
    const offset = params.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      logSecurityEvent('supabase_query_failed', { error: error.message });
      return mockCompanies; // fallback
    }

    return data as Company[];
  } catch (err) {
    console.error('Fetch failed, falling back to mock data:', err);
    return mockCompanies;
  }
};

// =============================
// CSV Export Helper
// =============================
export const exportToCsv = (companies: Company[]) => {
  if (!companies || companies.length === 0) {
    console.warn('No companies to export');
    return;
  }

  // Convert to CSV
  const headers = Object.keys(companies[0]);
  const rows = companies.map(company =>
    headers.map(h => JSON.stringify((company as any)[h] ?? '')).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `companies_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// =============================
// (Optional) Saved Views
// =============================
export const createSavedView = async (view: SavedView) => {
  try {
    const { data, error } = await supabase.from('saved_views').insert(view);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving view:', err);
    return mockSavedViews;
  }
};
// Bulk Upload helper for /pages/Upload.tsx
export type BulkUploadResult = {
  inserted: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
};

export async function bulkUpload(file: File): Promise<BulkUploadResult> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/bulk', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Bulk upload failed with ${res.status}`);
  }

  return res.json();
}
