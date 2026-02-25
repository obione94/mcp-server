import app from './app';
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = 3001;

app.listen(PORT, () => {
  console.log('Proxy MCP+Ollama ✅ http://localhost:3001')
});
