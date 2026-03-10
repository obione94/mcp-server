FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
RUN npm install -g @modelcontextprotocol/inspector

# Expose ports for the client UI and MCP proxy server
#EXPOSE 5173 3000

# Set environment variables (can be overridden at runtime)
#ENV CLIENT_PORT=5173
#ENV SERVER_PORT=3000

# Command to run when container starts
# This will be overridden if a command is provided when running the container
ENTRYPOINT ["npx", "@modelcontextprotocol/inspector"]
CMD ["node", "build/index.js"]