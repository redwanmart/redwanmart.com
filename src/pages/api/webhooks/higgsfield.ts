import type { APIRoute } from 'astro';
import { createCloudflareClient } from '../../../lib/cloudflare';

/**
 * POST /api/webhooks/higgsfield
 * Receive callbacks from Higgsfield AI media generation
 * Webhook from Higgsfield when image/video generation completes
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verify webhook signature (production: validate against Higgsfield secret)
    const webhookSecret = process.env.HIGGSFIELD_WEBHOOK_SECRET || 'dev-webhook-secret';
    const signature = request.headers.get('x-higgsfield-signature');

    // For production, implement proper signature verification
    // if (!signature || !verifyWebhookSignature(signature, webhookSecret)) {
    //   return new Response(
    //     JSON.stringify({ success: false, error: 'Invalid webhook signature' }),
    //     { status: 401, headers: { 'Content-Type': 'application/json' } }
    //   );
    // }

    const payload = await request.json();
    const { jobId, status, urls, productId, mediaType, prompt } = payload;

    if (!jobId || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: jobId, status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle different completion statuses
    switch (status) {
      case 'completed':
        return await handleGenerationComplete(
          jobId,
          urls,
          productId,
          mediaType,
          prompt,
          locals
        );

      case 'failed':
        return await handleGenerationFailed(jobId, payload.error, locals);

      case 'processing':
        // Just acknowledge processing status
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Generation in progress',
            jobId,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown status' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Higgsfield webhook error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Webhook processing failed',
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
 * Handle successful generation completion
 */
async function handleGenerationComplete(
  jobId: string,
  urls: string[] | undefined,
  productId: string | undefined,
  mediaType: string,
  prompt: string,
  locals: any
) {
  try {
    const env = locals.runtime?.env || {};

    if (!urls || urls.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No URLs returned from Higgsfield'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store generation results in database
    if (env.DB && productId) {
      const client = createCloudflareClient(env);

      // For each generated URL, create media metadata entry
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const mediaId = `media_${jobId}_${i}`;

        // Extract R2 key from URL (assuming Higgsfield returns R2 URLs)
        const r2Key = extractR2Key(url);

        const metadata = {
          id: mediaId,
          type: mediaType || 'image',
          r2_key: r2Key,
          r2_url: url,
          product_id: productId,
          generated_by: 'higgsfield',
          higgsfield_job_id: jobId,
          higgsfield_prompt: prompt,
        };

        await client.saveMediaMetadata(metadata);
      }

      // Optionally cache the generation result
      await client.cacheSet(
        `higgsfield_job_${jobId}`,
        {
          status: 'completed',
          urls,
          completedAt: new Date().toISOString(),
        },
        86400 // 24 hour TTL
      );
    }

    console.log(`✓ Higgsfield job ${jobId} completed: ${urls.length} assets generated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Generation results saved',
        jobId,
        mediaCount: urls.length,
        productId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error handling generation completion:', error);
    throw error;
  }
}

/**
 * Handle generation failure
 */
async function handleGenerationFailed(
  jobId: string,
  errorMessage: string | undefined,
  locals: any
) {
  try {
    const env = locals.runtime?.env || {};

    if (env.DB) {
      const client = createCloudflareClient(env);

      // Cache failure status
      await client.cacheSet(
        `higgsfield_job_${jobId}`,
        {
          status: 'failed',
          error: errorMessage || 'Unknown error',
          failedAt: new Date().toISOString(),
        },
        3600 // 1 hour TTL
      );
    }

    console.error(`✗ Higgsfield job ${jobId} failed: ${errorMessage}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Failure status recorded',
        jobId,
        error: errorMessage,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error handling generation failure:', error);
    throw error;
  }
}

/**
 * Extract R2 key from URL
 * Assumes URLs follow pattern: https://assets.redwanmart.com/{key}
 */
function extractR2Key(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.replace(/^\//, '');
  } catch {
    return url;
  }
}

/**
 * GET /api/webhooks/higgsfield?jobId=...
 * Check generation job status
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

    if (env.DB) {
      const client = createCloudflareClient(env);

      // Try to get status from cache
      const cachedStatus = await client.cacheGet(`higgsfield_job_${jobId}`);

      if (cachedStatus) {
        return new Response(
          JSON.stringify({
            success: true,
            jobId,
            ...cachedStatus,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60',
            },
          }
        );
      }
    }

    // Job not found or not yet completed
    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        status: 'pending',
        message: 'Job processing or not found',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Job status check error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to check job status',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
