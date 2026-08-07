import type { APIRoute } from 'astro';
import { createCloudflareClient } from '../../lib/cloudflare';

/**
 * GET /api/search?q=...&category=...&minPrice=...&maxPrice=...&sort=...
 * Search products with filtering and sorting
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';
    const category = url.searchParams.get('category');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sort = url.searchParams.get('sort') || 'relevance'; // relevance, price_asc, price_desc, rating, newest
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Validate search query
    if (query.length < 1) {
      return new Response(
        JSON.stringify({
          success: true,
          results: [],
          query,
          message: 'Please enter a search term',
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

    if (query.length > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Search query too long (max 100 characters)'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Mock products for demonstration
    const allProducts = [
      {
        id: 'prod_1',
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        category: 'Audio',
        rating: 4.8,
        reviews_count: 245,
        in_stock: true,
        featured: true,
      },
      {
        id: 'prod_2',
        name: 'Smartwatch Pro Series',
        slug: 'smartwatch-pro-series',
        description: 'Advanced smartwatch with fitness tracking',
        price: 349.99,
        category: 'Wearables',
        rating: 4.6,
        reviews_count: 189,
        in_stock: true,
        featured: true,
      },
      {
        id: 'prod_16',
        name: 'Noise Cancelling Earbuds',
        slug: 'noise-cancelling-earbuds',
        description: 'True wireless earbuds with active noise cancellation',
        price: 249.99,
        category: 'Audio',
        rating: 4.8,
        reviews_count: 456,
        in_stock: true,
        featured: true,
      },
    ];

    let results = allProducts;

    // Text search
    if (query) {
      results = results.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (category) {
      results = results.filter((p) =>
        p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Price filter
    if (minPrice) {
      results = results.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      results = results.filter((p) => p.price <= parseFloat(maxPrice));
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Would sort by created_at in production
        results.reverse();
        break;
      case 'relevance':
      default:
        // Sort by relevance (name match priority, then rating)
        results.sort((a, b) => {
          const aNameMatch = a.name.toLowerCase().includes(query) ? 1 : 0;
          const bNameMatch = b.name.toLowerCase().includes(query) ? 1 : 0;
          if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;
          return b.rating - a.rating;
        });
    }

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    return new Response(
      JSON.stringify({
        success: true,
        query,
        results: paginatedResults,
        total,
        limit,
        offset,
        filters: {
          category,
          minPrice,
          maxPrice,
          sort,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
