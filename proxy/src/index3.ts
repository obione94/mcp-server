import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';
import ollama from 'ollama';  // Fonctions globales ollama.chat/generate

const app = express();
app.use(cors());
app.use(express.json());

const MCP_SERVER_URL = 'http://mcp-nodejs-server:3000/mcp';

// Client MCP vers mcp-nodejs-server (vos tools)
const mcpClientTransport = new StreamableHTTPClientTransport(new URL(MCP_SERVER_URL));
const mcpClient = new Client({ name: 'proxy-client', version: '1.0' });
mcpClient.connect(mcpClientTransport);

// Serveur proxy MCP
const proxyMcp = new McpServer({ name: 'ollama-mcp-proxy', version: '1.0' });

// Tool 1: Chat Ollama (FIX: ollama.chat() globale + Docker auto)
proxyMcp.registerTool('ollama_chat', {
  title: 'Chat avec Ollama',
  inputSchema: z.object({
    prompt: z.string(),
    model: z.string().default('llama3.2')
  })
}, async ({ prompt, model }) => {
  //const { prompt, model } = args as { prompt: string; model: string };
  const res = await ollama.chat({  // Globale, détecte ollama:11434
    model,
    messages: [{ role: 'user', content: prompt }]
  });
  return {
    content: [{ type: 'text', text: res.message.content ?? '' }]
  };
});

// Tool 2: Forward vers MCP original (FIX callTool)
proxyMcp.registerTool('call_original_mcp', {
  title: 'Appel tool MCP original (greet, etc.)',
  inputSchema: z.object({
    toolName: z.string(),
    toolArgs: z.record(z.any()).optional()
  })
}, async ({ toolName, toolArgs = {} }) => {
  //const { toolName, toolArgs = {} } = args as { toolName: string; toolArgs?: Record<string, any> };
  try {
    const toolResult = await mcpClient.callTool({ 
      name: toolName, 
      arguments: toolArgs 
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(toolResult) }]
    };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Erreur: ${error.message}` }] };
  }
});

// Endpoint MCP proxy (inspector)
app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
  res.on('close', () => transport.close());
  await proxyMcp.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Endpoint chat (Ollama + auto MCP tools)
app.post('/chat', async (req, res) => {
  const { messages, stream = false } = req.body;
  try {
    const response = await ollama.chat({
      model: 'llama3.2',
      stream,
      messages,
      tools: [{  // Auto-calling vers proxy tools
        type: 'function',
        function: {
          name: 'call_original_mcp',
          description: 'Vos tools MCP (greet, PostgreSQL)',
          parameters: {
            type: 'object',
            properties: {
              toolName: { type: 'string' },
              toolArgs: { type: 'object' }
            },
            required: ['toolName']
          }
        }
      }]
    });
    res.json(stream ? response : response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Proxy MCP+Ollama: http://localhost:3001'));
