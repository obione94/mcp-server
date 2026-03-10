import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MCP_SERVER_URL = 'http://mcp-server:3000/mcp';

const mcpClientTransport = new StreamableHTTPClientTransport(new URL(MCP_SERVER_URL));
const mcpClient = new Client({ name: 'proxy-client', version: '1.0' });
mcpClient.connect(mcpClientTransport);  // Sync OK pour votre IDE

export default mcpClient;
