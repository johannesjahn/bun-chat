#!/bin/bash
# Logs in as the test user
echo "Logging in as 'testuser'..."
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
echo -e "\n"
