import type { APIRoute } from 'astro';
import { AuthManager, createAuthManager } from '../../../lib/auth';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Body: { email: string, password: string }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: email, password'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize auth manager
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-min-32-chars-required';
    const authManager = createAuthManager(jwtSecret);

    // Mock user authentication
    // In production, query D1 database to verify email and password hash
    const mockUsers: Record<string, any> = {
      'admin@redwanmart.com': {
        id: 'user_admin_1',
        email: 'admin@redwanmart.com',
        role: 'admin',
        password: 'admin123', // In production: use bcrypt verification
      },
      'customer1@example.com': {
        id: 'user_cust_1',
        email: 'customer1@example.com',
        role: 'customer',
        password: 'password123',
      },
      'redwanmartbd@gmail.com': {
        id: 'user_owner_1',
        email: 'redwanmartbd@gmail.com',
        role: 'admin',
        password: 'owner123',
      },
    };

    const user = mockUsers[email];

    if (!user || user.password !== password) {
      // Use generic error message for security (don't reveal if email exists)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email or password' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create JWT token
    const token = await authManager.createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set secure HTTP-only cookie (in production)
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `token=${token}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Strict`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
