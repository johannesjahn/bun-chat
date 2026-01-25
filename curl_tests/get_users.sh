#!/bin/bash
# Gets all users protected by token
if [ -z "$1" ]; then
  echo "Usage: ./get_users.sh <token>"
  exit 1
fi

echo "Getting users..."
curl -X GET http://localhost:3000/user \
  -H "Authorization: Bearer $1"
echo -e "\n"
