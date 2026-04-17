/**
 * OAuth2/OIDC configuration for ISPNest.
 * Uses Authorization Code flow with PKCE for secure SPA authentication.
 */
export const oauth2Config = {
  // Authorization server endpoints
  authorizationEndpoint: '/oauth2/authorize',
  tokenEndpoint: '/oauth2/token',
  userInfoEndpoint: '/api/auth/me',
  logoutEndpoint: '/logout',

  // Client configuration (must match oauth2_registered_client in database)
  clientId: 'ispnest-admin-spa',

  // Redirect URIs
  redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/callback`,
  postLogoutRedirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/login`,

  // Scopes
  scope: 'openid profile email',

  // Storage keys
  storageKeys: {
    accessToken: 'ispnest_access_token',
    refreshToken: 'ispnest_refresh_token',
    tokenExpiry: 'ispnest_token_expiry',
    codeVerifier: 'ispnest_code_verifier',
    state: 'ispnest_oauth_state',
    returnUrl: 'ispnest_return_url',
  },
} as const;

/**
 * Generate a cryptographically secure random string for PKCE code verifier.
 * RFC 7636 recommends 43-128 characters.
 */
export function generateCodeVerifier(length = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (v) => charset[v % charset.length]).join('');
}

/**
 * Generate a cryptographically secure random state parameter.
 */
export function generateState(): string {
  return generateCodeVerifier(32);
}

/**
 * Create SHA-256 hash of the code verifier for PKCE code challenge.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

/**
 * Base64 URL encode (RFC 4648 §5) - no padding, URL-safe characters.
 */
export function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Parse JWT token payload without verifying signature.
 * Only use for reading claims - validation happens server-side.
 */
export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired (with 30 second buffer).
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || typeof payload['exp'] !== 'number') return true;
  const expiryTime = payload['exp'] * 1000; // Convert to milliseconds
  return Date.now() > expiryTime - 30000; // 30 second buffer
}
