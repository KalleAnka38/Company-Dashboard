import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FilterPanel } from '../FilterPanel';
import { CompanyTable } from '../CompanyTable';
import { SaveViewModal } from '../SaveViewModal';
import { FilterParams, Company } from '@/types';
import { fetchCompanies, exportToCsv, createSavedView } from '@/lib/api';
export const Finder: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<FilterParams>({
    w_growth: 2.0,
    w_stale: 1.0,
    w_clarity: 1.5,
    w_churn: 1.2,
    w_funding: 0.8,
    w_midsize: 1.0
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Load filters from URL on initial load
  useEffect(() => {
    const loadedFilters: FilterParams = {};
    // Parse sectors as array
    const sectors = searchParams.get('sectors');
    if (sectors) {
      loadedFilters.sectors = sectors.split(',');
    }
    // Parse numeric values
    const numericParams = ['employees_min', 'employees_max', 'growth_min', 'min_score', 'limit', 'offset', 'w_growth', 'w_stale', 'w_clarity', 'w_churn', 'w_funding', 'w_midsize'];
    numericParams.forEach(param => {
      const value = searchParams.get(param);
      if (value !== null) {
        // @ts-ignore - We know these are valid keys
        loadedFilters[param] = Number(value);
      }
    });
    // Parse boolean values
    const booleanParams = ['only_stale', 'only_funding', 'low_clarity', 'churn_risk'];
    booleanParams.forEach(param => {
      const value = searchParams.get(param);
      if (value !== null) {
        // @ts-ignore - We know these are valid keys
        loadedFilters[param] = value === 'true';
      }
    });
    // Parse sort
    const sortBy = searchParams.get('sort_by');
    if (sortBy) {
      loadedFilters.sort_by = sortBy as any;
    }
    setFilters(prevFilters => ({
      ...prevFilters,
      ...loadedFilters
    }));
    // Load companies with these filters
    fetchCompaniesWithFilters(loadedFilters);
  }, [searchParams]);
  // Update URL when filters change
  const updateSearchParams = (currentFilters: FilterParams) => {
    const params = new URLSearchParams();
    // Add sectors as comma-separated list
    if (currentFilters.sectors && currentFilters.sectors.length > 0) {
      params.set('sectors', currentFilters.sectors.join(','));
    }
    // Add numeric values
    const numericParams = ['employees_min', 'employees_max', 'growth_min', 'min_score', 'limit', 'offset', 'w_growth', 'w_stale', 'w_clarity', 'w_churn', 'w_funding', 'w_midsize'];
    numericParams.forEach(param => {
      // @ts-ignore - We know these are valid keys
      if (currentFilters[param] !== undefined) {
        // @ts-ignore - We know these are valid keys
        params.set(param, currentFilters[param].toString());
      }
    });
    // Add boolean values
    const booleanParams = ['only_stale', 'only_funding', 'low_clarity', 'churn_risk'];
    booleanParams.forEach(param => {
      // @ts-ignore - We know these are valid keys
      if (currentFilters[param] !== undefined) {
        // @ts-ignore - We know these are valid keys
        params.set(param, currentFilters[param].toString());
      }
    });
    // Add sort
    if (currentFilters.sort_by) {
      params.set('sort_by', currentFilters.sort_by);
    }
    router.push(`/?${params.toString()}`);
  };
  const fetchCompaniesWithFilters = async (currentFilters: FilterParams) => {
    setLoading(true);
    try {
      const results = await fetchCompanies(currentFilters);
      setCompanies(results);
    } catch (error) {
      toast.error('Failed to fetch companies');
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleApplyFilters = () => {
    updateSearchParams(filters);
    fetchCompaniesWithFilters(filters);
  };
  const handleResetFilters = () => {
    const defaultFilters: FilterParams = {
      w_growth: 2.0,
      w_stale: 1.0,
      w_clarity: 1.5,
      w_churn: 1.2,
      w_funding: 0.8,
      w_midsize: 1.0
    };
    setFilters(defaultFilters);
    updateSearchParams(defaultFilters);
    fetchCompaniesWithFilters(defaultFilters);
  };
  const handleExportCsv = () => {
  if (companies.length === 0) {
    toast.warn('No companies to export');
    return;
  }
  exportToCsv(companies);
  toast.success('Exporting CSV...');
};

  const handleSaveView = () => {
    setIsModalOpen(true);
  };
  const handleSaveViewConfirm = async (name: string) => {
    try {
      const apiKey = localStorage.getItem('cf_api_key');
      if (!apiKey) {
        toast.error('API key is required. Please set it in Settings.');
        return;
      }
      await createSavedView(name, new URLSearchParams(Array.from(searchParams.entries())).toString(), apiKey);
      toast.success(`View "${name}" saved successfully`);
    } catch (error) {
      toast.error('Failed to save view');
      console.error('Error saving view:', error);
    }
  };
  return <div>
      <FilterPanel filters={filters} setFilters={setFilters} onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} onExportCsv={handleExportCsv} onSaveView={handleSaveView} />
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <CompanyTable companies={companies} loading={loading} />
      </div>
      <SaveViewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveViewConfirm} />
    </div>;
};
