import type { APIRoute } from 'astro';
import { createCloudflareClient } from '../../../lib/cloudflare';
import { AuthManager, verifyJWT } from '../../../lib/auth';

/**
 * GET /api/products/[id]
 * Fetch single product by ID or slug
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;

    // Mock data for demo
    const mockProducts: Record<string, any> = {
      'prod_1': {
        id: 'prod_1',
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life',
        price: 199.99,
        category: 'Audio',
        sku: 'HEAD-001',
        image_url: 'https://assets.redwanmart.com/products/headphones.jpg',
        video_url: null,
        rating: 4.8,
        reviews_count: 245,
        in_stock: true,
        stock_quantity: 45,
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      'premium-wireless-headphones': {
        id: 'prod_1',
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life',
        price: 199.99,
        category: 'Audio',
        sku: 'HEAD-001',
        image_url: 'https://assets.redwanmart.com/products/headphones.jpg',
        video_url: null,
        rating: 4.8,
        reviews_count: 245,
        in_stock: true,
        stock_quantity: 45,
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const env = locals.runtime?.env || {};
    let product;

    if (env.DB) {
      const client = createCloudflareClient(env);
      // Try ID first, then slug
      product = await client.getProductById(id) || await client.getProductBySlug(id);
    } else {
      product = mockProducts[id];
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
  } catch (error) {
    console.error('Product GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch product',
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
 * PUT /api/products/[id]
 * Update product (Admin only)
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;

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

    const updates = await request.json();

    const env = locals.runtime?.env || {};
    if (env.DB) {
      const client = createCloudflareClient(env);
      await client.updateProduct(id, updates);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Product updated successfully',
        productId: id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Product PUT error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to update product',
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
 * DELETE /api/products/[id]
 * Delete product (Admin only)
 */
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;

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

    const env = locals.runtime?.env || {};
    if (env.DB) {
      const client = createCloudflareClient(env);
      await client.deleteProduct(id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Product deleted successfully',
        productId: id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Product DELETE error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
