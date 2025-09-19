import React, { useEffect, useState, useRef } from 'react';
import { XIcon, EyeIcon, EyeOffIcon, ShieldIcon, AlertCircleIcon, CheckIcon, LockIcon, InfoIcon, RefreshCwIcon, BarChart2Icon, ClipboardIcon, ActivityIcon, KeyIcon } from 'lucide-react';
import { useSecurity } from '@/lib/security/SecurityContext';
import { validateApiKeyFormat, checkApiKeyStrength, ApiKeyStrength, saveApiKey, createNewApiKey } from '@/lib/security/apiKeyValidation';
import { SecurityDashboard } from './SecurityDashboard';
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    csrfToken,
    securityLevel,
    setSecurityLevel
  } = useSecurity();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');
  const [keyStrength, setKeyStrength] = useState<ApiKeyStrength>(ApiKeyStrength.WEAK);
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general');
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Load API key from sessionStorage when modal opens
    if (isOpen) {
      const loadApiKey = async () => {
        try {
          const savedApiKey = sessionStorage.getItem('cf_api_key') || '';
          setApiKey(savedApiKey);
          setError('');
          // Check strength of loaded key
          if (savedApiKey) {
            setKeyStrength(checkApiKeyStrength(savedApiKey));
          }
        } catch (error) {
          console.error('Error loading API key:', error);
        }
      };
      loadApiKey();
    }
  }, [isOpen]);
  // Update key strength when API key changes
  useEffect(() => {
    if (apiKey) {
      setKeyStrength(checkApiKeyStrength(apiKey));
    } else {
      setKeyStrength(ApiKeyStrength.WEAK);
    }
  }, [apiKey]);
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  const handleSave = () => {
    try {
      // Validate API key format
      if (apiKey && !validateApiKeyFormat(apiKey)) {
        setError('API key must be at least 12 alphanumeric characters');
        return;
      }
      // Save API key
      if (apiKey) {
        saveApiKey(apiKey).then(saved => {
          if (!saved) {
            setError('Failed to save API key. Please try again.');
            return;
          }
          onClose();
        });
      } else {
        sessionStorage.removeItem('cf_api_key');
        onClose();
      }
    } catch (err) {
      console.error('Error saving API key:', err);
      setError('Failed to save settings. Please try again.');
    }
  };
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };
  const handleGenerateApiKey = () => {
    const newKey = createNewApiKey(32);
    setApiKey(newKey);
    setShowApiKey(true);
    setKeyCopied(false);
  };
  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };
  // Get strength indicator properties
  const getStrengthIndicator = () => {
    switch (keyStrength) {
      case ApiKeyStrength.STRONG:
        return {
          width: '100%',
          color: 'bg-green-500',
          text: 'Strong',
          textColor: 'text-green-500'
        };
      case ApiKeyStrength.MEDIUM:
        return {
          width: '66%',
          color: 'bg-yellow-500',
          text: 'Medium',
          textColor: 'text-yellow-500'
        };
      default:
        return {
          width: '33%',
          color: 'bg-red-500',
          text: 'Weak',
          textColor: 'text-red-500'
        };
    }
  };
  const strengthIndicator = getStrengthIndicator();
  if (!isOpen) return null;
  if (showSecurityDashboard) {
    return <SecurityDashboard onClose={() => setShowSecurityDashboard(false)} />;
  }
  return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="settings-title">
      <div ref={modalRef} className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
          <h3 id="settings-title" className="text-lg font-medium text-white flex items-center">
            <ShieldIcon size={18} className="mr-2 text-emerald-500" />
            Security Settings
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1 rounded-full hover:bg-gray-800 transition-colors" aria-label="Close dialog">
            <XIcon size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button onClick={() => setActiveTab('general')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'general' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            General
          </button>
          <button onClick={() => setActiveTab('advanced')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'advanced' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            Advanced
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'general' && <>
              {/* API Key Section */}
              <div className="mb-5">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input type={showApiKey ? 'text' : 'password'} id="apiKey" value={apiKey} onChange={e => {
                setApiKey(e.target.value);
                setError('');
              }} placeholder="Enter your API key" className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" aria-describedby={error ? 'api-key-error' : 'api-key-help'} />
                  <button type="button" onClick={toggleShowApiKey} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300" aria-label={showApiKey ? 'Hide API key' : 'Show API key'}>
                    {showApiKey ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                <div className="flex space-x-2 mt-2">
                  <button type="button" onClick={handleGenerateApiKey} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-2 rounded flex items-center">
                    <KeyIcon size={12} className="mr-1" />
                    Generate
                  </button>
                  <button type="button" onClick={handleCopyApiKey} disabled={!apiKey} className={`text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-2 rounded flex items-center ${!apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {keyCopied ? <>
                        <CheckIcon size={12} className="mr-1 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </> : <>
                        <ClipboardIcon size={12} className="mr-1" />
                        Copy
                      </>}
                  </button>
                </div>
                {/* API Key Strength Meter */}
                {apiKey && <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">
                        Key strength:
                      </span>
                      <span className={`text-xs font-medium ${strengthIndicator.textColor}`}>
                        {strengthIndicator.text}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthIndicator.color} rounded-full transition-all duration-300`} style={{
                  width: strengthIndicator.width
                }}></div>
                    </div>
                  </div>}
                {error ? <div id="api-key-error" className="mt-2 flex items-start text-sm text-red-500">
                    <AlertCircleIcon size={16} className="mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div> : <p id="api-key-help" className="mt-2 text-sm text-gray-500">
                    This key is required for write operations like saving views
                    and uploading data. The key is stored in your browser
                    session and will be cleared when you close the browser.
                  </p>}
              </div>
              {/* Security Level Section */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Security Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setSecurityLevel('low')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${securityLevel === 'low' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-750'}`}>
                    {securityLevel === 'low' && <CheckIcon size={14} className="mr-1.5" />}
                    Low
                  </button>
                  <button type="button" onClick={() => setSecurityLevel('medium')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${securityLevel === 'medium' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-750'}`}>
                    {securityLevel === 'medium' && <CheckIcon size={14} className="mr-1.5" />}
                    Medium
                  </button>
                  <button type="button" onClick={() => setSecurityLevel('high')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${securityLevel === 'high' ? 'bg-purple-900/50 text-purple-400 border border-purple-800' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-750'}`}>
                    {securityLevel === 'high' && <CheckIcon size={14} className="mr-1.5" />}
                    High
                  </button>
                </div>
                <div className="mt-2 text-sm">
                  {securityLevel === 'low' && <p className="text-blue-400 flex items-start">
                      <InfoIcon size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                      Basic security with minimal restrictions
                    </p>}
                  {securityLevel === 'medium' && <p className="text-emerald-400 flex items-start">
                      <InfoIcon size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                      Balanced security with standard protections
                    </p>}
                  {securityLevel === 'high' && <p className="text-purple-400 flex items-start">
                      <InfoIcon size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                      Maximum security with auto-logout after 30 minutes of
                      inactivity
                    </p>}
                </div>
              </div>
            </>}

          {activeTab === 'advanced' && <>
              {/* CSRF Token Display (for transparency) */}
              <div className="bg-gray-800 p-4 rounded-lg mb-5">
                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                  <LockIcon size={14} className="mr-1.5 text-emerald-500" />
                  CSRF Protection
                </h4>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">
                    Active token:
                  </span>
                  <code className="text-xs bg-gray-850 px-2 py-1 rounded font-mono text-gray-400 truncate max-w-[180px] overflow-hidden">
                    {csrfToken.substring(0, 16)}...
                  </code>
                </div>
                <button className="mt-2 text-xs bg-gray-750 hover:bg-gray-700 text-gray-400 py-1 px-2 rounded flex items-center" onClick={() => useSecurity().refreshCSRFToken()}>
                  <RefreshCwIcon size={12} className="mr-1" />
                  Refresh Token
                </button>
              </div>

              {/* Security Features */}
              <div className="bg-gray-800 p-4 rounded-lg mb-5">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">
                  Security Features
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart2Icon size={14} className="mr-2 text-emerald-500" />
                      <span className="text-sm text-gray-300">
                        Content Security Policy
                      </span>
                    </div>
                    <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ActivityIcon size={14} className="mr-2 text-emerald-500" />
                      <span className="text-sm text-gray-300">
                        Rate Limiting
                      </span>
                    </div>
                    <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <LockIcon size={14} className="mr-2 text-emerald-500" />
                      <span className="text-sm text-gray-300">
                        Secure Storage
                      </span>
                    </div>
                    <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50">
                      Enabled
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowSecurityDashboard(true)} className="mt-4 w-full bg-gray-750 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center">
                  <ShieldIcon size={14} className="mr-2 text-emerald-500" />
                  Open Security Dashboard
                </button>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg mb-5">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Security Notice
                </h4>
                <p className="text-xs text-gray-400">
                  Your API key is stored securely in your browser session and is
                  only sent over HTTPS. Never share your API key with others or
                  use it in public environments.
                </p>
              </div>
            </>}

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-5 rounded-lg transition-colors duration-200">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>;
};