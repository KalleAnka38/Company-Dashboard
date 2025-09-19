/**
 * Security event logging
 */
export type SecurityEventType = 'AUTH' | 'API_KEY' | 'CSRF' | 'ACCESS' | 'INPUT' | 'FILE' | 'SESSION' | 'RATE_LIMIT' | 'INACTIVITY';
export type SecurityEventLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export interface SecurityEvent {
  type: SecurityEventType;
  level: SecurityEventLevel;
  message: string;
  data?: Record<string, any>;
  timestamp?: number;
}
// In-memory log storage (would be replaced with server logging in production)
const securityLogs: SecurityEvent[] = [];
// Maximum number of logs to keep in memory
const MAX_LOGS = 100;
/**
 * Log a security event
 */
export function logSecurityEvent(event: SecurityEvent): void {
  // Add timestamp if not provided
  const eventWithTimestamp = {
    ...event,
    timestamp: event.timestamp || Date.now()
  };
  // Add to in-memory logs
  securityLogs.unshift(eventWithTimestamp);
  // Trim logs if they exceed max size
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.pop();
  }
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    const logLevel = event.level.toLowerCase();
    if (event.level === 'CRITICAL' || event.level === 'ERROR') {
      console.error(`🔐 [SECURITY] [${event.type}] [${event.level}]: ${event.message}`, event.data || '');
    } else if (event.level === 'WARNING') {
      console.warn(`🔐 [SECURITY] [${event.type}] [${event.level}]: ${event.message}`, event.data || '');
    } else {
      console.info(`🔐 [SECURITY] [${event.type}] [${event.level}]: ${event.message}`, event.data || '');
    }
  }
  // In production, this would send logs to a server or monitoring service
  // Example: sendToSecurityMonitoring(eventWithTimestamp)
}
/**
 * Get recent security logs
 */
export function getSecurityLogs(): SecurityEvent[] {
  return [...securityLogs];
}
/**
 * Clear security logs
 */
export function clearSecurityLogs(): void {
  securityLogs.length = 0;
}