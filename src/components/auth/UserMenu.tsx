import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { signOut } from '../../lib/supabase/auth';
import { toast } from 'react-toastify';
import { UserIcon, LogOutIcon, SettingsIcon, ChevronDownIcon } from 'lucide-react';
export const UserMenu: React.FC = () => {
  const {
    user,
    loading
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
    setIsOpen(false);
  };
  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse"></div>;
  }
  if (!user) {
    return null;
  }
  return <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-full py-1 pl-1 pr-3 transition-colors">
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
          {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-7 h-7 rounded-full object-cover" /> : <UserIcon size={14} className="text-white" />}
        </div>
        <span className="text-sm font-medium text-gray-300 max-w-[100px] truncate">
          {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
        </span>
        <ChevronDownIcon size={14} className="text-gray-400" />
      </button>
      {isOpen && <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 border border-gray-700 z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-white truncate">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <a href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center">
              <SettingsIcon size={14} className="mr-2" />
              Profile Settings
            </a>
            <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center">
              <LogOutIcon size={14} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>}
    </div>;
};