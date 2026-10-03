# Landing Page

React + three.js landing page built with Vite, hosted on S3 + CloudFront in us-east-2.

**Live:** https://andrewblad.dev (also www.andrewblad.dev and https://d6j701c414dgk.cloudfront.net)

## Develop

```bash
npm install
npm run dev
```

The 3D hero lives in `src/components/HeroScene.tsx` (built with `@react-three/fiber` and `@react-three/drei`). Page content and sections are in `src/App.tsx`, and styles are in `src/index.css`.

## Deploy

Requires AWS CLI credentials for the project (`aws login`).

```bash
npm run deploy
```

This builds the site, syncs `dist/` to S3, and invalidates the CloudFront cache.

| Resource | Value |
|---|---|
| S3 bucket (private, OAC only) | `landing-page-463556655652-us-east-2` |
| CloudFront distribution | `E2NDHL51CVL5D4` |
| Origin Access Control | `E28MX8Z8I9HAGW` |
| ACM certificate (us-east-1, required by CloudFront) | `8c5a5e52-61c4-4687-aa62-66d0185d329e` |
| DNS | Cloudflare, CNAMEs for `@` and `www` → `d6j701c414dgk.cloudfront.net` (DNS only) |
