import type { APIRoute } from 'astro';
import { createCloudflareClient } from '../../lib/cloudflare';

/**
 * GET /api/categories
 * Fetch all product categories
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Mock categories from seed data
    const mockCategories = [
      {
        id: 'cat_1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'High-tech gadgets and devices',
        display_order: 1,
      },
      {
        id: 'cat_2',
        name: 'Wearables',
        slug: 'wearables',
        description: 'Smartwatches and fitness trackers',
        display_order: 2,
      },
      {
        id: 'cat_3',
        name: 'Audio',
        slug: 'audio',
        description: 'Headphones, speakers, and audio equipment',
        display_order: 3,
      },
      {
        id: 'cat_4',
        name: 'Photography',
        slug: 'photography',
        description: 'Cameras and photography accessories',
        display_order: 4,
      },
      {
        id: 'cat_5',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Phone cases, chargers, and more',
        display_order: 5,
      },
      {
        id: 'cat_6',
        name: 'Bags',
        slug: 'bags',
        description: 'Backpacks, laptop bags, and travel bags',
        display_order: 6,
      },
      {
        id: 'cat_7',
        name: 'Toys & Collectibles',
        slug: 'toys-collectibles',
        description: 'Collectible action figures, building blocks, and toys',
        display_order: 7,
      },
    ];

    return new Response(
      JSON.stringify({
        success: true,
        categories: mockCategories,
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
