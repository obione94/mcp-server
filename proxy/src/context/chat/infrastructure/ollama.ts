import axios from 'axios'; 
import {fetchMcpTools} from '../application/services/tools';

export const ollamaResponseChat = async (messages:any, stream:boolean = false ) => {
    const mcpTools = await fetchMcpTools();
    return  await axios.post('http://ollama:11434/api/chat', {
        model: 'llama3.1:8b',//ollama compatible tools
        stream,
        messages: messages,
        tools: mcpTools, // 🔥 Tools MCP dynamiques
        options: {
            temperature: 0.1,     // Moins random
            top_p: 0.9,
            num_predict: 256      // Force génération
        }
    });
}


 
