export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const auth = request.headers.get('Authorization');
    if (auth !== 'Bearer ' + env.ADMIN_TOKEN) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');
    const contentType = url.searchParams.get('type') || 'application/octet-stream';

    if (!filename) {
      return Response.json({ error: 'Missing filename' }, { status: 400, headers: corsHeaders });
    }

    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `galleries/${timestamp}_${safeName}`;

    const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const bucket = env.R2_BUCKET_NAME;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
    const region = 'auto';

    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    const expires = 3600;

    const credential = `${accessKeyId}/${dateStamp}/${region}/s3/aws4_request`;
    const signedHeaders = 'host';

    const canonicalRequest = [
      'PUT',
      `/${bucket}/${key}`,
      `X-Amz-Content-Sha256=UNSIGNED-PAYLOAD`,
      `host:${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      '',
      signedHeaders,
      'UNSIGNED-PAYLOAD'
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      `${dateStamp}/${region}/s3/aws4_request`,
      await sha256(canonicalRequest)
    ].join('\n');

    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, 's3');
    const signature = await hmacSha256(signingKey, stringToSign);

    const presignedUrl = `${endpoint}/${bucket}/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${encodeURIComponent(credential)}&X-Amz-Date=${amzDate}&X-Amz-Expires=${expires}&X-Amz-SignedHeaders=${signedHeaders}&X-Amz-Signature=${signature}`;

    const publicUrl = env.R2_PUBLIC_URL
      ? `${env.R2_PUBLIC_URL}/${key}`
      : `${endpoint}/${bucket}/${key}`;

    return Response.json({
      uploadUrl: presignedUrl,
      publicUrl: publicUrl,
      key: key,
      expires: expires
    }, { headers: corsHeaders });
  }
};

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256(key, data) {
  const encoder = new TextEncoder();
  const keyBuffer = typeof key === 'string' ? encoder.encode(key) : key;
  const dataBuffer = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getSignatureKey(key, dateStamp, region, service) {
  const kDate = await hmacSha256('AWS4' + key, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, 'aws4_request');
}
