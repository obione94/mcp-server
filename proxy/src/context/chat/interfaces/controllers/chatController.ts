import { Request, Response } from 'express';
import {ollamaResponseChat} from '../../infrastructure/ollama';
import {runWithTools} from '../../application/services/tools';

export const chat = async (req: Request, res: Response) => {
  const { messages, stream = false } = req.body;
  console.log('🗣️ messages :', messages);
  try {
    while (true) {
      const ollamaResponse = await ollamaResponseChat(messages, stream);
      console.log(`🗣️ ollamaResponse: `,JSON.stringify(ollamaResponse.data.message, null, 2));

      if (!ollamaResponse.data.message?.tool_calls?.length) {
        res.json(ollamaResponse.data.message);
        return;
      }
       
      console.log(`🔧 ${ollamaResponse.data.message.tool_calls.length} tool_calls détectés`);
      messages.push(ollamaResponse.data.message);

      const toolResults = await runWithTools(ollamaResponse.data.message.tool_calls);

      messages.push(...toolResults);
    }
  } catch (error) {
    console.error('💥 Proxy error:', error);
    res.status(500).json({ error: 'Proxy MCP+Ollama failed' });
  }
};