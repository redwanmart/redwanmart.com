import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    // This will query the D1 database when credentials are provided
    // For now, returning mock data
    const products = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 199.99,
        category: 'Electronics',
        inStock: true,
      },
      {
        id: '2',
        name: 'Smartwatch Pro Series',
        price: 349.99,
        category: 'Wearables',
        inStock: true,
      },
    ];

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Admin only: Create new product
    const data = await request.json();

    // Validate JWT and role (will implement with credentials)
    // For now, just return success
    return new Response(JSON.stringify({ success: true, id: 'new-product-id' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create product' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
