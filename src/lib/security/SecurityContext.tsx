import React, { useEffect, useState, createContext, useContext } from 'react';
import { generateCSRFToken, validateCSRFToken } from './csrf';
import { logSecurityEvent } from './logger';
interface SecurityContextType {
  csrfToken: string;
  refreshCSRFToken: () => void;
  validateToken: (token: string) => boolean;
  lastActivity: number;
  updateActivity: () => void;
  securityLevel: 'low' | 'medium' | 'high';
  setSecurityLevel: (level: 'low' | 'medium' | 'high') => void;
}
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);
export function SecurityProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [csrfToken, setCsrfToken] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  // Generate initial CSRF token
  useEffect(() => {
    refreshCSRFToken();
    // Set up activity tracking
    const handleActivity = () => updateActivity();
    // Track user activity for session management
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    // Check for inactivity every minute
    const inactivityCheck = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      // Log extended inactivity (10 minutes)
      if (inactiveTime > 10 * 60 * 1000) {
        logSecurityEvent({
          type: 'INACTIVITY',
          level: 'INFO',
          message: 'User inactive for 10+ minutes',
          data: {
            inactiveMs: inactiveTime
          }
        });
      }
      // Auto-logout after 30 minutes of inactivity (high security only)
      if (securityLevel === 'high' && inactiveTime > 30 * 60 * 1000) {
        logSecurityEvent({
          type: 'SESSION',
          level: 'INFO',
          message: 'Auto-logout due to inactivity',
          data: {
            inactiveMs: inactiveTime
          }
        });
        // Clear session data
        sessionStorage.removeItem('cf_api_key');
        // Refresh CSRF token
        refreshCSRFToken();
      }
    }, 60000);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(inactivityCheck);
    };
  }, [lastActivity, securityLevel]);
  // Refresh CSRF token
  const refreshCSRFToken = () => {
    const newToken = generateCSRFToken();
    setCsrfToken(newToken);
    logSecurityEvent({
      type: 'CSRF',
      level: 'INFO',
      message: 'CSRF token refreshed',
      data: {
        tokenGenerated: true
      }
    });
  };
  // Validate a provided token against current token
  const validateToken = (token: string): boolean => {
    const isValid = validateCSRFToken(token, csrfToken);
    if (!isValid) {
      logSecurityEvent({
        type: 'CSRF',
        level: 'WARNING',
        message: 'Invalid CSRF token detected',
        data: {
          providedToken: token ? token.substring(0, 8) + '...' : 'none'
        }
      });
    }
    return isValid;
  };
  // Update last activity timestamp
  const updateActivity = () => {
    setLastActivity(Date.now());
  };
  const value = {
    csrfToken,
    refreshCSRFToken,
    validateToken,
    lastActivity,
    updateActivity,
    securityLevel,
    setSecurityLevel
  };
  return <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>;
}
// Hook for using the security context
export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}