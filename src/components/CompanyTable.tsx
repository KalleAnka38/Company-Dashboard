import React, { useState, Fragment } from 'react';
import { Company } from '@/types';
import { ExternalLinkIcon, TrendingUpIcon, BriefcaseIcon, EyeIcon, AlertTriangleIcon, ArrowUpIcon, ChevronDownIcon, ChevronUpIcon, ChevronRightIcon, SearchIcon, ClipboardCopyIcon, MapPinIcon, CalendarIcon, BarChart2Icon, CheckIcon, XIcon, ZapIcon } from 'lucide-react';
interface CompanyTableProps {
  companies: Company[];
  loading: boolean;
}
export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  loading
}) => {
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const toggleExpand = (companyId: number) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  const getSortedCompanies = () => {
    // First filter by search term if present
    let filtered = companies;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = companies.filter(company => company.name.toLowerCase().includes(term) || company.sector.toLowerCase().includes(term) || company.hq && company.hq.toLowerCase().includes(term));
    }
    // Then sort
    return [...filtered].sort((a, b) => {
      let aValue: any = a[sortField as keyof Company] || 0;
      let bValue: any = b[sortField as keyof Company] || 0;
      // Handle string comparison
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      // Handle numeric comparison
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };
  const handleCopyName = (id: number, name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  if (loading) {
    return <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-gray-700 border-opacity-25"></div>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-emerald-500 animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-400 font-medium">Loading companies...</p>
          <p className="mt-2 text-gray-600 text-sm">This may take a moment</p>
        </div>
      </div>;
  }
  if (companies.length === 0) {
    return <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg p-8 text-center">
        <div className="py-16 max-w-md mx-auto">
          <div className="bg-gray-800 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <SearchIcon size={32} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-300 mb-3">
            No companies found
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Try adjusting your filters or search criteria to see more results.
          </p>
          <button onClick={() => window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 inline-flex items-center">
            <ChevronUpIcon size={18} className="mr-2" />
            Modify Filters
          </button>
        </div>
      </div>;
  }
  const sortedCompanies = getSortedCompanies();
  // Render a sort header with appropriate indicators
  const SortableHeader = ({
    field,
    label
  }: {
    field: string;
    label: string;
  }) => <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors duration-150" onClick={() => handleSort(field)} aria-sort={sortField === field ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}>
      <div className="flex items-center">
        <span>{label}</span>
        <span className="ml-1.5">
          {sortField === field ? sortDirection === 'asc' ? <ChevronUpIcon size={16} className="text-emerald-500" /> : <ChevronDownIcon size={16} className="text-emerald-500" /> : <ChevronUpIcon size={16} className="text-gray-600 opacity-50" />}
        </span>
      </div>
    </th>;
  return <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-800 bg-gray-850">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <SearchIcon size={16} className="text-gray-500" />
          </div>
          <input type="text" className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="Search companies by name, sector or location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="mt-2.5 flex justify-between items-center text-xs text-gray-500">
          <span>{sortedCompanies.length} companies found</span>
          <span>
            Sorted by{' '}
            <span className="text-emerald-500 font-medium">{sortField}</span> (
            {sortDirection === 'asc' ? 'ascending' : 'descending'})
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-850 sticky top-0 z-10">
            <tr>
              <th scope="col" className="w-10 px-4 py-3.5"></th>
              <SortableHeader field="name" label="Name" />
              <SortableHeader field="sector" label="Sector" />
              <SortableHeader field="employees" label="Employees" />
              <SortableHeader field="growth_rate" label="Growth %" />
              <th scope="col" className="px-4 py-3.5 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Funding
              </th>
              <th scope="col" className="px-4 py-3.5 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Stale
              </th>
              <SortableHeader field="clarity_score" label="Clarity" />
              <th scope="col" className="px-4 py-3.5 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Churn
              </th>
              <SortableHeader field="score" label="Score" />
              <th scope="col" className="px-4 py-3.5 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {sortedCompanies.map(company => <Fragment key={company.id}>
                <tr className={`group hover:bg-gray-850 transition-colors duration-150 ${expandedCompany === company.id ? 'bg-gray-850' : ''}`}>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button onClick={() => toggleExpand(company.id)} className="text-gray-500 hover:text-white focus:outline-none focus:text-white transition-colors duration-150 p-1 rounded-full hover:bg-gray-800" aria-label={expandedCompany === company.id ? 'Collapse details' : 'Expand details'}>
                      {expandedCompany === company.id ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />}
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors duration-150">
                      {company.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                    {company.sector}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 text-right">
                    {company.employees.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                    <span className={`inline-flex items-center transition-colors duration-150 ${company.growth_rate >= 30 ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {company.growth_rate >= 30 && <ArrowUpIcon size={14} className="mr-1" />}
                      {company.growth_rate}%
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                    {company.recent_funding ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/50">
                        <BriefcaseIcon size={12} className="mr-1" />
                        Yes
                      </span> : <span className="text-gray-600">No</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                    {company.stale_design ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800/50">
                        <EyeIcon size={12} className="mr-1" />
                        Yes
                      </span> : <span className="text-gray-600">No</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${company.clarity_score <= 3 ? 'bg-red-900/30 text-red-400 border border-red-800/50' : company.clarity_score <= 6 ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'}`}>
                      {company.clarity_score}/10
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                    {company.churn_indicators > 0 ? <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${company.churn_indicators >= 2 ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-amber-900/30 text-amber-400 border border-amber-800/50'}`}>
                        <AlertTriangleIcon size={12} className="mr-1" />
                        {company.churn_indicators}
                      </span> : <span className="text-gray-600">0</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-right font-medium">
                    <div className="flex justify-end">
                      <span className={`px-3 py-1 rounded-full font-medium ${(company.score || 0) >= 80 ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : (company.score || 0) >= 60 ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' : (company.score || 0) >= 40 ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'}`}>
                        {company.score}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors duration-150 p-1.5 hover:bg-gray-800 rounded-full" aria-label={`Visit ${company.name} website`}>
                          <ExternalLinkIcon size={16} />
                          <span className="sr-only">Visit website</span>
                        </a> : <span className="p-1.5 text-gray-600">
                          <ExternalLinkIcon size={16} />
                        </span>}
                      <button onClick={() => handleCopyName(company.id, company.name)} className={`transition-colors duration-150 p-1.5 hover:bg-gray-800 rounded-full ${copiedId === company.id ? 'text-emerald-500' : 'text-gray-500 hover:text-white'}`} aria-label="Copy company name">
                        {copiedId === company.id ? <CheckIcon size={16} /> : <ClipboardCopyIcon size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Expanded row with additional details */}
                {expandedCompany === company.id && <tr className="bg-gray-850">
                    <td colSpan={11} className="px-8 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                            <MapPinIcon size={16} className="mr-2 text-emerald-500" />
                            Company Details
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Headquarters
                              </span>
                              <span className="text-gray-300 font-medium">
                                {company.hq || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Last Updated
                              </span>
                              <span className="text-gray-300">
                                {company.last_updated || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Created</span>
                              <span className="text-gray-300 flex items-center">
                                <CalendarIcon size={14} className="mr-1.5 text-gray-500" />
                                {new Date(company.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                            <BarChart2Icon size={16} className="mr-2 text-emerald-500" />
                            Score Breakdown
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Growth Factor
                              </span>
                              <span className={company.growth_rate >= 30 ? 'text-emerald-500 font-medium' : 'text-gray-400'}>
                                {company.growth_rate}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Clarity Score
                              </span>
                              <span className={company.clarity_score <= 5 ? 'text-amber-400 font-medium' : 'text-gray-400'}>
                                {company.clarity_score}/10
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Churn Indicators
                              </span>
                              <span className={company.churn_indicators >= 1 ? 'text-amber-400 font-medium' : 'text-gray-400'}>
                                {company.churn_indicators}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                            <ZapIcon size={16} className="mr-2 text-emerald-500" />
                            Actions
                          </h4>
                          <div className="flex flex-col space-y-3">
                            {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 shadow-sm">
                                <ExternalLinkIcon size={14} className="mr-2" />
                                Visit Website
                              </a>}
                            <button className={`${copiedId === company.id ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'} text-sm py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 shadow-sm`} onClick={() => handleCopyName(company.id, company.name)}>
                              {copiedId === company.id ? <>
                                  <CheckIcon size={14} className="mr-2" />
                                  Copied!
                                </> : <>
                                  <ClipboardCopyIcon size={14} className="mr-2" />
                                  Copy Name
                                </>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>}
              </Fragment>)}
          </tbody>
        </table>
      </div>
    </div>;
};