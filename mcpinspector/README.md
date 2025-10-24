# MCP Inspector Docker

This repository contains Docker configuration for running the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), a developer tool for testing and debugging MCP servers.

## Usage

### Building and running with Docker

```bash
# Build the Docker image
docker build -t mcp-inspector -f docker/Dockerfile docker/

# Run the container
# Replace /path/to/your/mcp/server with the path to your MCP server code
docker run -p 5173:5173 -p 3000:3000 -v /path/to/your/mcp/server:/app/server mcp-inspector node /app/server/build/index.js
```

### Using Docker Compose

```bash
# Navigate to the docker directory
cd docker

# Edit docker-compose.yml to mount your MCP server code and set the correct command

# Build and run with Docker Compose
docker-compose up
```

## Configuration

You can customize the ports used by the MCP Inspector by setting environment variables:

```bash
# Using Docker
docker run -p 8080:8080 -p 9000:9000 -e CLIENT_PORT=8080 -e SERVER_PORT=9000 mcp-inspector

# Using Docker Compose
# Edit the environment section in docker-compose.yml
```

## Accessing the Inspector

Once the container is running, open your browser and navigate to:

```
http://localhost:5173
```

Or use the custom client port if you've changed it.