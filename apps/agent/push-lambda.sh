#!/usr/bin/env bash
# Build the agent image from the current code and deploy it to the existing
# resume-agent Lambda function. Only the code changes: env vars, role and
# Function URL stay as they are.
#
# Usage:  aws login --region ap-southeast-2 && ./push-lambda.sh
#         (without a login, credentials are read from ~/aws-temp.env~,
#          or CREDS_FILE=path ./push-lambda.sh)
set -euo pipefail

CREDS_FILE="${CREDS_FILE:-$HOME/aws-temp.env~}"
REGION="${AWS_REGION:-ap-southeast-2}"
NAME="${LAMBDA_NAME:-resume-agent}"

cd "$(dirname "$0")"

export AWS_REGION="$REGION"
# Use an existing session (aws login / aws configure) if there is one;
# otherwise fall back to the temp credentials file.
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  # shellcheck disable=SC1090
  source "$CREDS_FILE"
  aws sts get-caller-identity >/dev/null \
    || { echo "AWS login failed: run 'aws login' or refresh $CREDS_FILE"; exit 1; }
fi

REPO=$(aws lambda get-function --function-name "$NAME" --region "$REGION" \
  --query Code.ImageUri --output text | cut -d: -f1 | cut -d@ -f1)
TAG=$(date +%Y%m%d%H%M%S)
echo "Deploying $REPO:$TAG to $NAME ($REGION)"

aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "${REPO%%/*}"

# --provenance=false: Lambda rejects image indexes with attestation manifests.
docker buildx build --platform linux/amd64 --provenance=false -t "$REPO:$TAG" --push .

aws lambda update-function-code --function-name "$NAME" --region "$REGION" \
  --image-uri "$REPO:$TAG" >/dev/null
aws lambda wait function-updated-v2 --function-name "$NAME" --region "$REGION"

URL=$(aws lambda get-function-url-config --function-name "$NAME" --region "$REGION" \
  --query FunctionUrl --output text)
echo "Deployed. Health check (cold start, may take a while):"
curl -sS --max-time 90 "${URL}health"; echo
