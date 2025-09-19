import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookmarkIcon, SearchIcon, UploadIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { useAuth } from './auth/AuthContext';
import { UserMenu } from './auth/UserMenu';
import { AuthModal } from './auth/AuthModal';
export const NavBar: React.FC = () => {
  const pathname = usePathname();
  const {
    user
  } = useAuth();
  const [apiConnected, setApiConnected] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Check API health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setApiConnected(data.status === 'ok');
      } catch (error) {
        setApiConnected(false);
        console.error('API health check failed:', error);
      }
    };
    checkHealth();
    // Check again every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);
  return <>
      <header className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium text-white">Company Finder</h1>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                <span className="text-sm text-gray-400">
                  API: {apiConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {user ? <UserMenu /> : <button onClick={() => setIsAuthModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-sm flex items-center transition-colors">
                  <UserIcon size={14} className="mr-1.5" />
                  Sign In
                </button>}
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Settings">
                <SettingsIcon size={18} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <nav className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex space-x-6">
            <Link href="/" className={`px-1 py-4 flex items-center text-sm font-medium border-b-2 ${pathname === '/' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <SearchIcon size={16} className="mr-2" />
              Finder
            </Link>
            <Link href="/upload" className={`px-1 py-4 flex items-center text-sm font-medium border-b-2 ${pathname === '/upload' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <UploadIcon size={16} className="mr-2" />
              Upload
            </Link>
            <Link href="/views" className={`px-1 py-4 flex items-center text-sm font-medium border-b-2 ${pathname === '/views' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <BookmarkIcon size={16} className="mr-2" />
              Saved Views
            </Link>
          </div>
        </div>
      </nav>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>;
};