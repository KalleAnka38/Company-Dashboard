import { logSecurityEvent } from './logger';
/**
 * File validation and security utilities
 */
// Allowed file types
export const ALLOWED_FILE_TYPES = ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
// Maximum file size in bytes (10 MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
// File validation result
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
  };
}
// Validate a file for upload
export async function validateFile(file: File): Promise<FileValidationResult> {
  // Check if file exists
  if (!file) {
    logSecurityEvent({
      type: 'FILE',
      level: 'WARNING',
      message: 'File validation failed: No file provided'
    });
    return {
      valid: false,
      error: 'No file provided'
    };
  }
  // Log file info
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type
  };
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    logSecurityEvent({
      type: 'FILE',
      level: 'WARNING',
      message: 'File validation failed: Invalid file type',
      data: fileInfo
    });
    return {
      valid: false,
      error: 'Invalid file type. Only CSV, Excel, and JSON files are allowed.',
      fileInfo
    };
  }
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    logSecurityEvent({
      type: 'FILE',
      level: 'WARNING',
      message: 'File validation failed: File too large',
      data: fileInfo
    });
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB)`,
      fileInfo
    };
  }
  // Check file content (basic check)
  try {
    // For CSV and JSON files, read the first few bytes to verify format
    const firstChunk = await readFirstChunkOfFile(file);
    if (file.type === 'text/csv' && !isValidCSVContent(firstChunk)) {
      logSecurityEvent({
        type: 'FILE',
        level: 'WARNING',
        message: 'File validation failed: Invalid CSV content',
        data: fileInfo
      });
      return {
        valid: false,
        error: 'Invalid CSV file content',
        fileInfo
      };
    }
    if (file.type === 'application/json' && !isValidJSONContent(firstChunk)) {
      logSecurityEvent({
        type: 'FILE',
        level: 'WARNING',
        message: 'File validation failed: Invalid JSON content',
        data: fileInfo
      });
      return {
        valid: false,
        error: 'Invalid JSON file content',
        fileInfo
      };
    }
    // Mock virus scan (would be a real scan in production)
    const virusScanResult = await mockVirusScan(file);
    if (!virusScanResult.clean) {
      logSecurityEvent({
        type: 'FILE',
        level: 'ERROR',
        message: 'File validation failed: Potential security threat detected',
        data: {
          ...fileInfo,
          threatInfo: virusScanResult.threatInfo
        }
      });
      return {
        valid: false,
        error: 'Security scan failed. The file may contain malicious content.',
        fileInfo
      };
    }
    // All checks passed
    logSecurityEvent({
      type: 'FILE',
      level: 'INFO',
      message: 'File validation passed',
      data: fileInfo
    });
    return {
      valid: true,
      fileInfo
    };
  } catch (error) {
    logSecurityEvent({
      type: 'FILE',
      level: 'ERROR',
      message: 'File validation error',
      data: {
        ...fileInfo,
        error: (error as Error).message
      }
    });
    return {
      valid: false,
      error: 'Error validating file',
      fileInfo
    };
  }
}
// Read the first chunk of a file
async function readFirstChunkOfFile(file: File, chunkSize = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('Failed to read file'));
    };
    // Read only the first chunk of the file
    const blob = file.slice(0, chunkSize);
    reader.readAsText(blob);
  });
}
// Validate CSV content (basic check)
function isValidCSVContent(content: string): boolean {
  // Check if content contains comma-separated values
  // This is a very basic check and would be more robust in production
  return content.includes(',') && content.includes('\n');
}
// Validate JSON content (basic check)
function isValidJSONContent(content: string): boolean {
  try {
    // Try to parse the first part of the content as JSON
    // This won't work for all JSON files but catches obvious issues
    const trimmed = content.trim();
    return trimmed.startsWith('{') || trimmed.startsWith('[');
  } catch {
    return false;
  }
}
// Mock virus scan (would be replaced with a real scan in production)
async function mockVirusScan(file: File): Promise<{
  clean: boolean;
  threatInfo?: string;
}> {
  // Simulate an async operation
  await new Promise(resolve => setTimeout(resolve, 300));
  // Check for suspicious patterns in filename (example)
  const suspiciousPatterns = ['.exe', '.dll', '.js.', 'script', 'virus', 'malware'];
  const hasSuspiciousName = suspiciousPatterns.some(pattern => file.name.toLowerCase().includes(pattern));
  if (hasSuspiciousName) {
    return {
      clean: false,
      threatInfo: 'Suspicious filename detected'
    };
  }
  // In a real implementation, this would call an antivirus API
  return {
    clean: true
  };
}