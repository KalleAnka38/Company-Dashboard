import { useEffect, useState } from 'react';
import { buildUrl, mapOrgToRow } from '@/lib/crunchbase';

export function useCrunchbaseSearch(query: string, items = 10) {
  const [state, setState] = useState({ data: [] as any[], loading: false, error: null as string|null });

  useEffect(() => {
    if (!query) return setState({ data: [], loading: false, error: null });
    let cancelled = false;
    (async () => {
      setState(s => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch(buildUrl(query, items));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = json?.data?.items ?? [];
        const rows = items.map(mapOrgToRow);
        if (!cancelled) setState({ data: rows, loading: false, error: null });
      } catch (e:any) {
        if (!cancelled) setState({ data: [], loading: false, error: e.message || 'Fetch failed' });
      }
    })();
    return () => { cancelled = true; };
  }, [query, items]);

  return state;
}
