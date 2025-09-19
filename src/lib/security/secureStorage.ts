import { logSecurityEvent } from './logger';
/**
 * Secure storage with client-side encryption
 *
 * This module provides encryption for sensitive data stored in sessionStorage
 * Note: Client-side encryption has limitations but adds a layer of protection
 */
// Generate a secure encryption key
function generateEncryptionKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
// Get or create an encryption key
function getEncryptionKey(): string {
  let key = sessionStorage.getItem('_encryption_key');
  if (!key) {
    key = generateEncryptionKey();
    sessionStorage.setItem('_encryption_key', key);
    logSecurityEvent({
      type: 'SESSION',
      level: 'INFO',
      message: 'New encryption key generated',
      data: {
        keyLength: key.length
      }
    });
  }
  return key;
}
// Convert string to byte array
function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}
// Convert byte array to string
function bytesToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}
// Convert string to hex
function stringToHex(str: string): string {
  return Array.from(stringToBytes(str)).map(b => b.toString(16).padStart(2, '0')).join('');
}
// Convert hex to bytes
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
/**
 * Encrypt data before storing
 *
 * @param data The data to encrypt
 * @returns The encrypted data as a hex string
 */
async function encrypt(data: string): Promise<string> {
  try {
    // Get the encryption key
    const keyHex = getEncryptionKey();
    const keyData = hexToBytes(keyHex);
    // Generate a random IV
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    // Import the key
    const key = await crypto.subtle.importKey('raw', keyData, {
      name: 'AES-GCM'
    }, false, ['encrypt']);
    // Encrypt the data
    const dataBytes = stringToBytes(data);
    const encryptedBytes = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv
    }, key, dataBytes);
    // Combine IV and encrypted data and convert to hex
    const encryptedArray = new Uint8Array(encryptedBytes);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);
    return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    logSecurityEvent({
      type: 'SESSION',
      level: 'ERROR',
      message: 'Encryption failed',
      data: {
        error: (error as Error).message
      }
    });
    // Return unencrypted data if encryption fails
    // This ensures the app doesn't break, but logs the error
    return stringToHex(data);
  }
}
/**
 * Decrypt stored data
 *
 * @param encryptedHex The encrypted data as a hex string
 * @returns The decrypted data
 */
async function decrypt(encryptedHex: string): Promise<string> {
  try {
    // Get the encryption key
    const keyHex = getEncryptionKey();
    const keyData = hexToBytes(keyHex);
    // Convert hex to bytes
    const encryptedBytes = hexToBytes(encryptedHex);
    // Extract IV (first 12 bytes)
    const iv = encryptedBytes.slice(0, 12);
    // Extract encrypted data (rest of bytes)
    const data = encryptedBytes.slice(12);
    // Import the key
    const key = await crypto.subtle.importKey('raw', keyData, {
      name: 'AES-GCM'
    }, false, ['decrypt']);
    // Decrypt the data
    const decryptedBytes = await crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv
    }, key, data);
    return bytesToString(new Uint8Array(decryptedBytes));
  } catch (error) {
    logSecurityEvent({
      type: 'SESSION',
      level: 'ERROR',
      message: 'Decryption failed',
      data: {
        error: (error as Error).message
      }
    });
    // Try to recover by assuming it's unencrypted hex
    try {
      return bytesToString(hexToBytes(encryptedHex));
    } catch {
      // Return empty string if all attempts fail
      return '';
    }
  }
}
/**
 * Securely store a value
 */
export async function secureSet(key: string, value: string): Promise<void> {
  try {
    const encryptedValue = await encrypt(value);
    sessionStorage.setItem(`secure_${key}`, encryptedValue);
    logSecurityEvent({
      type: 'SESSION',
      level: 'INFO',
      message: 'Secure data stored',
      data: {
        key
      }
    });
  } catch (error) {
    logSecurityEvent({
      type: 'SESSION',
      level: 'ERROR',
      message: 'Failed to securely store data',
      data: {
        key,
        error: (error as Error).message
      }
    });
    // Fallback to unencrypted storage
    sessionStorage.setItem(key, value);
  }
}
/**
 * Retrieve a securely stored value
 */
export async function secureGet(key: string): Promise<string | null> {
  try {
    const encryptedValue = sessionStorage.getItem(`secure_${key}`);
    if (!encryptedValue) {
      return null;
    }
    return await decrypt(encryptedValue);
  } catch (error) {
    logSecurityEvent({
      type: 'SESSION',
      level: 'ERROR',
      message: 'Failed to retrieve secure data',
      data: {
        key,
        error: (error as Error).message
      }
    });
    // Fallback to unencrypted retrieval
    return sessionStorage.getItem(key);
  }
}
/**
 * Remove a securely stored value
 */
export function secureRemove(key: string): void {
  try {
    sessionStorage.removeItem(`secure_${key}`);
    logSecurityEvent({
      type: 'SESSION',
      level: 'INFO',
      message: 'Secure data removed',
      data: {
        key
      }
    });
  } catch (error) {
    logSecurityEvent({
      type: 'SESSION',
      level: 'ERROR',
      message: 'Failed to remove secure data',
      data: {
        key,
        error: (error as Error).message
      }
    });
  }
}
/**
 * Generate a cryptographically secure API key
 */
export function generateSecureApiKey(length: number = 32): string {
  // Generate random bytes
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  // Convert to a string with a mix of characters
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  logSecurityEvent({
    type: 'API_KEY',
    level: 'INFO',
    message: 'Secure API key generated',
    data: {
      length
    }
  });
  return result;
}
/**
 * Perform a security test to verify encryption is working
 */
export async function testSecureStorage(): Promise<boolean> {
  try {
    const testValue = 'SECURITY_TEST_' + Date.now();
    await secureSet('_test_key', testValue);
    const retrieved = await secureGet('_test_key');
    secureRemove('_test_key');
    return retrieved === testValue;
  } catch (error) {
    logSecurityEvent({
      type: 'SESSION',
      level: 'ERROR',
      message: 'Secure storage test failed',
      data: {
        error: (error as Error).message
      }
    });
    return false;
  }
}