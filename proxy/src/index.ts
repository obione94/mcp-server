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
app.get('/health', (req, res) => res.json({ status: 'OK' }));

const MCP_SERVER_URL = 'http://mcp-nodejs-server:3000/mcp';

// Client MCP ✅
const mcpClientTransport = new StreamableHTTPClientTransport(new URL(MCP_SERVER_URL));
const mcpClient = new Client({ name: 'proxy-client', version: '1.0' });
mcpClient.connect(mcpClientTransport);  // Sync OK pour votre IDE

// 🔥 Cache des tools MCP (fetch au démarrage + refresh)
let mcpTools: string[];

async function fetchMcpTools() {
  try {
    const toolsRaw = await mcpClient.listTools();
    mcpTools = (toolsRaw as any).tools?.map((tool: any) => {
      const toto = {
        function: {
          name: tool.name,
          description: tool.description,
          arguments: JSON.stringify(tool.inputSchema),
        }
      }
      return toto;
    });
    console.log(`✅ mcpTools : ${mcpTools.length} `,mcpTools);
  } catch (e) {
    console.error('❌ MCP tools fetch failed:', e);
    mcpTools = [];
  }
}

// Chargement initial
fetchMcpTools();
// Refresh toutes les 30s (optionnel)
setInterval(fetchMcpTools, 10000);

app.post('/chat', async (req, res) => {
  res.json({ role: 'assistant', content: `✅ Bonjour` });
})

let msg:any[]= [];
app.post('/chatmoi', async (req, res) => {
  const { messages, stream = false } = req.body;
  console.log('🗣️ msg :', messages);
  try {
    // 1️⃣ Premier appel Ollama avec les TOOLS MCP
    const ollamaRes = await axios.post('http://ollama:11434/api/chat', {
      model: 'llama3.1:8b',//ollama compatible tools
      stream,
      messages: messages,
      tools: mcpTools, // 🔥 Tools MCP dynamiques
    });

    const ollamaMessage = ollamaRes.data.message;

    if (ollamaMessage.tool_calls?.length) {
      console.log(`🔧 ${ollamaMessage.tool_calls.length} tool_calls détectés`);

      // 2️⃣ Exécuter chaque tool_call via MCP client
      const toolResults: any[] = [];
      for (const toolCall of ollamaMessage.tool_calls) {
        const toolName = toolCall.function.name;
        console.log(`📞 Appel MCP: ${toolName}(${JSON.stringify(toolCall.function.arguments)})`);

        try {
          const result = await mcpClient.callTool({name:toolName, arguments:toolCall.function.arguments});
          const mcpResult:string = (result as any)?.content?.[0]?.text || JSON.stringify(result);
          console.log(`🔧  mcpClient.callTool : `, mcpResult);

          toolResults.push({
            role: "tool",
            tool_call_id: toolCall.id,  // 🔥 AJOUTE ÇA !
            name:toolName,
            content: String(mcpResult) // reponse tool
          });
        } catch (e) {
          console.error(`❌ Tool ${toolName} failed:`, e);
          toolResults.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Erreur: ${e}`
          });
        }
      }

      const finalMessages = [ {
        role: "system",
        content: `RÈGLES OBLIGATOIRES - PRIORITÉ ABSOLUE :
          1. Les RÉSULTATS DES TOOLS sont 100% FIABLES et OFFICIELS.
          2. Quand un tool retourne une réponse → COPIE-LA VERBATIM dans ta réponse finale.
          3. AUCUNE hallucination, excuse, ou "je ne sais pas". TOUJOURS utiliser tool result.
          4. Format réponse : "Selon [tool_name] : [tool_content exact]"

          EXEMPLES :
          Tool getEmployeeCount → "10 employés"
          → Réponse : "Selon getEmployeeCount : L'entreprise totorame a 10 employé(s)."
          NE JAMAIS : "Je n'ai pas accès", "Données non disponibles", invention.
          TOUJOURS : Résultat tool verbatim.`
      },...messages,...toolResults];
      console.log('🗣️ finalMessages :', finalMessages);
      console.log(JSON.stringify(finalMessages, null, 2));

      // 3️⃣ Deuxième appel Ollama avec les résultats des tools
      const finalOllamaRes = await axios.post('http://ollama:11434/api/chat', {
        model: 'llama3.1:8b',
        stream: false,
        messages: finalMessages,
        tools: mcpTools, // 🔥 Tools MCP dynamiques
        options: {
          temperature: 0.1,     // Moins random
          top_p: 0.9,
          num_predict: 256      // Force génération
        }
      });
      console.log('🗣️ finalOllamaRes:', finalOllamaRes.data.message);
      res.json(finalOllamaRes.data.message);
    } else {
      // Pas de tool_calls → réponse directe
      res.json(ollamaMessage);
    }
  } catch (error) {
    console.error('💥 Proxy error:', error);
    res.status(500).json({ error: 'Proxy MCP+Ollama failed' });
  }
});


app.listen(3001, () => console.log('Proxy MCP+Ollama ✅ http://localhost:3001'));
