import type { APIRoute } from 'astro';
import { createCloudflareClient } from '../../lib/cloudflare';
import { AuthManager, verifyJWT } from '../../lib/auth';

/**
 * POST /api/media-upload
 * Upload media file to R2 bucket
 * Accepts: image/jpeg, image/png, image/webp, video/mp4, video/webm
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verify JWT token (admin only)
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-min-32-chars-required';
    const authManager = new AuthManager(jwtSecret);
    const user = await verifyJWT(request, authManager);

    if (!user || (user.role !== 'admin' && !authManager.hasPermission(user.role, 'manage_media'))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized. Media management access required.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const mediaType = formData.get('type') as 'image' | 'video' | 'thumbnail';

    // Validate file
    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid file type. Allowed: JPEG, PNG, WebP, MP4, WebM'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (100MB max)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: 'File too large. Max 100MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop() || 'unknown';
    const r2Key = `products/${productId}/${mediaType}-${timestamp}-${random}.${fileExt}`;
    const r2Url = `https://assets.redwanmart.com/${r2Key}`;

    const env = locals.runtime?.env || {};

    if (env.ASSETS_BUCKET) {
      // Upload to R2
      const client = createCloudflareClient(env);
      const buffer = await file.arrayBuffer();

      await client.uploadToR2(r2Key, buffer, file.type);

      // Save metadata to database
      const mediaId = `media_${timestamp}_${random}`;
      const metadata = {
        id: mediaId,
        type: mediaType,
        r2_key: r2Key,
        r2_url: r2Url,
        product_id: productId,
        generated_by: 'user_upload',
        mime_type: file.type,
      };

      if (env.DB) {
        await client.saveMediaMetadata(metadata);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'File uploaded successfully',
          media: {
            id: mediaId,
            type: mediaType,
            url: r2Url,
            key: r2Key,
            productId,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Mock response when not in Cloudflare environment
      return new Response(
        JSON.stringify({
          success: true,
          message: 'File uploaded successfully (mock)',
          media: {
            id: `media_${Date.now()}`,
            type: mediaType,
            url: r2Url,
            key: r2Key,
            productId,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Media upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to upload media',
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
 * GET /api/media-upload?productId=...
 * List media files for a product
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return new Response(
        JSON.stringify({ success: false, error: 'productId parameter required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const env = locals.runtime?.env || {};

    if (env.DB) {
      const client = createCloudflareClient(env);
      const media = await client.getMediaByProductId(productId);

      return new Response(
        JSON.stringify({
          success: true,
          productId,
          media: media || [],
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
    } else {
      // Mock response
      return new Response(
        JSON.stringify({
          success: true,
          productId,
          media: [],
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
    console.error('Media GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch media',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
