import type { APIRoute } from 'astro';
import { CloudflareClient, createCloudflareClient } from '../../lib/cloudflare';
import { AuthManager, verifyJWT } from '../../lib/auth';

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
    const category = url.searchParams.get('category');
    const featured = url.searchParams.get('featured') === 'true';

    // If ID is provided, fetch single product
    if (productId) {
      const env = locals.runtime?.env || {};
      let product = null;

      if (env.DB) {
        const client = createCloudflareClient(env);
        product = await client.getProductById(productId) || await client.getProductBySlug(productId);
      } else {
        // Mock single product
        const mockProducts: Record<string, any> = {
          'prod_1': {
            id: 'prod_1',
            name: 'Premium Wireless Headphones',
            slug: 'premium-wireless-headphones',
            price: 199.99,
            category: 'Audio',
            image_url: 'https://assets.redwanmart.com/products/headphones.jpg',
            rating: 4.8,
            reviews_count: 245,
            in_stock: true,
            featured: true,
          },
          'premium-wireless-headphones': {
            id: 'prod_1',
            name: 'Premium Wireless Headphones',
            slug: 'premium-wireless-headphones',
            price: 199.99,
            category: 'Audio',
            image_url: 'https://assets.redwanmart.com/products/headphones.jpg',
            rating: 4.8,
            reviews_count: 245,
            in_stock: true,
            featured: true,
          },
        };
        product = mockProducts[productId];
      }

      if (!product) {
        return new Response(
          JSON.stringify({ success: false, error: 'Product not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          product,
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
    }

    // Initialize Cloudflare client with environment
    const env = locals.runtime?.env || {};
    if (!env.DB) {
      // Return mock data when not in Cloudflare environment
      const mockProducts = [
        {
          id: 'prod_1',
          name: 'Premium Wireless Headphones',
          slug: 'premium-wireless-headphones',
          price: 199.99,
          category: 'Audio',
          image_url: 'https://assets.redwanmart.com/products/headphones.jpg',
          rating: 4.8,
          reviews_count: 245,
          in_stock: true,
          featured: true,
        },
        {
          id: 'prod_2',
          name: 'Smartwatch Pro Series',
          slug: 'smartwatch-pro-series',
          price: 349.99,
          category: 'Wearables',
          image_url: 'https://assets.redwanmart.com/products/smartwatch.jpg',
          rating: 4.6,
          reviews_count: 189,
          in_stock: true,
          featured: true,
        },
      ];

      return new Response(JSON.stringify({
        success: true,
        products: mockProducts,
        total: mockProducts.length,
        limit,
        offset,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const client = createCloudflareClient(env);

    let products;
    if (featured) {
      products = await client.getFeaturedProducts(limit);
    } else if (category) {
      products = await client.getProductsByCategory(category, limit);
    } else {
      products = await client.getProducts(limit, offset);
    }

    return new Response(JSON.stringify({
      success: true,
      products: products || [],
      limit,
      offset,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
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
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-min-32-chars-required';
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

    const data = await request.json();

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
