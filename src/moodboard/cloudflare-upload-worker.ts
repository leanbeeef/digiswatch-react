// Example Cloudflare Worker for handling image uploads to R2.
// Bindings required in wrangler.toml:
// - R2 bucket binding, e.g. `bucket = { binding = "R2_BUCKET", bucket_name = "your-bucket-name" }`
// - Optional public base URL via environment variable, e.g. `PUBLIC_CDN_BASE`.

export interface Env {
  R2_BUCKET: R2Bucket; // Provided by Wrangler binding
  PUBLIC_CDN_BASE?: string; // e.g. "https://cdn.example.com"
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PREFIX = 'uploads/';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response('Invalid content type', { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return new Response('File field missing', { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return new Response('Only image uploads are allowed', { status: 415 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return new Response('File too large', { status: 413 });
    }

    const extension = file.name.split('.').pop() || 'img';
    const key = `${ALLOWED_PREFIX}${crypto.randomUUID()}.${extension}`;

    await env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const base = env.PUBLIC_CDN_BASE || '';
    const url = base ? `${base.replace(/\/$/, '')}/${key}` : `/${key}`;

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  },
};
