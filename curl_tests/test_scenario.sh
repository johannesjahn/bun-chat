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
echo ""

echo "--- 4. Registering Second User ---"
REGISTER_RESPONSE_2=$(curl -s -X POST $URL/user/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser2", "password": "password123", "name": "Test User 2"}')
echo "Response: $REGISTER_RESPONSE_2"
echo ""

echo "--- 5. Creating Chat ---"
# Creating a chat between testuser (current token) and testuser2
CREATE_CHAT_RESPONSE=$(curl -s -X POST $URL/chats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"users": ["testuser2"]}')
echo "Response: $CREATE_CHAT_RESPONSE"

CHAT_ID=$(echo $CREATE_CHAT_RESPONSE | jq -r '.id')
echo "Chat ID: $CHAT_ID"
echo ""

if [ "$CHAT_ID" == "null" ] || [ -z "$CHAT_ID" ]; then
  echo "Error: Failed to create chat."
  exit 1
fi

echo "--- 6. Sending Message ---"
SEND_MSG_RESPONSE=$(curl -s -X POST $URL/chats/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"chatId\": \"$CHAT_ID\", \"message\": \"Hello from curl test!\"}")
echo "Response: $SEND_MSG_RESPONSE"
echo ""

echo "--- 6. Sending Message ---"
SEND_MSG_RESPONSE=$(curl -s -X POST $URL/chats/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"chatId\": \"$CHAT_ID\", \"message\": \"Hello from curl test!\"}")
echo "Response: $SEND_MSG_RESPONSE"
echo ""

echo "--- 7. Getting Messages ---"
GET_MSGS_RESPONSE=$(curl -s -X GET "$URL/chats/messages?chatId=$CHAT_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $GET_MSGS_RESPONSE"

