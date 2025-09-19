import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { updatePassword } from '../lib/supabase/auth';
import { toast } from 'react-toastify';
import { UserIcon, KeyIcon, LogOutIcon, SaveIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { signOut } from '../lib/supabase/auth';
export const Profile: React.FC = () => {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsSaving(true);
    try {
      await updatePassword(newPassword);
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <UserIcon size={24} className="mr-2 text-emerald-500" />
            Profile Settings
          </h2>
        </div>
        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4">
              Account Information
            </h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center mr-4">
                  {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" /> : <UserIcon size={24} className="text-white" />}
                </div>
                <div>
                  <h4 className="text-white font-medium">
                    {user.user_metadata?.full_name || 'User'}
                  </h4>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">User ID</p>
                  <p className="text-gray-300 text-sm font-mono bg-gray-850 p-2 rounded">
                    {user.id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Email Verified</p>
                  <p className="text-sm">
                    {user.email_confirmed_at ? <span className="text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full text-xs">
                        Verified
                      </span> : <span className="text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full text-xs">
                        Not Verified
                      </span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Security</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <form onSubmit={handleUpdatePassword}>
                {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>}
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon size={16} className="text-gray-500" />
                    </div>
                    <input id="newPassword" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 focus:border-emerald-500 rounded-lg pl-10 pr-10 py-2 text-sm text-white transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="Enter new password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300">
                      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon size={16} className="text-gray-500" />
                    </div>
                    <input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 focus:border-emerald-500 rounded-lg pl-10 pr-10 py-2 text-sm text-white transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="Confirm new password" />
                  </div>
                </div>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center" disabled={isSaving}>
                  {isSaving ? <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </> : <>
                      <SaveIcon size={16} className="mr-2" />
                      Update Password
                    </>}
                </button>
              </form>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Session</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
                <LogOutIcon size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};