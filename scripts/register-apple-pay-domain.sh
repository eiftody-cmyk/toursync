#!/bin/bash

# Apple Pay Domain Registration Script for PayPal
# Usage: ./register-apple-pay-domain.sh --sandbox
#        ./register-apple-pay-domain.sh --live

set -e

# Parse arguments
ENVIRONMENT=""
for arg in "$@"; do
  case $arg in
    --sandbox) ENVIRONMENT="sandbox" ;;
    --live) ENVIRONMENT="live" ;;
    --help|-h) echo "Usage: $0 [--sandbox|--live]"; exit 0 ;;
  esac
done

if [ -z "$ENVIRONMENT" ]; then
  echo "Error: Specify environment with --sandbox or --live"
  exit 1
fi

# Check required env vars
if [ -z "$PAYPAL_CLIENT_ID" ] || [ -z "$PAYPAL_CLIENT_SECRET" ]; then
  echo "Error: Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables"
  exit 1
fi

DOMAIN="osakacastletours.com"
MERCHANT_ID="XJ3WTELBFU9W2"

if [ "$ENVIRONMENT" = "sandbox" ]; then
  BASE_URL="https://api-m.sandbox.paypal.com"
  TOKEN_URL="${BASE_URL}/v1/oauth2/token"
  WALLETS_URL="${BASE_URL}/v1/customer/wallet-domains"
else
  BASE_URL="https://api-m.paypal.com"
  TOKEN_URL="${BASE_URL}/v1/oauth2/token"
  WALLETS_URL="${BASE_URL}/v1/customer/wallet-domains"
fi

echo "=== Apple Pay Domain Registration (${ENVIRONMENT}) ==="
echo ""

# Step 1: Get access token
echo "[1/4] Getting access token..."
ACCESS_TOKEN=$(curl -s -u "${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  "$TOKEN_URL" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: Failed to get access token"
  exit 1
fi
echo "  Got access token: ${ACCESS_TOKEN:0:20}..."

# Step 2: Generate auth assertion (unsigned JWT)
echo ""
echo "[2/4] Generating PayPal Auth Assertion..."

# Header: {"alg":"none"}
HEADER=$(echo -n '{"alg":"none"}' | python3 -c "
import sys, base64
data = sys.stdin.buffer.read()
print(base64.urlsafe_b64encode(data).rstrip(b'=').decode())
")

# Payload: {"iss":"client_id","payer_id":"merchant_id"}
PAYLOAD=$(echo -n "{\"iss\":\"${PAYPAL_CLIENT_ID}\",\"payer_id\":\"${MERCHANT_ID}\"}" | python3 -c "
import sys, base64
data = sys.stdin.buffer.read()
print(base64.urlsafe_b64encode(data).rstrip(b'=').decode())
")

# Concatenate with empty signature
AUTH_ASSERTION="${HEADER}.${PAYLOAD}."
echo "  Auth assertion generated"

# Step 3: Register domain
echo ""
echo "[3/4] Registering domain: ${DOMAIN}"
echo "  POST ${WALLETS_URL}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WALLETS_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "paypal-auth-assertion: ${AUTH_ASSERTION}" \
  -d "{\"provider_type\": \"APPLE_PAY\", \"domain\": {\"name\": \"${DOMAIN}\"}}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
  echo "  ✅ Domain registered successfully!"
  echo ""
  echo "Response:"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo "  ❌ Registration failed (HTTP $HTTP_CODE)"
  echo ""
  echo "Response:"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi

# Step 4: Verify registration
echo ""
echo "[4/4] Verifying registration..."
VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$WALLETS_URL" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "paypal-auth-assertion: ${AUTH_ASSERTION}")

VERIFY_HTTP=$(echo "$VERIFY_RESPONSE" | tail -n1)
VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')

if [ "$VERIFY_HTTP" = "200" ]; then
  echo "  ✅ Verification successful!"
  echo ""
  echo "Registered domains:"
  echo "$VERIFY_BODY" | python3 -m json.tool 2>/dev/null || echo "$VERIFY_BODY"
else
  echo "  ❌ Verification failed (HTTP $VERIFY_HTTP)"
  echo "$VERIFY_BODY"
fi

echo ""
echo "=== Done ==="
