#!/usr/bin/env bash
# Deploy the agent (FastAPI + AWS Lambda Web Adapter image) to AWS Lambda.
#
# Prereqs: docker running, AWS CLI with credentials loaded
# (aws sts get-caller-identity must work). Env vars for the function are read
# from apps/agent/.env — nothing secret is stored in this script or the image.
#
# Usage (from apps/agent):  ./deploy-lambda.sh
# Re-run it to deploy new code: it updates the existing function in place.
set -euo pipefail

REGION="${AWS_REGION:-ap-southeast-2}"
NAME="${LAMBDA_NAME:-resume-agent}"
ROLE_NAME="${NAME}-lambda-role"
MEMORY=1024
TIMEOUT=60

cd "$(dirname "$0")"

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO_URI="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${NAME}"
TAG=$(date +%Y%m%d%H%M%S)
IMAGE="${REPO_URI}:${TAG}"
echo "Account ${ACCOUNT}, region ${REGION}, image ${IMAGE}"

# ---- 1. ECR repo + image ----
aws ecr describe-repositories --region "$REGION" --repository-names "$NAME" >/dev/null 2>&1 \
  || aws ecr create-repository --region "$REGION" --repository-name "$NAME" >/dev/null
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"

# --provenance=false: Lambda rejects image indexes with attestation manifests.
docker buildx build --platform linux/amd64 --provenance=false -t "$IMAGE" --push .

# ---- 2. Execution role ----
if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{"Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]
  }' >/dev/null
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  echo "Waiting for the new IAM role to propagate..."
  sleep 15
fi
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query Role.Arn --output text)

# ---- 3. Env vars from .env (written to a private temp file, removed on exit) ----
ENV_JSON=$(mktemp)
chmod 600 "$ENV_JSON"
trap 'rm -f "$ENV_JSON"' EXIT
python3 - .env > "$ENV_JSON" <<'PY'
import json, sys
env = {}
for line in open(sys.argv[1]):
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    env[key.strip()] = value.strip().strip('"').strip("'")
print(json.dumps({"Variables": env}))
PY

# ---- 4. Create or update the function ----
if aws lambda get-function --region "$REGION" --function-name "$NAME" >/dev/null 2>&1; then
  aws lambda update-function-code --region "$REGION" --function-name "$NAME" --image-uri "$IMAGE" >/dev/null
  aws lambda wait function-updated-v2 --region "$REGION" --function-name "$NAME"
  aws lambda update-function-configuration --region "$REGION" --function-name "$NAME" \
    --memory-size "$MEMORY" --timeout "$TIMEOUT" --environment "file://$ENV_JSON" >/dev/null
else
  aws lambda create-function --region "$REGION" --function-name "$NAME" \
    --package-type Image --code ImageUri="$IMAGE" --role "$ROLE_ARN" \
    --architectures x86_64 --memory-size "$MEMORY" --timeout "$TIMEOUT" \
    --environment "file://$ENV_JSON" >/dev/null
fi
aws lambda wait function-updated-v2 --region "$REGION" --function-name "$NAME"

# ---- 5. Public Function URL ----
if ! aws lambda get-function-url-config --region "$REGION" --function-name "$NAME" >/dev/null 2>&1; then
  aws lambda create-function-url-config --region "$REGION" --function-name "$NAME" --auth-type NONE >/dev/null
  aws lambda add-permission --region "$REGION" --function-name "$NAME" \
    --statement-id public-url --action lambda:InvokeFunctionUrl \
    --principal '*' --function-url-auth-type NONE >/dev/null
  # Newer function URLs also require lambda:InvokeFunction via the URL.
  aws lambda add-permission --region "$REGION" --function-name "$NAME" \
    --statement-id public-url-invoke --action lambda:InvokeFunction \
    --principal '*' --invoked-via-function-url >/dev/null 2>&1 || true
fi
URL=$(aws lambda get-function-url-config --region "$REGION" --function-name "$NAME" --query FunctionUrl --output text)

# ---- 6. Smoke test ----
echo "Function URL: ${URL}"
echo "Health check (first call is a cold start, may take a while):"
curl -sS --max-time 90 "${URL}health"; echo
echo "Set RESUME_RAG_API_URL=${URL%/} in Vercel."
