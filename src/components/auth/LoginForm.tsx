import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail, resetPassword } from '../../lib/supabase/auth';
import { toast } from 'react-toastify';
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon } from 'lucide-react';
enum AuthMode {
  LOGIN = 'login',
  REGISTER = 'register',
  RESET = 'reset',
}
export const LoginForm: React.FC<{
  onSuccess?: () => void;
}> = ({
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === AuthMode.LOGIN) {
        await signInWithEmail(email, password);
        toast.success('Signed in successfully');
      } else if (mode === AuthMode.REGISTER) {
        await signUpWithEmail(email, password, fullName);
        toast.success('Signed up successfully! Please check your email to confirm your account.');
      } else if (mode === AuthMode.RESET) {
        await resetPassword(email);
        toast.success('Password reset email sent. Please check your inbox.');
        setMode(AuthMode.LOGIN);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return <div className="w-full max-w-md mx-auto bg-gray-900 rounded-xl border border-gray-800 shadow-xl p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {mode === AuthMode.LOGIN ? 'Sign In' : mode === AuthMode.REGISTER ? 'Create Account' : 'Reset Password'}
        </h2>
        <p className="text-gray-400 text-sm">
          {mode === AuthMode.LOGIN ? 'Sign in to access your account' : mode === AuthMode.REGISTER ? 'Create a new account to get started' : 'Enter your email to reset your password'}
        </p>
      </div>
      {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === AuthMode.REGISTER && <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon size={18} className="text-gray-500" />
              </div>
              <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="Your full name" required={mode === AuthMode.REGISTER} />
            </div>
          </div>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MailIcon size={18} className="text-gray-500" />
            </div>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="you@example.com" required />
          </div>
        </div>
        {mode !== AuthMode.RESET && <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon size={18} className="text-gray-500" />
              </div>
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder={mode === AuthMode.LOGIN ? 'Your password' : 'Create a password'} required={mode !== AuthMode.RESET} />
              <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            {mode === AuthMode.LOGIN && <div className="mt-1 text-right">
                <button type="button" onClick={() => setMode(AuthMode.RESET)} className="text-emerald-500 hover:text-emerald-400 text-xs">
                  Forgot password?
                </button>
              </div>}
          </div>}
        <button type="submit" className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={loading}>
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <ArrowRightIcon size={18} className="mr-2" />}
          {mode === AuthMode.LOGIN ? 'Sign In' : mode === AuthMode.REGISTER ? 'Create Account' : 'Send Reset Link'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        {mode === AuthMode.LOGIN ? <p className="text-gray-400">
            Don't have an account?{' '}
            <button onClick={() => setMode(AuthMode.REGISTER)} className="text-emerald-500 hover:text-emerald-400 font-medium">
              Sign up
            </button>
          </p> : <p className="text-gray-400">
            Already have an account?{' '}
            <button onClick={() => setMode(AuthMode.LOGIN)} className="text-emerald-500 hover:text-emerald-400 font-medium">
              Sign in
            </button>
          </p>}
      </div>
    </div>;
};