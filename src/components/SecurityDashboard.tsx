import React, { useEffect, useState, createElement, Component } from 'react';
import { ShieldIcon, AlertCircleIcon, InfoIcon, ClockIcon, FilterIcon, RefreshCwIcon, SearchIcon, ChevronDownIcon, XIcon, CheckIcon, AlertTriangleIcon, DownloadIcon } from 'lucide-react';
import { SecurityEvent, SecurityEventType, SecurityEventLevel, getSecurityLogs, clearSecurityLogs } from '@/lib/security/logger';
import { testSecureStorage } from '@/lib/security/secureStorage';
interface SecurityDashboardProps {
  onClose: () => void;
}
export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  onClose
}) => {
  const [logs, setLogs] = useState<SecurityEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityEvent[]>([]);
  const [filter, setFilter] = useState<{
    type: SecurityEventType | 'ALL';
    level: SecurityEventLevel | 'ALL';
    search: string;
  }>({
    type: 'ALL',
    level: 'ALL',
    search: ''
  });
  const [secureStorageStatus, setSecureStorageStatus] = useState<boolean | null>(null);
  const [isStorageLoading, setIsStorageLoading] = useState(true);
  // Fetch logs and test secure storage
  useEffect(() => {
    const fetchLogs = () => {
      const securityLogs = getSecurityLogs();
      setLogs(securityLogs);
      setFilteredLogs(securityLogs);
    };
    fetchLogs();
    // Test secure storage
    const testStorage = async () => {
      setIsStorageLoading(true);
      const result = await testSecureStorage();
      setSecureStorageStatus(result);
      setIsStorageLoading(false);
    };
    testStorage();
    // Set up interval to refresh logs
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);
  // Apply filters when filter changes
  useEffect(() => {
    let result = [...logs];
    // Filter by type
    if (filter.type !== 'ALL') {
      result = result.filter(log => log.type === filter.type);
    }
    // Filter by level
    if (filter.level !== 'ALL') {
      result = result.filter(log => log.level === filter.level);
    }
    // Filter by search term
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      result = result.filter(log => log.message.toLowerCase().includes(searchTerm) || JSON.stringify(log.data || {}).toLowerCase().includes(searchTerm));
    }
    setFilteredLogs(result);
  }, [logs, filter]);
  // Reset filters
  const resetFilters = () => {
    setFilter({
      type: 'ALL',
      level: 'ALL',
      search: ''
    });
  };
  // Clear logs
  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all security logs?')) {
      clearSecurityLogs();
      setLogs([]);
      setFilteredLogs([]);
    }
  };
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  // Get level badge color
  const getLevelBadgeColor = (level: SecurityEventLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-900/30 text-red-400 border-red-800/50';
      case 'ERROR':
        return 'bg-orange-900/30 text-orange-400 border-orange-800/50';
      case 'WARNING':
        return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
      case 'INFO':
      default:
        return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
    }
  };
  // Get level icon
  const getLevelIcon = (level: SecurityEventLevel) => {
    switch (level) {
      case 'CRITICAL':
      case 'ERROR':
        return <AlertCircleIcon size={14} className="mr-1" />;
      case 'WARNING':
        return <AlertTriangleIcon size={14} className="mr-1" />;
      case 'INFO':
      default:
        return <InfoIcon size={14} className="mr-1" />;
    }
  };
  // Export logs as JSON
  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShieldIcon size={20} className="mr-2 text-emerald-500" />
            Security Dashboard
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1 rounded-full hover:bg-gray-800 transition-colors">
            <XIcon size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-800">
          {/* Security Status Card */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Security Status
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">CSRF Protection</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
                <CheckIcon size={12} className="mr-1" />
                Active
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400">Secure Storage</span>
              {isStorageLoading ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-400 border border-gray-600/50">
                  <div className="w-2 h-2 mr-1 rounded-full border-t-2 border-b-2 border-gray-400 animate-spin"></div>
                  Testing...
                </span> : <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${secureStorageStatus ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'}`}>
                  {secureStorageStatus ? <>
                      <CheckIcon size={12} className="mr-1" />
                      Active
                    </> : <>
                      <XIcon size={12} className="mr-1" />
                      Inactive
                    </>}
                </span>}
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400">Content Security Policy</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
                <CheckIcon size={12} className="mr-1" />
                Enforced
              </span>
            </div>
          </div>
          {/* Recent Activity Card */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Recent Activity
            </h3>
            <div className="space-y-2">
              {logs.slice(0, 3).map((log, index) => <div key={index} className="flex items-start">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${log.level === 'ERROR' || log.level === 'CRITICAL' ? 'bg-red-500' : log.level === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'} mr-2`}></div>
                  <div className="text-xs text-gray-400 truncate">
                    {log.message}
                  </div>
                </div>)}
              {logs.length === 0 && <div className="text-xs text-gray-500 italic">
                  No recent activity
                </div>}
            </div>
          </div>
          {/* Security Statistics Card */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Security Statistics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-750 rounded p-2">
                <div className="text-xs text-gray-500">Total Events</div>
                <div className="text-lg font-medium text-white">
                  {logs.length}
                </div>
              </div>
              <div className="bg-gray-750 rounded p-2">
                <div className="text-xs text-gray-500">Warnings</div>
                <div className="text-lg font-medium text-amber-400">
                  {logs.filter(log => log.level === 'WARNING').length}
                </div>
              </div>
              <div className="bg-gray-750 rounded p-2">
                <div className="text-xs text-gray-500">Errors</div>
                <div className="text-lg font-medium text-red-400">
                  {logs.filter(log => log.level === 'ERROR' || log.level === 'CRITICAL').length}
                </div>
              </div>
              <div className="bg-gray-750 rounded p-2">
                <div className="text-xs text-gray-500">File Validations</div>
                <div className="text-lg font-medium text-blue-400">
                  {logs.filter(log => log.type === 'FILE').length}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Log Filters */}
        <div className="px-6 py-4 border-b border-gray-800 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon size={16} className="text-gray-500" />
              </div>
              <input type="text" className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="Search logs..." value={filter.search} onChange={e => setFilter({
              ...filter,
              search: e.target.value
            })} />
            </div>
          </div>
          <div className="w-40">
            <div className="relative">
              <select className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" value={filter.type} onChange={e => setFilter({
              ...filter,
              type: e.target.value as any
            })}>
                <option value="ALL">All Types</option>
                <option value="AUTH">Authentication</option>
                <option value="API_KEY">API Key</option>
                <option value="CSRF">CSRF</option>
                <option value="ACCESS">Access</option>
                <option value="INPUT">Input</option>
                <option value="FILE">File</option>
                <option value="SESSION">Session</option>
                <option value="RATE_LIMIT">Rate Limit</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDownIcon size={16} />
              </div>
            </div>
          </div>
          <div className="w-40">
            <div className="relative">
              <select className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-sm text-white appearance-none transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" value={filter.level} onChange={e => setFilter({
              ...filter,
              level: e.target.value as any
            })}>
                <option value="ALL">All Levels</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDownIcon size={16} />
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={resetFilters} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center" title="Reset filters">
              <RefreshCwIcon size={16} />
            </button>
            <button onClick={exportLogs} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center" title="Export logs">
              <DownloadIcon size={16} />
            </button>
          </div>
        </div>
        {/* Logs Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-850 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {filteredLogs.length > 0 ? filteredLogs.map((log, index) => <tr key={index} className="hover:bg-gray-850">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                      <div className="flex items-center">
                        <ClockIcon size={12} className="mr-1.5 text-gray-500" />
                        {formatTimestamp(log.timestamp || 0)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLevelBadgeColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300">
                      {log.message}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {log.data ? <pre className="text-xs overflow-x-auto max-w-xs">
                          {JSON.stringify(log.data, null, 2)}
                        </pre> : <span className="text-gray-600">-</span>}
                    </td>
                  </tr>) : <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    {logs.length === 0 ? 'No security logs found' : 'No logs match the current filters'}
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Showing {filteredLogs.length} of {logs.length} security events
          </div>
          <button onClick={handleClearLogs} className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Clear All Logs
          </button>
        </div>
      </div>
    </div>;
};