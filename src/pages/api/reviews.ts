import type { APIRoute } from 'astro';
import { createCloudflareClient } from '../../lib/cloudflare';
import { AuthManager, verifyJWT, requireJwtSecret } from '../../lib/auth';

/**
 * GET /api/reviews?productId=...
 * Fetch reviews for a product
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!productId) {
      return new Response(
        JSON.stringify({ success: false, error: 'productId parameter required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const env = locals.runtime?.env || {};
    let reviews: any[] = [];

    // Fetch reviews from D1 database
    try {
      const client = createCloudflareClient(env);
      const result = await client.queryDB(
        'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [productId, limit, offset]
      );

      reviews = result?.results || [];
    } catch (dbError) {
      console.error('D1 query error:', dbError);
      // Return empty reviews on error
      reviews = [];
    }

    return new Response(
      JSON.stringify({
        success: true,
        productId,
        reviews,
        limit,
        offset,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300',
        },
      }
    );
  } catch (error) {
    console.error('Reviews GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch reviews',
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
 * POST /api/reviews
 * Create new review (Customer only)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verify JWT token
    const jwtSecret = requireJwtSecret();
    const authManager = new AuthManager(jwtSecret);
    const user = await verifyJWT(request, authManager);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized. Please log in.' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = (await request.json()) as Record<string, any>;
    const { productId, rating, title, comment } = data;

    // Validate input
    if (!productId || !rating || !title) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: productId, rating, title'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rating must be between 1 and 5' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reviewId = `rev_${Date.now()}`;
    const review = {
      id: reviewId,
      productId,
      userId: user.userId,
      rating: ratingNum,
      title,
      comment: comment || '',
      verified_purchase: false, // Would check order history in production
      created_at: new Date().toISOString(),
    };

    const env = locals.runtime?.env || {};
    if (env.DB) {
      const client = createCloudflareClient(env);
      await client.executeDB(
        `INSERT INTO reviews (id, product_id, user_id, rating, title, comment, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [review.id, productId, user.userId, ratingNum, title, comment || '', review.created_at]
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Review created successfully',
        review,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Review POST error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to create review',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
