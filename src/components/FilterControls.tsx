import React, { useEffect, useState } from 'react';
import { FilterParams } from '../types';
interface FilterControlsProps {
  initialFilters: FilterParams;
  sectors: string[];
  onApply: (filters: FilterParams) => void;
}
const FilterControls: React.FC<FilterControlsProps> = ({
  initialFilters,
  sectors,
  onApply
}) => {
  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  // Update filters when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value,
      type
    } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'sectors') {
      const options = (e.target as HTMLSelectElement).options;
      const selectedSectors: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedSectors.push(options[i].value);
        }
      }
      setFilters(prev => ({
        ...prev,
        sectors: selectedSectors
      }));
    } else if (name.startsWith('w_')) {
      // Handle weight inputs
      setFilters(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else if (value === '') {
      // Handle empty inputs (remove the property)
      const newFilters = {
        ...filters
      };
      delete newFilters[name as keyof FilterParams];
      setFilters(newFilters);
    } else {
      // Handle numeric inputs
      setFilters(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    }
  };
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filters);
  };
  return <form onSubmit={handleApply}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sectors</label>
            <select name="sectors" multiple value={filters.sectors || []} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm" size={4}>
              {sectors.map(sector => <option key={sector} value={sector}>
                  {sector}
                </option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Hold Ctrl/Cmd to select multiple
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employees</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input type="number" name="employees_min" placeholder="Min" value={filters.employees_min || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm" />
              </div>
              <div>
                <input type="number" name="employees_max" placeholder="Max" value={filters.employees_max || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Min Growth Rate (%)
            </label>
            <input type="number" name="growth_min" placeholder="Min growth rate" value={filters.growth_min || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Score</label>
            <input type="number" name="min_score" placeholder="Min score" value={filters.min_score || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Filters</label>
            <div className="flex items-center">
              <input type="checkbox" id="only_stale" name="only_stale" checked={!!filters.only_stale} onChange={handleChange} className="mr-2" />
              <label htmlFor="only_stale" className="text-sm">
                Only Stale Design
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="only_funding" name="only_funding" checked={!!filters.only_funding} onChange={handleChange} className="mr-2" />
              <label htmlFor="only_funding" className="text-sm">
                Only Recent Funding
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="low_clarity" name="low_clarity" checked={!!filters.low_clarity} onChange={handleChange} className="mr-2" />
              <label htmlFor="low_clarity" className="text-sm">
                Low Clarity (≤5)
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="churn_risk" name="churn_risk" checked={!!filters.churn_risk} onChange={handleChange} className="mr-2" />
              <label htmlFor="churn_risk" className="text-sm">
                Churn Risk (≥1)
              </label>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Scoring Weights
            </label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <label className="block text-xs">Growth</label>
                <input type="number" name="w_growth" step="0.1" min="0" max="5" value={filters.w_growth || 2.0} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs">Stale Design</label>
                <input type="number" name="w_stale" step="0.1" min="0" max="5" value={filters.w_stale || 1.0} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs">Clarity</label>
                <input type="number" name="w_clarity" step="0.1" min="0" max="5" value={filters.w_clarity || 1.5} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs">Churn</label>
                <input type="number" name="w_churn" step="0.1" min="0" max="5" value={filters.w_churn || 1.2} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs">Funding</label>
                <input type="number" name="w_funding" step="0.1" min="0" max="5" value={filters.w_funding || 0.8} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs">Midsize</label>
                <input type="number" name="w_midsize" step="0.1" min="0" max="5" value={filters.w_midsize || 1.0} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium">
          Apply Filters
        </button>
      </div>
    </form>;
};
export default FilterControls;