import type { APIRoute } from 'astro';
import { createCloudflareClient } from '../../lib/cloudflare';

/**
 * POST /api/analytics
 * Track analytics events (page views, clicks, searches, etc.)
 * Body: { eventType: string, productId?: string, userId?: string, eventData?: object }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { eventType, productId, userId, eventData } = data;

    if (!eventType) {
      return new Response(
        JSON.stringify({ success: false, error: 'eventType is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') ||
                     request.headers.get('cf-connecting-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const event = {
      id: eventId,
      event_type: eventType,
      user_id: userId,
      product_id: productId,
      event_data: JSON.stringify(eventData || {}),
      ip_address: clientIP,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    };

    const env = locals.runtime?.env || {};

    if (env.DB) {
      const client = createCloudflareClient(env);
      await client.executeDB(
        `INSERT INTO analytics_events (id, event_type, user_id, product_id, event_data, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id,
          event.event_type,
          event.user_id,
          event.product_id,
          event.event_data,
          event.ip_address,
          event.user_agent,
          event.created_at,
        ]
      );
    }

    // Response without exposing event details
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event recorded',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Analytics POST error:', error);
    // Don't expose errors for analytics endpoint
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

/**
 * GET /api/analytics/summary
 * Get analytics summary (Admin only)
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Check for admin access
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_ANALYTICS_TOKEN || 'admin-token-secret';
    const expectedToken = `Bearer ${adminToken}`;

    if (authHeader !== expectedToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized. Admin token required.'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    const env = locals.runtime?.env || {};

    // Mock summary
    const mockSummary = {
      totalEvents: 1250,
      uniqueVisitors: 342,
      topProducts: [
        { productId: 'prod_1', views: 145, purchases: 23 },
        { productId: 'prod_2', views: 132, purchases: 18 },
        { productId: 'prod_3', views: 98, purchases: 14 },
      ],
      topEvents: [
        { eventType: 'page_view', count: 650 },
        { eventType: 'product_view', count: 320 },
        { eventType: 'add_to_cart', count: 156 },
        { eventType: 'purchase', count: 124 },
      ],
      conversionRate: 0.362,
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    };

    if (env.DB) {
      const client = createCloudflareClient(env);
      const result = await client.queryDB(
        `SELECT event_type, COUNT(*) as count
         FROM analytics_events
         WHERE created_at >= datetime('now', '-' || ? || ' days')
         GROUP BY event_type
         ORDER BY count DESC`,
        [days]
      );

      if (result?.results) {
        mockSummary.topEvents = result.results;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: mockSummary,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=300',
        },
      }
    );
  } catch (error) {
    console.error('Analytics GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
