#!/usr/bin/env bash
# Build the site, sync it to S3, and invalidate the CloudFront cache.
set -euo pipefail

REGION="${AWS_REGION:-us-east-2}"
BUCKET="${DEPLOY_BUCKET:-landing-page-463556655652-us-east-2}"
DISTRIBUTION_ID="${DEPLOY_DISTRIBUTION_ID:-E2NDHL51CVL5D4}"

cd "$(dirname "$0")/.."
npm run build

# Hashed assets never change, so cache them for a year
aws s3 sync dist/assets "s3://$BUCKET/assets" --region "$REGION" --delete \
  --cache-control "public, max-age=31536000, immutable"

# Everything else (index.html, favicon) must revalidate so new deploys show up
aws s3 sync dist "s3://$BUCKET" --region "$REGION" --delete \
  --exclude "assets/*" --cache-control "no-cache"

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" \
  --paths "/index.html" "/" --query 'Invalidation.Id' --output text

echo "Deployed: https://andrewblad.dev"
