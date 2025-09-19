import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { checkApiHealth } from '../api/companiesApi';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, DatabaseIcon, RefreshCwIcon } from 'lucide-react';
export const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [dataFetchStatus, setDataFetchStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  useEffect(() => {
    testConnection();
  }, []);
  const testConnection = async () => {
    // Reset states
    setConnectionStatus('loading');
    setDataFetchStatus('loading');
    setAuthStatus('loading');
    setErrorMessage(null);
    setResponseData(null);
    try {
      // Test 1: Check API health
      const healthResult = await checkApiHealth();
      setConnectionStatus(healthResult.status === 'ok' ? 'connected' : 'error');
      // Test 2: Attempt to fetch data
      try {
        const {
          data,
          error
        } = await supabase.from('companies').select('*').limit(1);
        if (error) throw error;
        setDataFetchStatus('success');
        setResponseData(data);
      } catch (error) {
        console.error('Data fetch error:', error);
        setDataFetchStatus('error');
        setErrorMessage((error as Error).message);
      }
      // Test 3: Check auth service
      try {
        const {
          data,
          error
        } = await supabase.auth.getSession();
        if (error) throw error;
        setAuthStatus('success');
      } catch (error) {
        console.error('Auth service error:', error);
        setAuthStatus('error');
        setErrorMessage(prev => prev || (error as Error).message);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
      setErrorMessage((error as Error).message);
    }
  };
  const StatusIndicator = ({
    status,
    label
  }: {
    status: 'loading' | 'connected' | 'success' | 'error';
    label: string;
  }) => <div className="flex items-center mb-3">
      {status === 'loading' ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-3"></div> : status === 'connected' || status === 'success' ? <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-3" /> : <XCircleIcon className="w-5 h-5 text-red-500 mr-3" />}
      <span className={`font-medium ${status === 'error' ? 'text-red-400' : status === 'loading' ? 'text-gray-400' : 'text-emerald-400'}`}>
        {label}:{' '}
        {status === 'loading' ? 'Testing...' : status === 'connected' || status === 'success' ? 'Success' : 'Failed'}
      </span>
    </div>;
  return <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <DatabaseIcon className="mr-2 text-emerald-500" size={20} />
          Supabase Connection Test
        </h2>
        <button onClick={testConnection} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
          <RefreshCwIcon size={16} className="mr-2" />
          Retest
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <StatusIndicator status={connectionStatus} label="API Connection" />
          <StatusIndicator status={dataFetchStatus} label="Data Fetch" />
          <StatusIndicator status={authStatus} label="Auth Service" />
        </div>
        {errorMessage && <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <AlertCircleIcon className="text-red-500 mr-3 mt-0.5" size={18} />
              <div>
                <h3 className="text-red-400 font-medium mb-1">Error Details</h3>
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            </div>
          </div>}
        {responseData && <div className="mt-6">
            <h3 className="text-gray-300 font-medium mb-2">Sample Data:</h3>
            <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-64">
              <pre className="text-xs text-gray-400">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          </div>}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-gray-300 font-medium mb-2">Connection Info:</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Supabase URL:</span>
              <span className="text-gray-300 font-mono">
                {supabase.supabaseUrl}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Auth Config:</span>
              <span className="text-gray-300">
                {supabase.auth.autoRefreshToken ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};