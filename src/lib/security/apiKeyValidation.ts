import { logSecurityEvent } from './logger';
import { secureSet, secureGet, generateSecureApiKey } from './secureStorage';

/**
 * API key validation and management
 */
// API key strength levels
export enum ApiKeyStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
}

// Validate API key format
export function validateApiKeyFormat(apiKey: string): boolean {
  // Basic format validation (alphanumeric, minimum length)
  return /^[a-zA-Z0-9_-]{12,}$/.test(apiKey);
}

// Check API key strength
export function checkApiKeyStrength(apiKey: string): ApiKeyStrength {
  if (!apiKey) return ApiKeyStrength.WEAK;
  let score = 0;
  // Length check
  if (apiKey.length >= 24) score += 3;else if (apiKey.length >= 16) score += 2;else if (apiKey.length >= 12) score += 1;
  // Character variety
  if (/[A-Z]/.test(apiKey)) score += 1;
  if (/[a-z]/.test(apiKey)) score += 1;
  if (/[0-9]/.test(apiKey)) score += 1;
  if (/[^A-Za-z0-9]/.test(apiKey)) score += 1;
  // Determine strength based on score
  if (score >= 5) return ApiKeyStrength.STRONG;
  if (score >= 3) return ApiKeyStrength.MEDIUM;
  return ApiKeyStrength.WEAK;
}

// Save API key securely
export async function saveApiKey(apiKey: string): Promise<boolean> {
  try {
    // Validate format
    if (!validateApiKeyFormat(apiKey)) {
      logSecurityEvent({
        type: 'API_KEY',
        level: 'WARNING',
        message: 'Invalid API key format rejected',
        data: {
          keyLength: apiKey.length
        }
      });
      return false;
    }
    // Check strength
    const strength = checkApiKeyStrength(apiKey);
    try {
      // Try to store with encryption first
      await secureSet('cf_api_key', apiKey);
    } catch (error) {
      // Fall back to regular sessionStorage if encryption fails
      sessionStorage.setItem('cf_api_key', apiKey);
    }
    // Log the event
    logSecurityEvent({
      type: 'API_KEY',
      level: 'INFO',
      message: 'API key saved',
      data: {
        strength,
        // Only log the first few characters for security
        partialKey: apiKey.substring(0, 4) + '...'
      }
    });
    return true;
  } catch (error) {
    logSecurityEvent({
      type: 'API_KEY',
      level: 'ERROR',
      message: 'Failed to save API key',
      data: {
        error: (error as Error).message
      }
    });
    return false;
  }
}

// Get API key securely
export async function getApiKey(): Promise<string | null> {
  try {
    // Try to get from secure storage first
    const secureApiKey = await secureGet('cf_api_key');
    if (secureApiKey) {
      return secureApiKey;
    }
    // Fall back to regular sessionStorage
    return sessionStorage.getItem('cf_api_key');
  } catch (error) {
    logSecurityEvent({
      type: 'API_KEY',
      level: 'ERROR',
      message: 'Failed to retrieve API key',
      data: {
        error: (error as Error).message
      }
    });
    // Last resort fallback
    return sessionStorage.getItem('cf_api_key');
  }
}

// Clear API key
export function clearApiKey(): void {
  try {
    // Clear from both secure storage and regular storage
    sessionStorage.removeItem('cf_api_key');
    secureRemove('cf_api_key');
    logSecurityEvent({
      type: 'API_KEY',
      level: 'INFO',
      message: 'API key cleared'
    });
  } catch (error) {
    logSecurityEvent({
      type: 'API_KEY',
      level: 'ERROR',
      message: 'Failed to clear API key',
      data: {
        error: (error as Error).message
      }
    });
  }
}

// Helper function to remove securely stored item
function secureRemove(key: string): void {
  sessionStorage.removeItem(`secure_${key}`);
}

// Generate a new secure API key
export function createNewApiKey(length: number = 32): string {
  return generateSecureApiKey(length);
}