import type { APIRoute } from 'astro';
import { AuthManager, createAuthManager } from '../../../lib/auth';

/** Compares two strings in time independent of how far they match. */
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  // Length still leaks, so fold it into the result rather than early-returning.
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}

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

    // Credentials come from the environment, never from source. This file
    // previously carried a hardcoded map of plaintext logins (including an
    // admin account on the owner's real address), which shipped to anyone
    // who could read the repo or the deployed bundle.
    //
    // Set ADMIN_EMAIL, ADMIN_PASSWORD and JWT_SECRET as Cloudflare secrets.
    // Until a real user table exists in D1, this is the only account.
    const jwtSecret = process.env.JWT_SECRET;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Fail closed: without configuration there is no way in, rather than a
    // fallback secret that is identical on every deployment.
    if (!jwtSecret || jwtSecret.length < 32 || !adminEmail || !adminPassword) {
      console.error('Auth is not configured: JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD must be set.');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication is not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const authManager = createAuthManager(jwtSecret);

    const emailMatches = email.toLowerCase() === adminEmail.toLowerCase();
    const passwordMatches = timingSafeEqual(password, adminPassword);
    const user = emailMatches && passwordMatches
      ? { id: 'user_admin_1', email: adminEmail, role: 'admin' as const }
      : null;

    if (!user) {
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
