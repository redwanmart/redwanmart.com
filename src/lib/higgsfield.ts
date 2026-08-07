/**
 * Higgsfield AI Integration
 * Wrapper for Higgsfield AI media generation API
 */

export interface HiggsfieldGenerateRequest {
  prompt: string;
  type: 'image' | 'video';
  productId: string;
  width?: number;
  height?: number;
}

export interface HiggsfieldGenerateResponse {
  success: boolean;
  jobId?: string;
  url?: string;
  error?: string;
  message?: string;
}

export class HiggsfieldClient {
  private apiKey: string;
  private baseUrl = 'https://api.higgsfield.ai/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Higgsfield API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Generate image or video using Higgsfield AI
   */
  async generate(request: HiggsfieldGenerateRequest): Promise<HiggsfieldGenerateResponse> {
    try {
      const payload = {
        prompt: request.prompt,
        type: request.type,
        width: request.width || 1024,
        height: request.height || 1024,
      };

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Higgsfield API error:', error);
        return {
          success: false,
          error: `API Error: ${response.status}`,
          message: error,
        };
      }

      const data = await response.json() as any;

      return {
        success: true,
        jobId: data.jobId || data.id,
        url: data.url,
      };
    } catch (error) {
      console.error('Higgsfield generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Poll for job status
   */
  async getJobStatus(jobId: string): Promise<HiggsfieldGenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch job status: ${response.status}`,
        };
      }

      const data = await response.json() as any;

      return {
        success: data.status === 'completed',
        jobId: data.id,
        url: data.output?.url,
        message: data.status,
      };
    } catch (error) {
      console.error('Job status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
