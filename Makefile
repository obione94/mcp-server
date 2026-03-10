# Variables
COMPOSE_FILE=docker-compose.yml
APP_NAME=mcp-nodejs-server

.PHONY: build-dependancies 

# Build server proxy mcp
build-proxy:
	cd mcp-proxy-server && npm install && npm run build
# Build server mcp
build-mcp-server:
	cd mcp-server && npm install && npm run build
# Build frontend
build-frontend:
	cd next-front-end && npm install && npm run build 
# Build all dependancies services after run
build-dependancies: build-mcp-server build-frontend build-proxy

# Arrêter les services
stop:
	docker-compose -f $(COMPOSE_FILE) down

# Nettoyer les images (optionnel)
clean:
	docker-compose -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans
