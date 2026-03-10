Ce proxy :

envoie l’historique des messages à Ollama avec une définition de tools (greet, maisons_david) au format tools OpenAI‑like supporté par ollama.chat

si Ollama renvoie des tool_calls, il appelle ton serveur MCP via McpClient.callTool

il ajoute les réponses des tools dans l’historique, puis relance Ollama jusqu’à obtenir une réponse finale sans tool.