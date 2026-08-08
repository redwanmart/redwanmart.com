/// <reference types="astro" />
/// <reference types="@cloudflare/workers-types" />
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    // Injected by @astrojs/cloudflare — the Workers bindings for the request.
    runtime: {
      env: CloudflareEnv;
      cf?: IncomingRequestCfProperties;
      ctx: ExecutionContext;
    };
    db: D1Database;
    kv: KVNamespace;
    assetsBucket: R2Bucket;
    userId?: string;
    userRole?: 'customer' | 'admin';
  }
}

interface CloudflareEnv {
  DB: D1Database;
  CACHE: KVNamespace;
  ASSETS_BUCKET: R2Bucket;
  ENVIRONMENT: string;
  APP_URL: string;
  ASSETS_URL: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CF_ACCOUNT_ID: string;
      CF_API_TOKEN: string;
      CF_ZONE_ID: string;
      CF_R2_BUCKET_NAME: string;
      CF_R2_PUBLIC_URL: string;
      CF_D1_ID: string;
      CF_KV_NAMESPACE: string;
      HIGGSFIELD_API_KEY: string;
      HIGGSFIELD_WORKSPACE_ID: string;
      JWT_SECRET: string;
      ADMIN_EMAIL: string;
      ADMIN_PASSWORD: string;
      ADMIN_ANALYTICS_TOKEN: string;
      ENVIRONMENT: string;
      APP_URL: string;
      ASSETS_URL: string;
    }
  }
}
