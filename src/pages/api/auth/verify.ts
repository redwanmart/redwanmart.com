import type { APIRoute } from 'astro';
import { AuthManager, verifyJWT, createAuthManager } from '../../../lib/auth';

/**
 * POST /api/auth/verify
 * Verify JWT token and return user information
 * Header: Authorization: Bearer <token>
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-min-32-chars-required';
    const authManager = createAuthManager(jwtSecret);

    const user = await verifyJWT(request, authManager);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized. Invalid or missing token.'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token is valid',
        user: {
          userId: user.userId,
          email: user.email,
          role: user.role,
        },
        expiresIn: user.exp - Math.floor(Date.now() / 1000),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Token verification failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

/**
 * GET /api/auth/verify
 * Quick token validation (GET method)
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-min-32-chars-required';
    const authManager = createAuthManager(jwtSecret);

    const user = await verifyJWT(request, authManager);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          valid: false,
          error: 'Unauthorized'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        valid: true,
        user: {
          userId: user.userId,
          email: user.email,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        valid: false,
        error: 'Verification failed'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
