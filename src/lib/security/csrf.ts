/**
 * CSRF protection utilities
 */
// Generate a CSRF token
export function generateCSRFToken(): string {
  // Generate a random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  // Store the token in sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
}
// Validate a CSRF token
export function validateCSRFToken(token: string, expectedToken?: string): boolean {
  if (!token) return false;
  // If an expected token is provided, use it; otherwise check sessionStorage
  const validToken = expectedToken || (typeof window !== 'undefined' ? sessionStorage.getItem('csrf_token') : null);
  if (!validToken) return false;
  // Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(token, validToken);
}
// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
// Add CSRF token to request headers
export function addCSRFHeader(headers: Record<string, string> = {}): Record<string, string> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('csrf_token') : null;
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token
    };
  }
  return headers;
}
// Create a hidden CSRF input for forms
export function CSRFInput({
  className = ''
}: {
  className?: string;
}) {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('csrf_token') : '';
  return <input type="hidden" name="csrf_token" value={token || ''} className={className} />;
}
// Verify CSRF token in a request
export function verifyCSRFToken(request: Request): boolean {
  // Get token from header
  const headerToken = request.headers.get('X-CSRF-Token');
  // Get token from body if it's a form submission
  const formToken = getFormToken(request);
  // Get token from URL for GET requests
  const urlToken = getUrlToken(request);
  // Get the expected token
  const expectedToken = sessionStorage.getItem('csrf_token');
  if (!expectedToken) {
    return false;
  }
  // Check if any of the tokens match
  return headerToken && validateCSRFToken(headerToken, expectedToken) || formToken && validateCSRFToken(formToken, expectedToken) || urlToken && validateCSRFToken(urlToken, expectedToken);
}
// Extract CSRF token from form data
async function getFormToken(request: Request): Promise<string | null> {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.clone().formData();
      return formData.get('csrf_token') as string;
    }
    if (contentType.includes('application/json')) {
      const json = await request.clone().json();
      return json.csrf_token;
    }
    return null;
  } catch (error) {
    return null;
  }
}
// Extract CSRF token from URL
function getUrlToken(request: Request): string | null {
  try {
    const url = new URL(request.url);
    return url.searchParams.get('csrf');
  } catch (error) {
    return null;
  }
}