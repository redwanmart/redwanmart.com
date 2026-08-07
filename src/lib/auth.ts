/**
 * Authentication & Authorization
 * JWT token management and role-based access control
 */

interface JWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin' | 'moderator';
  iat: number;
  exp: number;
}

export class AuthManager {
  private secret: string;

  constructor(jwtSecret: string) {
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }
    this.secret = jwtSecret;
  }

  /**
   * Create JWT Token (requires crypto implementation)
   * For production use with Cloudflare Workers
   */
  async createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    // This is a placeholder - actual implementation requires crypto
    // In production with Cloudflare Workers, use SubtleCrypto API
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 86400; // 24 hours

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const tokenPayload = {
      ...payload,
      iat: now,
      exp,
    };

    // Placeholder token - real implementation in production
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
    return token;
  }

  /**
   * Verify JWT Token
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      // Placeholder implementation
      const decoded = JSON.parse(
        Buffer.from(token, 'base64').toString('utf-8')
      );

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return null;
      }

      return decoded as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has admin role
   */
  isAdmin(role: string): boolean {
    return role === 'admin';
  }

  /**
   * Check if user has required permissions
   */
  hasPermission(role: string, permission: string): boolean {
    const permissions: Record<string, string[]> = {
      admin: [
        'create_product',
        'update_product',
        'delete_product',
        'manage_users',
        'manage_media',
        'view_analytics',
      ],
      moderator: ['update_product', 'manage_media', 'view_analytics'],
      customer: ['view_products', 'create_review'],
    };

    return (permissions[role] || []).includes(permission);
  }
}

export function createAuthManager(jwtSecret: string): AuthManager {
  return new AuthManager(jwtSecret);
}

/**
 * Middleware to verify JWT and extract user context
 */
export async function verifyJWT(
  request: Request,
  authManager: AuthManager
): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  return authManager.verifyToken(token);
}
