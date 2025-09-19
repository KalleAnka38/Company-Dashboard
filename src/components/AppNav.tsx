import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UploadIcon, BookmarkIcon, SearchIcon, SettingsIcon } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
export function AppNav() {
  const pathname = usePathname();
  const [apiConnected, setApiConnected] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // Check API health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setApiConnected(data.status === 'ok');
      } catch (error) {
        console.error('API health check failed:', error);
        setApiConnected(false);
      }
    };
    checkHealth();
  }, []);
  return <>
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold mb-4 sm:mb-0">Company Finder</h1>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${apiConnected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                <div size={14} className="mr-1" />
                API {apiConnected ? 'Connected' : 'Disconnected'}
              </span>
              <button onClick={() => setIsSettingsModalOpen(true)} className="px-3 py-1 bg-gray-700 rounded-full text-xs font-medium flex items-center hover:bg-gray-600 transition-colors">
                <SettingsIcon size={14} className="mr-1" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <Link href="/" className={`px-4 py-3 flex items-center text-sm font-medium border-b-2 ${pathname === '/' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}>
              <SearchIcon size={16} className="mr-2" />
              Finder
            </Link>
            <Link href="/upload" className={`px-4 py-3 flex items-center text-sm font-medium border-b-2 ${pathname === '/upload' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}>
              <UploadIcon size={16} className="mr-2" />
              Upload
            </Link>
            <Link href="/views" className={`px-4 py-3 flex items-center text-sm font-medium border-b-2 ${pathname === '/views' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}>
              <BookmarkIcon size={16} className="mr-2" />
              Saved Views
            </Link>
          </div>
        </div>
      </nav>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>;
}