#!/bin/bash
# Registers a test user
echo "Registering user 'testuser'..."
curl -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123", "name": "Test User"}'
echo -e "\n"
