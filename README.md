# 🟢 MCP Inspector
The MCP inspector is a developer tool for testing and debugging MCP servers. http://localhost:6274

![MCP Inspector Screenshot](https://raw.githubusercontent.com/modelcontextprotocol/inspector/main/mcp-inspector.png)
This repository contains Docker configuration for running the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), a developer tool for testing and debugging MCP servers.

# 🟢 MCP Server
The MCP server is a server tool for our IA.

![MCP Server in Node.js banner](https://github.com/user-attachments/assets/6608286c-0dd2-4f15-a797-ed63d902a38a)

# 🟢 MCP Server Proxy
The MCP server Proxy communicate between front end server mcp and Ia agent, a partir des request client .

![MCP Server in Node.js banner](https://github.com/user-attachments/assets/6608286c-0dd2-4f15-a797-ed63d902a38a)

# 🟢 Front End 
The Front end is a human interface with chat box you send a request to server proxy.

![MCP Server in Node.js banner](https://github.com/user-attachments/assets/6608286c-0dd2-4f15-a797-ed63d902a38a)

# 🟢 AI in local 
The locale AI .

![MCP Server in Node.js banner](https://github.com/user-attachments/assets/6608286c-0dd2-4f15-a797-ed63d902a38a)


### Build and run in just 5 minutes ⏱️

## Installation

### Cloning the Repository and build dependency Init projet

```bash
git clone [mon-repo-git]
cd [mon-rep-repo-git]
cp .env.dist .env # configure port
make build-dependancies # install dependencies show makeFile
```

## After Init projet you can build IA whith with your configuration

### For Nvidia GPU setups:
```bash
docker compose --profile gpu-nvidia pull
docker compose create && docker compose --profile gpu-nvidia up
```

* ### For Mac / Apple Silicon users
```bash
docker compose pull
docker compose create && docker compose up
```
* ### For Non-GPU setups:
```bash
docker compose --profile cpu pull
docker compose create && docker compose --profile cpu up
```

Docker Compose - MCP + Ollama Stack
Documentation du fichier docker-compose.yml pour le développement d'un stack MCP (Model Context Protocol) avec Ollama.

Vue d'ensemble
Ce stack déploie :

Ollama (LLM local CPU/GPU) sur port 11434

MCP Inspector (UI debug) : 6274

Node.js MCP Server : 3000

MCP Proxy : 3001

Frontend : 3002

Réseau interne : services-net
Volumes persistants : Ollama models, node_modules



| Service        | Port hôte | Description  |
| -------------- | --------- | ------------ |
| Ollama         | 11434     | API LLM      |
| MCP Inspector  | 6274      | UI Client    |
| MCP Inspector  | 6277      | Proxy Server |
| Node.js Server | 3000      | MCP Backend  |
| MCP Proxy      | 3001      | Proxy MCP    |
| Frontend       | 3002      | App Dev      |


Profils GPU/CPU

| Profil     | Services              | GPU support          |
| ---------- | --------------------- | -------------------- |
| cpu        | ollama-cpu + pull     | CPU uniquement       |
| gpu-nvidia | ollama-gpu + pull     | NVIDIA CUDA          |
| gpu-amd    | ollama-gpu-amd + pull | AMD ROCm hub.docker​ |

Ports exposés

| Service        | Port hôte | Description  |
| -------------- | --------- | ------------ |
| Ollama         | 11434     | API LLM      |
| MCP Inspector  | 6274      | UI Client    |
| MCP Inspector  | 6277      | Proxy Server |
| Node.js Server | 3000      | MCP Backend  |
| MCP Proxy      | 3001      | Proxy MCP    |
| Frontend       | 3002      | App Dev      |

Services détaillés
🧠 Ollama (LLM Local)
Anchors :

x-ollama : Serveur principal (CPU/GPU)

x-init-ollama : Pull automatique llama3.1:8b

Fonctionnalités :

Healthcheck API /tags toutes les 5s

Volume persistant ollama_storage:/root/.ollama

OLLAMA_HOST=ollama:11434 pour communication interne

Restart automatique unless-stopped

Démarrage :

docker compose --profile cpu up -d ollama-pull-llama-cpu ollama-cpu
# Attendre ~5min pour pull du modèle
curl http://localhost:11434/api/tags


🔍 MCP Inspector
Build : ./mcpinspector/Dockerfile
Ports : 6274 (UI), 6277 (Proxy)
Volumes : Hot-reload server code
Config : DANGEROUSLY_OMIT_AUTH=true (dev only)

⚙️ MCP Node.js Server
Build : ./mcp-nodejs-server/
Port : 3000
Hot-reload : Nodemon + TypeScript
Volumes :

Projet complet monté

node_modules_mcp_server persistant

🌐 MCP Proxy
Build : ./proxy/
Port : 3001
Dépendances : mcp-nodejs-server
Hot-reload : Nodemon TS

🎨 Frontend (Dev)
Build : ./frontend/
Port : 3002 → 3000
Hot-reload : Vite/Webpack
Config : WATCHPACK_POLLING=true (Docker file watching)

Structure des dossiers

├── mcpinspector/     # MCP Inspector
├── mcp-nodejs-server/ # Backend MCP
├── proxy/           # Proxy MCP
├── frontend/        # Frontend
└── docker-compose.yml


Ce stack est optimisé pour développement local avec hot-reload partout et pull automatique des modèles Ollama !

