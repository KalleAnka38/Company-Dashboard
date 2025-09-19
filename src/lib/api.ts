import { Company, FilterParams, SavedView } from '@/types';
import { addCSRFHeader } from '@/lib/security/csrf';
import { logSecurityEvent } from '@/lib/security/logger';

// Get API headers with authentication if available
export function getClientHeaders() {
  // Get API key from session storage
  const key = typeof window !== 'undefined' ? sessionStorage.getItem('cf_api_key') : null;
  // Get base headers
  const headers = key ? {
    'x-api-key': key
  } : {};
  // Add CSRF token header
  return addCSRFHeader(headers);
}

// Fetch companies with filters
export const fetchCompanies = async (params: FilterParams): Promise<Company[]> => {
  try {
    // Validate input parameters before sending to API
    if (params.sectors && !Array.isArray(params.sectors)) {
      throw new Error('Invalid sectors parameter');
    }
    // Build query string
    const queryParams = new URLSearchParams();
    // Add sectors as comma-separated list
    if (params.sectors && params.sectors.length > 0) {
      // Sanitize sectors before adding to query
      const sanitizedSectors = params.sectors.map(s => s.replace(/[<>'"&]/g, ''));
      queryParams.set('sectors', sanitizedSectors.join(','));
    }
    // Add numeric values with validation
    const numericParams = ['employees_min', 'employees_max', 'growth_min', 'min_score', 'limit', 'offset', 'w_growth', 'w_stale', 'w_clarity', 'w_churn', 'w_funding', 'w_midsize'];
    numericParams.forEach(param => {
      // @ts-ignore - We know these are valid keys
      const value = params[param];
      if (value !== undefined) {
        // Validate numeric parameters
        if (isNaN(Number(value))) {
          throw new Error(`Invalid ${param} parameter: must be a number`);
        }
        // @ts-ignore - We know these are valid keys
        queryParams.set(param, value.toString());
      }
    });
    // Add boolean values with validation
    const booleanParams = ['only_stale', 'only_funding', 'low_clarity', 'churn_risk'];
    booleanParams.forEach(param => {
      // @ts-ignore - We know these are valid keys
      const value = params[param];
      if (value !== undefined) {
        // Validate boolean parameters
        if (typeof value !== 'boolean') {
          throw new Error(`Invalid ${param} parameter: must be a boolean`);
        }
        // @ts-ignore - We know these are valid keys
        queryParams.set(param, value.toString());
      }
    });
    // Add sort with validation
    if (params.sort_by) {
      // Validate sort_by against allowed values
      const allowedSortFields = ['score', 'growth_rate', 'employees', 'clarity_score', 'name', 'sector'];
      if (!allowedSortFields.includes(params.sort_by)) {
        throw new Error('Invalid sort_by parameter');
      }
      queryParams.set('sort_by', params.sort_by);
    }
    // Log the fetch attempt
    logSecurityEvent({
      type: 'ACCESS',
      level: 'INFO',
      message: 'Fetching companies data',
      data: {
        params: {
          ...params,
          // Only include the first 2 sectors in logs to avoid overly large logs
          sectors: params.sectors?.slice(0, 2).concat(params.sectors && params.sectors.length > 2 ? ['...'] : [])
        }
      }
    });
    // Make the API request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    try {
      const response = await fetch(`/api/companies?${queryParams.toString()}`, {
        signal: controller.signal,
        headers: {
          // Add security headers
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          ...getClientHeaders()
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        // Log the error
        logSecurityEvent({
          type: 'ACCESS',
          level: 'WARNING',
          message: 'API error when fetching companies',
          data: {
            status: response.status,
            statusText: response.statusText
          }
        });
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      // Log success (with limited data)
      logSecurityEvent({
        type: 'ACCESS',
        level: 'INFO',
        message: 'Successfully fetched companies data',
        data: {
          count: data.length
        }
      });
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        logSecurityEvent({
          type: 'ACCESS',
          level: 'WARNING',
          message: 'Request timeout when fetching companies',
          data: {
            timeout: '10s'
          }
        });
        throw new Error('Request timed out');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

// Export to CSV
export const exportToCsv = (params: FilterParams): void => {
  try {
    // Validate input parameters before sending to API
    if (params.sectors && !Array.isArray(params.sectors)) {
      throw new Error('Invalid sectors parameter');
    }
    // Build query string with the same validation as fetchCompanies
    const queryParams = new URLSearchParams();
    // Add sectors as comma-separated list
    if (params.sectors && params.sectors.length > 0) {
      const sanitizedSectors = params.sectors.map(s => s.replace(/[<>'"&]/g, ''));
      queryParams.set('sectors', sanitizedSectors.join(','));
    }
    // Add numeric values with validation
    const numericParams = ['employees_min', 'employees_max', 'growth_min', 'min_score', 'limit', 'offset', 'w_growth', 'w_stale', 'w_clarity', 'w_churn', 'w_funding', 'w_midsize'];
    numericParams.forEach(param => {
      // @ts-ignore - We know these are valid keys
      const value = params[param];
      if (value !== undefined) {
        if (isNaN(Number(value))) {
          throw new Error(`Invalid ${param} parameter: must be a number`);
        }
        // @ts-ignore - We know these are valid keys
        queryParams.set(param, value.toString());
      }
    });
    // Add boolean values with validation
    const booleanParams = ['only_stale', 'only_funding', 'low_clarity', 'churn_risk'];
    booleanParams.forEach(param => {
      // @ts-ignore - We know these are valid keys
      const value = params[param];
      if (value !== undefined) {
        if (typeof value !== 'boolean') {
          throw new Error(`Invalid ${param} parameter: must be a boolean`);
        }
        // @ts-ignore - We know these are valid keys
        queryParams.set(param, value.toString());
      }
    });
    // Add sort with validation
    if (params.sort_by) {
      const allowedSortFields = ['score', 'growth_rate', 'employees', 'clarity_score', 'name', 'sector'];
      if (!allowedSortFields.includes(params.sort_by)) {
        throw new Error('Invalid sort_by parameter');
      }
      queryParams.set('sort_by', params.sort_by);
    }
    // Add CSRF token
    const headers = getClientHeaders();
    const csrfParam = headers['X-CSRF-Token'];
    if (csrfParam) {
      queryParams.set('csrf', csrfParam);
    }
    // Log the export attempt
    logSecurityEvent({
      type: 'ACCESS',
      level: 'INFO',
      message: 'Exporting CSV data',
      data: {
        params: {
          ...params,
          sectors: params.sectors?.slice(0, 2).concat(params.sectors && params.sectors.length > 2 ? ['...'] : [])
        }
      }
    });
    // Open a new window to download the CSV
    window.open(`/api/export.csv?${queryParams.toString()}`, '_blank');
  } catch (error) {
    logSecurityEvent({
      type: 'ACCESS',
      level: 'ERROR',
      message: 'Error exporting CSV',
      data: {
        error: (error as Error).message
      }
    });
    console.error('Error exporting CSV:', error);
    throw error;
  }
};

// Bulk upload
export const bulkUpload = async (file: File, upsert: boolean = true, apiKey: string): Promise<{
  created: number;
  updated: number;
  total: number;
}> => {
  // Validate file size before upload (limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }
  // Validate file type
  if (!['text/csv', 'application/json'].includes(file.type)) {
    throw new Error('Invalid file type. Only CSV and JSON are supported.');
  }
  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  // Generate a random request ID for tracking
  const requestId = Math.random().toString(36).substring(2, 15);
  // Make the API request with a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for uploads
  try {
    // Get CSRF token and other headers
    const headers = getClientHeaders();
    const response = await fetch(`/api/bulk?upsert=${upsert}`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-request-id': requestId,
        ...headers
        // Don't set Content-Type for FormData
      },
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Log the error
      logSecurityEvent({
        type: 'FILE',
        level: 'ERROR',
        message: 'Bulk upload failed',
        data: {
          status: response.status,
          error: errorData.error || 'Unknown error',
          fileName: file.name
        }
      });
      throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    const data = await response.json();
    // Log success
    logSecurityEvent({
      type: 'FILE',
      level: 'INFO',
      message: 'Bulk upload successful',
      data: {
        created: data.created,
        updated: data.updated,
        total: data.total,
        fileName: file.name
      }
    });
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      logSecurityEvent({
        type: 'FILE',
        level: 'WARNING',
        message: 'Bulk upload timed out',
        data: {
          timeout: '30s',
          fileName: file.name
        }
      });
      throw new Error('Request timed out');
    }
    throw error;
  }
};

// Fetch saved views
export const fetchSavedViews = async (): Promise<SavedView[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    try {
      const response = await fetch('/api/views', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-store',
          ...getClientHeaders()
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        logSecurityEvent({
          type: 'ACCESS',
          level: 'WARNING',
          message: 'Error fetching saved views',
          data: {
            status: response.status
          }
        });
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching saved views:', error);
    throw error;
  }
};

// Create a new saved view
export const createSavedView = async (name: string, querystring: string, apiKey: string): Promise<SavedView> => {
  try {
    // Validate inputs
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid view name');
    }
    if (!querystring || typeof querystring !== 'string') {
      throw new Error('Invalid querystring');
    }
    // Sanitize name to prevent injection
    const sanitizedName = name.replace(/[<>'"&]/g, '');
    if (sanitizedName.length < 1 || sanitizedName.length > 100) {
      throw new Error('View name must be between 1 and 100 characters');
    }
    // Validate querystring format
    try {
      new URLSearchParams(querystring);
    } catch (e) {
      throw new Error('Invalid querystring format');
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    try {
      // Get CSRF token and other headers
      const headers = getClientHeaders();
      const response = await fetch('/api/views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          ...headers
        },
        body: JSON.stringify({
          name: sanitizedName,
          querystring
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logSecurityEvent({
          type: 'ACCESS',
          level: 'WARNING',
          message: 'Error creating saved view',
          data: {
            status: response.status,
            error: errorData.error || 'Unknown error',
            viewName: sanitizedName
          }
        });
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      const data = await response.json();
      logSecurityEvent({
        type: 'ACCESS',
        level: 'INFO',
        message: 'Saved view created successfully',
        data: {
          viewId: data.id,
          viewName: data.name
        }
      });
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating saved view:', error);
    throw error;
  }
};

// Delete a saved view
export const deleteSavedView = async (id: number, apiKey: string): Promise<void> => {
  try {
    // Validate id
    if (isNaN(id) || id <= 0) {
      throw new Error('Invalid view ID');
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    try {
      // Get CSRF token and other headers
      const headers = getClientHeaders();
      const response = await fetch(`/api/views/${id}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': apiKey,
          ...headers
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logSecurityEvent({
          type: 'ACCESS',
          level: 'WARNING',
          message: 'Error deleting saved view',
          data: {
            viewId: id,
            status: response.status,
            error: errorData.error || 'Unknown error'
          }
        });
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      logSecurityEvent({
        type: 'ACCESS',
        level: 'INFO',
        message: 'Saved view deleted successfully',
        data: {
          viewId: id
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting saved view:', error);
    throw error;
  }
};