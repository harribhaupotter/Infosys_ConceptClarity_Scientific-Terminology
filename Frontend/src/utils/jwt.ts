/**
 * JWT Utility Functions
 */

export interface JWTPayload {
  email: string;
  name: string;
  role: string;
  exp?: number;
  iat?: number;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This does not verify the signature, only decodes the payload
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Check if the current user is an admin
 */
export const isAdmin = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  const payload = decodeJWT(token);
  return payload?.role === 'admin';
};

/**
 * Get the current user's role
 */
export const getUserRole = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  const payload = decodeJWT(token);
  return payload?.role || null;
};
