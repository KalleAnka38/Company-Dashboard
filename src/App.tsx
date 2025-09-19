import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Finder } from './pages/Finder';
import { Upload } from './pages/Upload';
import { Views } from './pages/Views';
import { Profile } from './pages/Profile';
import TestSupabase from './pages/TestSupabase';
import { Todos } from './pages/Todos';
import { UploadIcon, BookmarkIcon, SearchIcon, ActivityIcon, UserIcon, DatabaseIcon, CheckSquareIcon } from 'lucide-react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { UserMenu } from './components/auth/UserMenu';
import { AuthModal } from './components/auth/AuthModal';
export function App() {
  const [apiConnected, setApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Simulate API health check
  useEffect(() => {
    const checkHealth = async () => {
      // In a real app, this would be an actual API call
      setTimeout(() => {
        setApiConnected(true);
        setIsLoading(false);
      }, 1000);
    };
    checkHealth();
  }, []);
  return <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-950 text-gray-100">
          <header className="bg-gray-900 border-b border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0 tracking-tight">
                  Company Finder
                </h1>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center transition-colors duration-300 ${isLoading ? 'bg-gray-800 text-gray-400' : apiConnected ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                    {isLoading ? <ActivityIcon size={14} className="mr-1.5 animate-pulse" /> : <div className={`w-2 h-2 rounded-full mr-1.5 ${apiConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />}
                    API{' '}
                    {isLoading ? 'Connecting...' : apiConnected ? 'Connected' : 'Disconnected'}
                  </span>
                  <UserMenuOrSignIn setAuthModalOpen={setIsAuthModalOpen} />
                </div>
              </div>
            </div>
          </header>
          <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
            <div className="container mx-auto px-4">
              <div className="flex space-x-1 overflow-x-auto">
                <NavLink to="/" className={({
                isActive
              }) => `px-4 py-3 flex items-center text-sm font-medium border-b-2 transition-all duration-200 ${isActive ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'}`}>
                  <SearchIcon size={16} className="mr-2" />
                  Finder
                </NavLink>
                <NavLink to="/upload" className={({
                isActive
              }) => `px-4 py-3 flex items-center text-sm font-medium border-b-2 transition-all duration-200 ${isActive ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'}`}>
                  <UploadIcon size={16} className="mr-2" />
                  Upload
                </NavLink>
                <NavLink to="/views" className={({
                isActive
              }) => `px-4 py-3 flex items-center text-sm font-medium border-b-2 transition-all duration-200 ${isActive ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'}`}>
                  <BookmarkIcon size={16} className="mr-2" />
                  Saved Views
                </NavLink>
                <NavLink to="/profile" className={({
                isActive
              }) => `px-4 py-3 flex items-center text-sm font-medium border-b-2 transition-all duration-200 ${isActive ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'}`}>
                  <UserIcon size={16} className="mr-2" />
                  Profile
                </NavLink>
                <NavLink to="/test-supabase" className={({
                isActive
              }) => `px-4 py-3 flex items-center text-sm font-medium border-b-2 transition-all duration-200 ${isActive ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'}`}>
                  <DatabaseIcon size={16} className="mr-2" />
                  Test Supabase
                </NavLink>
                <NavLink to="/todos" className={({
                isActive
              }) => `px-4 py-3 flex items-center text-sm font-medium border-b-2 transition-all duration-200 ${isActive ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'}`}>
                  <CheckSquareIcon size={16} className="mr-2" />
                  Todos
                </NavLink>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Finder />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/views" element={<Views />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/test-supabase" element={<TestSupabase />} />
              <Route path="/todos" element={<Todos />} />
            </Routes>
          </main>
          <footer className="bg-gray-900 border-t border-gray-800 py-4">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Company Finder - All rights
              reserved
            </div>
          </footer>
        </div>
        <ToastContainer position="bottom-right" theme="dark" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover toastClassName="bg-gray-900 border border-gray-800 shadow-lg rounded-lg" />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </Router>
    </AuthProvider>;
}
// Helper component to show either UserMenu or Sign In button
const UserMenuOrSignIn = ({
  setAuthModalOpen
}: {
  setAuthModalOpen: (open: boolean) => void;
}) => {
  const {
    user,
    loading
  } = useAuth();
  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse"></div>;
  }
  if (user) {
    return <UserMenu />;
  }
  return <button onClick={() => setAuthModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-sm flex items-center transition-colors">
      <UserIcon size={14} className="mr-1.5" />
      Sign In
    </button>;
};