import type { APIRoute } from 'astro';
import { createCloudflareClient } from '../../lib/cloudflare';

/**
 * GET /api/categories
 * Fetch all product categories
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env || {};

    // Fetch categories from D1 database
    let categories = [];

    try {
      const client = createCloudflareClient(env);
      const result = await client.queryDB(
        'SELECT DISTINCT category FROM products ORDER BY category',
        []
      );

      if (result?.results) {
        categories = result.results.map((row: any, index: number) => ({
          id: `cat_${index + 1}`,
          name: row.category,
          slug: row.category.toLowerCase().replace(/\s+/g, '-'),
          description: `Browse ${row.category} products`,
          display_order: index + 1,
        }));
      }
    } catch (dbError) {
      console.error('D1 query error:', dbError);
      // Return empty categories on error
      categories = [];
    }

    return new Response(
      JSON.stringify({
        success: true,
        categories,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      }
    );
  } catch (error) {
    console.error('Categories GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
