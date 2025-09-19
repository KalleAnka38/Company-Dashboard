import React, { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { useAuth } from './AuthContext';
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    user
  } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  // Close modal if user is logged in
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="w-full max-w-md">
        <div className="relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 p-1 rounded-full hover:bg-gray-800 transition-colors" aria-label="Close dialog">
            <XIcon size={20} />
          </button>
          <LoginForm onSuccess={onClose} />
        </div>
      </div>
    </div>;
};