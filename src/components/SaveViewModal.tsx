import React, { useEffect, useState, useRef } from 'react';
import { XIcon, SaveIcon, AlertCircleIcon } from 'lucide-react';
interface SaveViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}
export const SaveViewModal: React.FC<SaveViewModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [viewName, setViewName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) {
      setError('Please enter a name for your view');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(viewName.trim());
      setViewName('');
      setError('');
      onClose();
    } catch (error) {
      setError('Failed to save view. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="save-view-title">
      <div ref={modalRef} className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl max-w-md w-full relative z-10 animate-scaleIn">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h3 id="save-view-title" className="text-lg font-bold text-white flex items-center">
            <SaveIcon size={18} className="mr-2 text-emerald-500" />
            Save Current View
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-800" aria-label="Close dialog">
            <XIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label htmlFor="viewName" className="block text-sm font-medium text-gray-300 mb-2">
              View Name
            </label>
            <input type="text" id="viewName" ref={inputRef} value={viewName} onChange={e => {
            setViewName(e.target.value);
            if (error) setError('');
          }} placeholder="e.g., High Growth Companies" className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} focus:border-emerald-500 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors duration-200 focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} focus:outline-none`} required aria-describedby={error ? 'name-error' : undefined} disabled={isSubmitting} />
            {error && <div id="name-error" className="mt-2 flex items-start text-sm text-red-500">
                <AlertCircleIcon size={16} className="mr-1.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>}
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-5 rounded-lg transition-colors duration-200" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 flex items-center" disabled={isSubmitting}>
              {isSubmitting ? <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Saving...
                </> : <>
                  <SaveIcon size={16} className="mr-2" />
                  Save View
                </>}
            </button>
          </div>
        </form>
      </div>
    </div>;
};