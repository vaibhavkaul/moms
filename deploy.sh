#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://moms.kidsartto.life/ --delete \
  --cache-control "public, max-age=31536000, immutable"

aws s3 cp dist/index.html s3://moms.kidsartto.life/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

echo "Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id ECSUIAZ6ZSG5Q \
  --paths "/*" \
  --query 'Invalidation.Status' --output text

echo "Done — https://moms.kidsartto.life"
