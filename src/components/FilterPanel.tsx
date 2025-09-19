import React, { useState } from 'react';
import { FilterParams } from '../utils/types';
import { SaveIcon, RefreshCwIcon, SlidersIcon, ChevronDownIcon, ChevronUpIcon, FilterIcon, ArrowRightIcon, InfoIcon } from 'lucide-react';
interface FilterPanelProps {
  filters: FilterParams;
  setFilters: React.Dispatch<React.SetStateAction<FilterParams>>;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onExportCsv: () => void;
  onSaveView: () => void;
}
export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  onApplyFilters,
  onResetFilters,
  onExportCsv,
  onSaveView
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value,
      type
    } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters({
        ...filters,
        [name]: checked
      });
    } else if (name === 'sectors') {
      // Handle sectors as comma-separated string
      const sectorArray = value.split(',').map(s => s.trim()).filter(s => s);
      setFilters({
        ...filters,
        sectors: sectorArray.length > 0 ? sectorArray : undefined
      });
    } else {
      setFilters({
        ...filters,
        [name]: value === '' ? undefined : Number(value)
      });
    }
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    if (value === '') {
      // Handle "Any" option (remove the filter)
      const newFilters = {
        ...filters
      };
      delete newFilters[name as keyof FilterParams];
      setFilters(newFilters);
    } else {
      setFilters({
        ...filters,
        [name]: name === 'sort_by' ? value : Number(value)
      });
    }
  };
  const handleWeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFilters({
      ...filters,
      [name]: parseFloat(value)
    });
  };
  // Predefined options for dropdowns
  const employeeOptions = [{
    value: '',
    label: 'Any'
  }, {
    value: '10',
    label: '10'
  }, {
    value: '50',
    label: '50'
  }, {
    value: '100',
    label: '100'
  }, {
    value: '250',
    label: '250'
  }, {
    value: '500',
    label: '500'
  }, {
    value: '1000',
    label: '1,000'
  }, {
    value: '5000',
    label: '5,000'
  }, {
    value: '10000',
    label: '10,000'
  }];
  const growthOptions = [{
    value: '',
    label: 'Any'
  }, {
    value: '10',
    label: '10%'
  }, {
    value: '20',
    label: '20%'
  }, {
    value: '30',
    label: '30%'
  }, {
    value: '40',
    label: '40%'
  }, {
    value: '50',
    label: '50%'
  }];
  const scoreOptions = [{
    value: '',
    label: 'Any'
  }, {
    value: '50',
    label: '50'
  }, {
    value: '60',
    label: '60'
  }, {
    value: '70',
    label: '70'
  }, {
    value: '80',
    label: '80'
  }, {
    value: '90',
    label: '90'
  }];
  const weightOptions = [{
    value: '0',
    label: '0.0'
  }, {
    value: '0.5',
    label: '0.5'
  }, {
    value: '1',
    label: '1.0'
  }, {
    value: '1.5',
    label: '1.5'
  }, {
    value: '2',
    label: '2.0'
  }, {
    value: '2.5',
    label: '2.5'
  }, {
    value: '3',
    label: '3.0'
  }];
  const toggleAdvanced = () => {
    setAdvancedOpen(!advancedOpen);
  };
  const toggleWeights = () => {
    setWeightsOpen(!weightsOpen);
  };
  const showTooltip = (id: string) => {
    setActiveTooltip(id);
  };
  const hideTooltip = () => {
    setActiveTooltip(null);
  };
  const Tooltip = ({
    id,
    text
  }: {
    id: string;
    text: string;
  }) => <div className={`absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded shadow-lg transition-opacity duration-200 ${activeTooltip === id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {text}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
    </div>;
  return <div className="mb-6">
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-white mb-2 md:mb-0 flex items-center">
              <FilterIcon size={20} className="mr-2 text-emerald-500" />
              Find Companies
            </h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={onApplyFilters} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center shadow-sm" aria-label="Apply filters">
                <ArrowRightIcon size={16} className="mr-2" />
                Apply Filters
              </button>
              <button onClick={onResetFilters} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center shadow-sm" aria-label="Reset filters">
                <RefreshCwIcon size={16} className="mr-2" />
                Reset
              </button>
              <button onClick={onSaveView} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center shadow-sm" aria-label="Save current view">
                <SaveIcon size={16} className="mr-2" />
                Save View
              </button>
            </div>
          </div>

          {/* Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            {/* Sectors */}
            <div>
              <label htmlFor="sectors" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <span>Sectors</span>
                <div className="relative ml-1.5" onMouseEnter={() => showTooltip('sectors')} onMouseLeave={hideTooltip}>
                  <InfoIcon size={14} className="text-gray-500 hover:text-gray-400 cursor-help" />
                  <Tooltip id="sectors" text="Enter industry sectors to filter by. Separate multiple sectors with commas." />
                </div>
              </label>
              <div className="relative">
                <input type="text" id="sectors" name="sectors" value={(filters.sectors || []).join(', ')} onChange={handleInputChange} placeholder="B2B SaaS, Health & Wellness, etc." className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" aria-describedby="sectors-hint" />
              </div>
              <p id="sectors-hint" className="mt-1.5 text-xs text-gray-500">
                Separate multiple sectors with commas
              </p>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort_by" className="block text-sm font-medium text-gray-300 mb-2">
                Sort by
              </label>
              <div className="relative">
                <select id="sort_by" name="sort_by" value={filters.sort_by || 'score'} onChange={handleSelectChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" aria-label="Sort results by">
                  <option value="score">Score</option>
                  <option value="growth_rate">Growth Rate</option>
                  <option value="employees">Employees</option>
                  <option value="clarity_score">Clarity Score</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDownIcon size={16} />
                </div>
              </div>
            </div>

            {/* Minimum Score */}
            <div>
              <label htmlFor="min_score" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <span>Minimum score</span>
                <div className="relative ml-1.5" onMouseEnter={() => showTooltip('min-score')} onMouseLeave={hideTooltip}>
                  <InfoIcon size={14} className="text-gray-500 hover:text-gray-400 cursor-help" />
                  <Tooltip id="min-score" text="Only show companies with a score at or above this threshold." />
                </div>
              </label>
              <div className="relative">
                <select id="min_score" name="min_score" value={filters.min_score || ''} onChange={handleSelectChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" aria-label="Filter by minimum score">
                  {scoreOptions.map(option => <option key={option.value} value={option.value}>
                      {option.label}
                    </option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDownIcon size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <label className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-750 rounded-lg cursor-pointer transition-colors duration-150 border border-gray-700">
              <input id="only_stale" name="only_stale" type="checkbox" checked={filters.only_stale || false} onChange={handleInputChange} className="h-4 w-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 focus:ring-opacity-50 bg-gray-700 mr-2" />
              <span className="text-sm text-gray-300">Stale design</span>
            </label>
            <label className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-750 rounded-lg cursor-pointer transition-colors duration-150 border border-gray-700">
              <input id="only_funding" name="only_funding" type="checkbox" checked={filters.only_funding || false} onChange={handleInputChange} className="h-4 w-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 focus:ring-opacity-50 bg-gray-700 mr-2" />
              <span className="text-sm text-gray-300">Recent funding</span>
            </label>
            <label className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-750 rounded-lg cursor-pointer transition-colors duration-150 border border-gray-700">
              <input id="low_clarity" name="low_clarity" type="checkbox" checked={filters.low_clarity || false} onChange={handleInputChange} className="h-4 w-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 focus:ring-opacity-50 bg-gray-700 mr-2" />
              <span className="text-sm text-gray-300">Low clarity (≤ 5)</span>
            </label>
            <label className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-750 rounded-lg cursor-pointer transition-colors duration-150 border border-gray-700">
              <input id="churn_risk" name="churn_risk" type="checkbox" checked={filters.churn_risk || false} onChange={handleInputChange} className="h-4 w-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 focus:ring-opacity-50 bg-gray-700 mr-2" />
              <span className="text-sm text-gray-300">Churn risk (≥ 1)</span>
            </label>
          </div>

          {/* Advanced Filters Toggle */}
          <button onClick={toggleAdvanced} className="flex items-center text-sm text-gray-400 hover:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-gray-700 rounded px-3 py-1.5 bg-gray-800 hover:bg-gray-750 transition-colors duration-150" aria-expanded={advancedOpen} aria-controls="advanced-filters">
            <SlidersIcon size={16} className="mr-2" />
            Advanced Filters
            {advancedOpen ? <ChevronUpIcon size={16} className="ml-2" /> : <ChevronDownIcon size={16} className="ml-2" />}
          </button>

          {/* Advanced Filters */}
          {advancedOpen && <div id="advanced-filters" className="border-t border-gray-800 pt-5 mb-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Employee Range */}
                <div>
                  <label htmlFor="employees_min" className="block text-sm font-medium text-gray-300 mb-2">
                    Employees min
                  </label>
                  <div className="relative">
                    <select id="employees_min" name="employees_min" value={filters.employees_min || ''} onChange={handleSelectChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" aria-label="Minimum number of employees">
                      {employeeOptions.map(option => <option key={`min-${option.value}`} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDownIcon size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="employees_max" className="block text-sm font-medium text-gray-300 mb-2">
                    Employees max
                  </label>
                  <div className="relative">
                    <select id="employees_max" name="employees_max" value={filters.employees_max || ''} onChange={handleSelectChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" aria-label="Maximum number of employees">
                      {employeeOptions.map(option => <option key={`max-${option.value}`} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDownIcon size={16} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Growth Min */}
              <div className="mb-4">
                <label htmlFor="growth_min" className="block text-sm font-medium text-gray-300 mb-2">
                  Growth % min
                </label>
                <div className="relative">
                  <select id="growth_min" name="growth_min" value={filters.growth_min || ''} onChange={handleSelectChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" aria-label="Minimum growth percentage">
                    {growthOptions.map(option => <option key={option.value} value={option.value}>
                        {option.label}
                      </option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <ChevronDownIcon size={16} />
                  </div>
                </div>
              </div>
            </div>}

          {/* Weights Toggle */}
          <button onClick={toggleWeights} className="flex items-center text-sm text-gray-400 hover:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-gray-700 rounded px-3 py-1.5 bg-gray-800 hover:bg-gray-750 transition-colors duration-150" aria-expanded={weightsOpen} aria-controls="scoring-weights">
            <SlidersIcon size={16} className="mr-2" />
            Scoring Weights
            {weightsOpen ? <ChevronUpIcon size={16} className="ml-2" /> : <ChevronDownIcon size={16} className="ml-2" />}
          </button>

          {/* Weights Section */}
          {weightsOpen && <div id="scoring-weights" className="border-t border-gray-800 pt-5 animate-fadeIn">
              <div className="bg-gray-850 rounded-lg p-4 mb-5">
                <p className="text-sm text-gray-400 mb-0">
                  Adjust the importance of each factor in the overall score
                  calculation
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Growth Weight */}
                <div className="bg-gray-850 rounded-lg p-4 transition-transform duration-200 hover:translate-y-[-2px]">
                  <label htmlFor="w_growth" className="flex justify-between text-sm font-medium text-gray-300 mb-3">
                    <span>Growth</span>
                    <span className="text-emerald-400 font-semibold">
                      {filters.w_growth || 2.0}
                    </span>
                  </label>
                  <div className="relative">
                    <select id="w_growth" name="w_growth" value={filters.w_growth?.toString() || '2'} onChange={handleWeightChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                      {weightOptions.map(option => <option key={`growth-${option.value}`} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDownIcon size={16} />
                    </div>
                  </div>
                </div>
                {/* Stale Design Weight */}
                <div className="bg-gray-850 rounded-lg p-4 transition-transform duration-200 hover:translate-y-[-2px]">
                  <label htmlFor="w_stale" className="flex justify-between text-sm font-medium text-gray-300 mb-3">
                    <span>Stale design</span>
                    <span className="text-emerald-400 font-semibold">
                      {filters.w_stale || 1.0}
                    </span>
                  </label>
                  <div className="relative">
                    <select id="w_stale" name="w_stale" value={filters.w_stale?.toString() || '1'} onChange={handleWeightChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                      {weightOptions.map(option => <option key={`stale-${option.value}`} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDownIcon size={16} />
                    </div>
                  </div>
                </div>
                {/* Low Clarity Weight */}
                <div className="bg-gray-850 rounded-lg p-4 transition-transform duration-200 hover:translate-y-[-2px]">
                  <label htmlFor="w_clarity" className="flex justify-between text-sm font-medium text-gray-300 mb-3">
                    <span>Low clarity</span>
                    <span className="text-emerald-400 font-semibold">
                      {filters.w_clarity || 1.5}
                    </span>
                  </label>
                  <div className="relative">
                    <select id="w_clarity" name="w_clarity" value={filters.w_clarity?.toString() || '1.5'} onChange={handleWeightChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                      {weightOptions.map(option => <option key={`clarity-${option.value}`} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDownIcon size={16} />
                    </div>
                  </div>
                </div>
                {/* Churn Risk Weight */}
                <div className="bg-gray-850 rounded-lg p-4 transition-transform duration-200 hover:translate-y-[-2px]">
                  <label htmlFor="w_churn" className="flex justify-between text-sm font-medium text-gray-300 mb-3">
                    <span>Churn risk</span>
                    <span className="text-emerald-400 font-semibold">
                      {filters.w_churn || 1.2}
                    </span>
                  </label>
                  <div className="relative">
                    <select id="w_churn" name="w_churn" value={filters.w_churn?.toString() || '1.2'} onChange={handleWeightChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                      {weightOptions.map(option => <option key={`churn-${option.value}`} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDownIcon size={16} />
                    </div>
                  </div>
                </div>
                {/* Funding Weight */}
                <div className="bg-gray-850 rounded-lg p-4 transition-transform duration-200 hover:translate-y-[-2px]">
                  <label htmlFor="w_funding" className="flex justify-between text-sm font-medium text-gray-300 mb-3">
                    <span>Funding</span>
                    <span className="text-emerald-400 font-semibold">
                      {filters.w_funding || 0.8}
                    </span>
                  </label>
                  <div className="relative">
                    <select id="w_funding" name="w_funding" value={filters.w_funding?.toString() || '0.8'} onChange={handleWeightChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                      {weightOptions.map(option => <option key={`funding-${option.value}`} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDownIcon size={16} />
                    </div>
                  </div>
                </div>
                {/* Midsize Weight */}
                <div className="bg-gray-850 rounded-lg p-4 transition-transform duration-200 hover:translate-y-[-2px]">
                  <label htmlFor="w_midsize" className="flex justify-between text-sm font-medium text-gray-300 mb-3">
                    <span>Midsize</span>
                    <span className="text-emerald-400 font-semibold">
                      {filters.w_midsize || 1.0}
                    </span>
                  </label>
                  <div className="relative">
                    <select id="w_midsize" name="w_midsize" value={filters.w_midsize?.toString() || '1'} onChange={handleWeightChange} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                      {weightOptions.map(option => <option key={`midsize-${option.value}`} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDownIcon size={16} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Export Button */}
              <div className="mt-6">
                <button onClick={onExportCsv} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg w-full transition-colors duration-200 flex items-center justify-center shadow-sm" aria-label="Export data to CSV file">
                  <SaveIcon size={16} className="mr-2" />
                  Export CSV
                </button>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};