# R2 Storage Setup

## 1. Create R2 bucket
- Go to Cloudflare Dashboard → R2 → Create bucket
- Name: `phase-one-photos`
- Location: Automatic

## 2. Create API token
- R2 → Manage R2 API Tokens → Create API Token
- Permissions: Object Read & Write
- Scope: `phase-one-photos` bucket only
- Save the Access Key ID and Secret Access Key

## 3. Deploy the worker
```bash
cd workers/r2-upload
npx wrangler login
npx wrangler deploy
```

## 4. Set worker secrets
```bash
npx wrangler secret put ADMIN_TOKEN
# Enter: Benson123!
npx wrangler secret put R2_ACCOUNT_ID
# Enter: your Cloudflare account ID
npx wrangler secret put R2_BUCKET_NAME
# Enter: phase-one-photos
npx wrangler secret put R2_ACCESS_KEY_ID
# Enter: from step 2
npx wrangler secret put R2_SECRET_ACCESS_KEY
# Enter: from step 2
npx wrangler secret put R2_PUBLIC_URL
# Enter: https://pub-YOURHASH.r2.dev  (get this from R2 bucket settings → Public Access)
```

## 5. Update the admin page
In /hub/admin.html, update `R2_WORKER_URL` to your deployed worker URL.
