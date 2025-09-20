const BASE = 'https://api.crunchbase.com/v3.1/odm-organizations';

export function buildUrl(query: string, items = 10, page = 1) {
  const key = import.meta.env.VITE_CRUNCHBASE_API_KEY;
  if (!key) throw new Error('Missing VITE_CRUNCHBASE_API_KEY');
  const u = new URL(BASE);
  u.searchParams.set('user_key', key);
  if (query) u.searchParams.set('query', query);
  u.searchParams.set('items_per_page', String(items));
  u.searchParams.set('page', String(page));
  return u.toString();
}

export function mapOrgToRow(org: any) {
  const p = org?.properties ?? {};
  return {
    name: p.name ?? '',
    sector: p.industry_groups ?? p.category_groups ?? undefined,
    employees: p.num_employees_min ?? p.num_employees_max ?? null,
    funding: p.total_funding_usd ?? null,
    homepage: p.homepage_url ?? null,
    founded_on: p.founded_on ?? null,
    summary: p.short_description ?? null,
  };
}
