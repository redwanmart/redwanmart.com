/**
 * Cloudflare Services Integration
 * D1 Database, R2 Storage, KV Cache Management
 */

export interface CloudflareEnv {
  DB: D1Database;
  CACHE: KVNamespace;
  ASSETS_BUCKET: R2Bucket;
}

export class CloudflareClient {
  private db: D1Database;
  private kv: KVNamespace;
  private r2: R2Bucket;

  constructor(env: CloudflareEnv) {
    this.db = env.DB;
    this.kv = env.CACHE;
    this.r2 = env.ASSETS_BUCKET;
  }

  /**
   * Database Operations
   */
  async queryDB(sql: string, params?: any[]): Promise<any> {
    try {
      const stmt = this.db.prepare(sql);
      const result = params ? stmt.bind(...params).all() : stmt.all();
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async executeDB(sql: string, params?: any[]): Promise<any> {
    try {
      const stmt = this.db.prepare(sql);
      const result = params ? stmt.bind(...params).run() : stmt.run();
      return result;
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  }

  /**
   * Product Operations
   */
  async getProducts(limit = 20, offset = 0): Promise<any[]> {
    const result = await this.queryDB(
      `SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return result.results || [];
  }

  async getProductById(id: string): Promise<any> {
    const result = await this.queryDB(
      `SELECT * FROM products WHERE id = ?`,
      [id]
    );
    return result.results?.[0] || null;
  }

  async getProductBySlug(slug: string): Promise<any> {
    const result = await this.queryDB(
      `SELECT * FROM products WHERE slug = ?`,
      [slug]
    );
    return result.results?.[0] || null;
  }

  async getProductsByCategory(category: string, limit = 20): Promise<any[]> {
    const result = await this.queryDB(
      `SELECT * FROM products WHERE category = ? ORDER BY created_at DESC LIMIT ?`,
      [category, limit]
    );
    return result.results || [];
  }

  async getFeaturedProducts(limit = 6): Promise<any[]> {
    const result = await this.queryDB(
      `SELECT * FROM products WHERE featured = true ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    return result.results || [];
  }

  async createProduct(product: any): Promise<any> {
    const {
      id,
      name,
      slug,
      description,
      price,
      category,
      sku,
      in_stock = true,
      stock_quantity = 0,
    } = product;

    const result = await this.executeDB(
      `INSERT INTO products (id, name, slug, description, price, category, sku, in_stock, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug, description, price, category, sku, in_stock, stock_quantity]
    );
    return result;
  }

  async updateProduct(id: string, updates: any): Promise<any> {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    const result = await this.executeDB(
      `UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    return result;
  }

  async deleteProduct(id: string): Promise<any> {
    const result = await this.executeDB(
      `DELETE FROM products WHERE id = ?`,
      [id]
    );
    return result;
  }

  /**
   * Media Operations
   */
  async uploadToR2(
    key: string,
    body: ReadableStream | ArrayBuffer,
    contentType: string
  ): Promise<R2Object> {
    try {
      const object = await this.r2.put(key, body, {
        httpMetadata: {
          contentType,
        },
      });
      return object;
    } catch (error) {
      console.error('R2 upload error:', error);
      throw error;
    }
  }

  async getR2Object(key: string): Promise<R2Object | null> {
    try {
      const object = await this.r2.get(key);
      return object;
    } catch (error) {
      console.error('R2 get error:', error);
      return null;
    }
  }

  async deleteFromR2(key: string): Promise<void> {
    try {
      await this.r2.delete(key);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw error;
    }
  }

  async getR2SignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    // This will be implemented when real Cloudflare credentials are available
    const publicUrl = `https://assets.redwanmart.com/${key}`;
    return publicUrl;
  }

  /**
   * Media Metadata Operations
   */
  async saveMediaMetadata(metadata: any): Promise<any> {
    const {
      id,
      type,
      r2_key,
      r2_url,
      product_id,
      generated_by,
      higgsfield_job_id,
    } = metadata;

    const result = await this.executeDB(
      `INSERT INTO media_metadata (id, type, r2_key, r2_url, product_id, generated_by, higgsfield_job_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, type, r2_key, r2_url, product_id, generated_by, higgsfield_job_id]
    );
    return result;
  }

  async getMediaByProductId(productId: string): Promise<any[]> {
    const result = await this.queryDB(
      `SELECT * FROM media_metadata WHERE product_id = ? ORDER BY created_at DESC`,
      [productId]
    );
    return result.results || [];
  }

  /**
   * Cache Operations
   */
  async cacheSet(
    key: string,
    value: any,
    expirationTtl = 3600
  ): Promise<void> {
    try {
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl,
      });
    } catch (error) {
      console.error('KV set error:', error);
      throw error;
    }
  }

  async cacheGet(key: string): Promise<any | null> {
    try {
      const value = await this.kv.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  async cacheDelete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error('KV delete error:', error);
      throw error;
    }
  }

  /**
   * Utility Methods
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.queryDB('SELECT 1');
      return !!result;
    } catch {
      return false;
    }
  }
}

export function createCloudflareClient(env: CloudflareEnv): CloudflareClient {
  return new CloudflareClient(env);
}
