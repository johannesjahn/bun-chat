#!/bin/bash

# Base URL
URL="http://localhost:3000"

echo "--- 1. Registering User ---"
REGISTER_RESPONSE=$(curl -s -X POST $URL/user/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123", "name": "Test User"}')
echo "Response: $REGISTER_RESPONSE"
echo ""

echo "--- 2. Logging In ---"
LOGIN_RESPONSE=$(curl -s -X POST $URL/user/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}')
echo "Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Error: Failed to get token. Login might have failed."
  exit 1
fi

echo "Token received: $TOKEN"
echo ""

echo "--- 3. Getting Users ---"
USERS_RESPONSE=$(curl -s -X GET $URL/user \
  -H "Authorization: Bearer $TOKEN")
echo "Users: $USERS_RESPONSE"
