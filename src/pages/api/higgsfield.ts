import type { APIRoute } from 'astro';
import { HiggsfieldClient } from '../../lib/higgsfield';
import { createCloudflareClient } from '../../lib/cloudflare';
import { AuthManager, verifyJWT, requireJwtSecret } from '../../lib/auth';

export interface GenerateMediaRequest {
  prompt: string;
  type: 'image' | 'video';
  productId: string;
  width?: number;
  height?: number;
}

/**
 * POST /api/higgsfield
 * Generate media using Higgsfield AI and save to R2
 * Admin only
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verify JWT token - Admin only
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

    // Parse request body
    const data = await request.json() as GenerateMediaRequest;
    const { prompt, type, productId, width, height } = data;

    // Validate required fields
    if (!prompt || !type || !productId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: prompt, type, productId'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!['image', 'video'].includes(type)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid type. Must be "image" or "video"'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const env = locals.runtime?.env || {};
    const apiKey = (env as any).HIGGSFIELD_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Higgsfield API key not configured'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Higgsfield client
    const higgsfield = new HiggsfieldClient(apiKey as string);

    // Generate media
    const generationResult = await higgsfield.generate({
      prompt,
      type,
      productId,
      width: width || (type === 'image' ? 1024 : 1280),
      height: height || (type === 'image' ? 1024 : 720),
    });

    if (!generationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to generate media',
          message: generationResult.error,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // If media was generated with direct URL, save metadata to D1
    let publicUrl = generationResult.url;

    if (publicUrl && env.DB) {
      try {
        const client = createCloudflareClient(env);
        const mediaId = `media_${Date.now()}`;
        const fileExtension = type === 'image' ? 'jpg' : 'mp4';
        const r2Key = `products/${productId}/${mediaId}.${fileExtension}`;

        // Save metadata to D1
        await client.executeDB(
          `INSERT INTO media_metadata (id, type, r2_key, r2_url, cdn_url, generated_by, higgsfield_job_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            mediaId,
            type,
            r2Key,
            publicUrl,
            publicUrl,
            'higgsfield',
            generationResult.jobId || '',
            new Date().toISOString()
          ]
        );
      } catch (dbError) {
        console.error('D1 metadata save error:', dbError);
        // Continue - metadata save failure shouldn't block media generation
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${type === 'image' ? 'Image' : 'Video'} generated successfully`,
        jobId: generationResult.jobId,
        url: publicUrl,
        type,
        productId,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Higgsfield API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate media',
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
 * GET /api/higgsfield?jobId=...
 * Poll job status
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return new Response(
        JSON.stringify({ success: false, error: 'jobId parameter required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const env = locals.runtime?.env || {};
    const apiKey = (env as any).HIGGSFIELD_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Higgsfield API key not configured'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const higgsfield = new HiggsfieldClient(apiKey as string);
    const status = await higgsfield.getJobStatus(jobId);

    return new Response(
      JSON.stringify({
        success: status.success,
        jobId,
        url: status.url,
        status: status.message,
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
    console.error('Job status error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch job status',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
