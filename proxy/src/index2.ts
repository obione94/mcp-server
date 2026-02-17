import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';


const app = express();
const PORT = 3001;
const API_KEY = process.env.API_KEY || 'dev';
const OLLAMA_URL = 'http://ollama:11434';

app.use(cors({ origin: '*', exposedHeaders: ['Mcp-Session-Id'] }));
app.use(express.json());

app.get('/health', async (_req: Request, res: Response) => {
  try {
    const ollamaPing = await fetch(`${OLLAMA_URL}/api/tags`);
    const ollamaData = await ollamaPing.json();
    res.json({ 
      status: 'ok', 
      ollama: ollamaData.models?.length || 0 + ' models',
      timestamp: new Date().toISOString() 
    });
  } catch {
    res.status(503).json({ status: 'ollama down' });
  }
});

app.post('/chat', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  const { messages } = req.body as { messages: any[] };
  
  try {
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: messages || [{ role: 'user', content: 'Hello' }],
        stream: false
      })
    });

    const data = await ollamaRes.json();
    res.json({ 
      role: 'assistant', 
      content: data.message?.content || 'No response' 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy Ollama MCP listening on port ${PORT}`);
});
