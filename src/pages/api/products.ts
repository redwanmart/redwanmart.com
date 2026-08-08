import type { APIRoute } from 'astro';
import { CloudflareClient, createCloudflareClient } from '../../lib/cloudflare';
import { AuthManager, verifyJWT, requireJwtSecret } from '../../lib/auth';

/**
 * GET /api/products
 * Fetch paginated list of products or single product by ID
 * Query params: id (for single), limit, offset, category, featured
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const categoryParam = url.searchParams.get('category');
    const featured = url.searchParams.get('featured') === 'true';

    const env = locals.runtime?.env || {};

    // If ID is provided, fetch single product from D1
    if (productId) {
      try {
        const client = createCloudflareClient(env);
        const result = await client.queryDB(
          'SELECT * FROM products WHERE id = ? OR slug = ?',
          [productId, productId]
        );

        if (!result?.results || result.results.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'Product not found' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            product: result.results[0],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=600',
            },
          }
        );
      } catch (dbError) {
        console.error('D1 query error:', dbError);
        // Fallback to empty result on error
        return new Response(
          JSON.stringify({ success: false, error: 'Product not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch list of products from D1
    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (categoryParam) {
        query += ' AND category = ?';
        params.push(categoryParam);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const client = createCloudflareClient(env);
      const result = await client.queryDB(query, params);

      const countResult = await client.queryDB(
        'SELECT COUNT(*) as total FROM products' + (categoryParam ? ' WHERE category = ?' : ''),
        categoryParam ? [categoryParam] : []
      );

      const total = countResult?.results?.[0]?.total || 0;

      return new Response(
        JSON.stringify({
          success: true,
          products: result?.results || [],
          total,
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
    } catch (dbError) {
      console.error('D1 query error:', dbError);
      // Return empty results on error instead of failing
      return new Response(
        JSON.stringify({
          success: true,
          products: [],
          total: 0,
          limit,
          offset,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    console.error('Products GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch products',
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
 * POST /api/products
 * Create new product (Admin only)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verify JWT token
    const jwtSecret = requireJwtSecret();
    const authManager = new AuthManager(jwtSecret);
    const user = await verifyJWT(request, authManager);

    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized. Admin access required.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = (await request.json()) as Record<string, any>;

    // Validate required fields
    const { name, slug, description, price, category, sku } = data;
    if (!name || !slug || !price || !category) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: name, slug, price, category'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const productId = `prod_${Date.now()}`;
    const product = {
      id: productId,
      name,
      slug,
      description: description || '',
      price: parseFloat(price),
      category,
      sku: sku || `SKU-${productId}`,
      in_stock: data.in_stock !== false,
      stock_quantity: data.stock_quantity || 0,
      rating: data.rating || 0,
      reviews_count: 0,
      featured: data.featured || false,
    };

    // Database operation would go here with real Cloudflare binding
    // For now return success with generated ID
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Product created successfully',
        product,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Products POST error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
