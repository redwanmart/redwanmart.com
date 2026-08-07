/// <reference types="astro" />
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
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
      ENVIRONMENT: string;
      APP_URL: string;
      ASSETS_URL: string;
    }
  }
}
