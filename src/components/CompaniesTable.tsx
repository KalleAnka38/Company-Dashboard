import React from 'react';
import { ExternalLinkIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon, XIcon } from 'lucide-react';
import { Company } from '../types';
interface CompaniesTableProps {
  companies: Company[];
  loading: boolean;
  onSort: (sortBy: string) => void;
}
const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  loading,
  onSort
}) => {
  if (loading) {
    return <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading companies...</p>
      </div>;
  }
  if (companies.length === 0) {
    return <div className="p-8 text-center">
        <p className="text-gray-400">
          No companies match your filters. Try adjusting your criteria.
        </p>
      </div>;
  }
  // Helper function for sorting columns
  const SortableHeader = ({
    name,
    field
  }: {
    name: string;
    field: string;
  }) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700" onClick={() => onSort(field)}>
      <div className="flex items-center">
        {name}
        <div className="ml-1 flex flex-col">
          <ArrowUpIcon size={10} className="mb-[-2px]" />
          <ArrowDownIcon size={10} />
        </div>
      </div>
    </th>;
  return <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800 sticky top-0">
          <tr>
            <SortableHeader name="Name" field="name" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Sector
            </th>
            <SortableHeader name="Employees" field="employees" />
            <SortableHeader name="Growth %" field="growth_rate" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Funding
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Stale
            </th>
            <SortableHeader name="Clarity" field="clarity_score" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Churn
            </th>
            <SortableHeader name="Score" field="score" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Website
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              HQ
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {companies.map(company => <tr key={company.id} className="hover:bg-gray-750">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                {company.name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {company.sector}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {company.employees.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`${company.growth_rate >= 30 ? 'text-green-400' : 'text-gray-300'}`}>
                  {company.growth_rate}%
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {company.recent_funding ? <CheckIcon size={18} className="text-green-400" /> : <XIcon size={18} className="text-gray-500" />}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {company.stale_design ? <CheckIcon size={18} className="text-yellow-400" /> : <XIcon size={18} className="text-gray-500" />}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`${company.clarity_score <= 5 ? 'text-yellow-400' : 'text-gray-300'}`}>
                  {company.clarity_score}/10
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`${company.churn_indicators >= 2 ? 'text-red-400' : company.churn_indicators === 1 ? 'text-yellow-400' : 'text-gray-300'}`}>
                  {company.churn_indicators}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <span className="px-2 py-1 rounded bg-blue-900 text-blue-200">
                  {company.score}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-400">
                {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                    Visit <ExternalLinkIcon size={14} className="ml-1" />
                  </a> : <span className="text-gray-500">-</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {company.hq || '-'}
              </td>
            </tr>)}
        </tbody>
      </table>
    </div>;
};
export default CompaniesTable;