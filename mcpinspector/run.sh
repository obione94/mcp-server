#!/bin/bash

# Build the Docker image
docker build -t mcp-inspector .

# Run the container
# If arguments are provided, they will be passed to the container
if [ $# -gt 0 ]; then
    docker run -p 5173:5173 -p 3000:3000 mcp-inspector "$@"
else
    echo "Usage: ./run.sh [command to run MCP server]"
    echo "Example: ./run.sh node /app/server/build/index.js"
    exit 1
fi