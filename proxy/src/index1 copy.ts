import express from 'express';
import cors from 'cors';
import axios from 'axios';  // npm i axios → anti-fetch-failed
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';


const app = express();
app.use(cors());
app.use(express.json());

const MCP_SERVER_URL = 'http://mcp-nodejs-server:3000/mcp';

// Client MCP ✅
const mcpClientTransport = new StreamableHTTPClientTransport(new URL(MCP_SERVER_URL));
const mcpClient = new Client({ name: 'proxy-client', version: '1.0' });
mcpClient.connect(mcpClientTransport);  // Sync OK pour votre IDE

// Serveur proxy MCP ✅ (tools visibles inspector)
const proxyMcp = new McpServer({ name: 'ollama-mcp-proxy', version: '1.0' });

proxyMcp.registerTool('ollama_chat', {
  title: 'Chat avec Ollama',
  inputSchema: z.object({ prompt: z.string(), model: z.string().default('llama3.2') }),
}, async ({ prompt, model }) => {
  const res = await axios.post('http://ollama:11434/api/chat', {  // ✅ Axios direct
    model, messages: [{ role: 'user', content: prompt }], stream: false
  }, { timeout: 30000 });
  return { content: [{ type: 'text', text: res.data.message.content ?? '' }] };
});

proxyMcp.registerTool('call_mcp_tool', {  // Nom simple
  title: 'Call MCP Tool',
  inputSchema: z.object({
    toolName: z.string().describe('greet, query_db...'),
    toolArgs: z.record(z.any()).optional()
  })
}, async ({ toolName, toolArgs = {} }) => {
  try {
    const toolResult = await mcpClient.callTool({ name: toolName, arguments: toolArgs });
    return { content: [{ type: 'text', text: JSON.stringify(toolResult) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Erreur: ${error.message}` }] };
  }
});

// /mcp ✅ (inspector OK)
app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
  res.on('close', () => transport.close());
  await proxyMcp.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.post('/chat', async (req, res) => {
  let { messages } = req.body;
  console.log('START_______________________________________');

  console.log('Message:', messages[messages.length-1]?.content);
  
  try {
    //const systemPrompt = { role: 'system', content: `TOUJOURS utiliser "call_mcp_tool". "bonjour" → {"toolName": "greet"}` };
    const systemPrompt = { role: 'system', content: `` };
    if (messages[0]?.role !== 'system') messages = [systemPrompt, ...messages];

    const ollamaRes = await axios.post('http://ollama:11434/api/chat', {
      model: 'llama3.2', stream: false, messages,
      tools: [
        { 
          type: 'function',
          function: { 
            name: 'call_mcp_tool',
            strict: true,
            parameters: { 
              type: 'object',
              properties: { 
                toolName: { type: 'string', enum: ['greet'] }, 
                toolArgs: { type: 'object' } 
              },
              required: ['toolName'] 
            } 
          }
        }
      ]
    });

    let assistantMsg = ollamaRes.data.message;
    
    console.log('OllamaRes.data:', ollamaRes.data);

    if (assistantMsg.tool_calls?.length > 0) {
      console.log('Ollama tool_calls :', assistantMsg.tool_calls.length);
      console.log('##################');
      for (const toolCall of assistantMsg.tool_calls) {
        const args = toolCall.function.arguments;
        console.log('EXECUTE: toolCall.function.arguments ', args);
        
        const toolResult = await mcpClient.callTool({ 
          name: args.toolName, 
          arguments: args.toolName === 'greet' ? { name: args.toolArgs?.name || 'David' } : args.toolArgs 
        });
        
        const resultText = (toolResult.content as any[])[0]?.text || JSON.stringify(toolResult);
        res.json({ role: 'assistant', content: `✅ ${args.toolName}: ${resultText}` });
        return;
      }
      console.log('##################');

    } else {
        // Fallback DIRECT
        const toolResult = await mcpClient.callTool({ name: 'greet', arguments: { name: 'David' } });
        const resultText = (toolResult.content as any[])[0]?.text || 'OK';

        res.json({ role: 'assistant', content: `✅ Bonjour: ${resultText}` });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(3001, () => console.log('Proxy MCP+Ollama ✅ http://localhost:3001'));
