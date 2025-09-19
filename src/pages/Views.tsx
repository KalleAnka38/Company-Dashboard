import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookmarkIcon, TrashIcon, ExternalLinkIcon } from 'lucide-react';
import { SavedView } from '../utils/types';
import { fetchSavedViews, deleteSavedView } from '../api/companiesApi';
export const Views: React.FC = () => {
  const [views, setViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    loadViews();
  }, []);
  const loadViews = async () => {
    setLoading(true);
    try {
      const savedViews = await fetchSavedViews();
      setViews(savedViews);
    } catch (error) {
      toast.error('Failed to load saved views');
      console.error('Error loading saved views:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleApplyView = (querystring: string) => {
    navigate(`/?${querystring}`);
  };
  const handleDeleteView = async (id: number) => {
    if (!apiKey) {
      toast.error('API key is required to delete views');
      return;
    }
    try {
      await deleteSavedView(id, apiKey);
      setViews(views.filter(view => view.id !== id));
      toast.success('View deleted successfully');
    } catch (error) {
      toast.error('Failed to delete view');
      console.error('Error deleting view:', error);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  if (loading) {
    return <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>;
  }
  return <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-white flex items-center">
            <BookmarkIcon size={20} className="mr-2" />
            Saved Views
          </h2>
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm">
            Back to Finder
          </Link>
        </div>
        {/* API Key Input for Delete Operations */}
        <div className="mb-6">
          <label htmlFor="apiKeyViews" className="block text-sm font-medium text-gray-300 mb-2">
            API Key (required for deletion)
          </label>
          <input type="password" id="apiKeyViews" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full rounded-md bg-gray-700 border-gray-600 text-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" placeholder="Enter your API key" />
        </div>
        {views.length === 0 ? <div className="text-center py-10">
            <p className="text-gray-400">No saved views found</p>
            <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm">
              Create a View
            </Link>
          </div> : <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-700">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {views.map(view => <tr key={view.id} className="hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {view.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(view.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleApplyView(view.querystring)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center">
                          <ExternalLinkIcon size={14} className="mr-1" />
                          Apply
                        </button>
                        <button onClick={() => handleDeleteView(view.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors flex items-center">
                          <TrashIcon size={14} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </div>
    </div>;
};