import express from 'express';
import type { Request, Response } from 'express';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import { z } from "zod"
import cors from 'cors';


const getServer = () => {
    // Create an MCP server with implementation details
    const server = new McpServer(
        {
            name: 'stateless-streamable-http-server',
            version: '1.0.0'
        },
        { capabilities: { logging: {} } }
    );

    server.tool(
        'getEmployeeCountByCompanyName',
        "Récupère le nombre d'employés par nom société",
        { companyName: z.string().describe('Nom de la société') },
        async ({ companyName }): Promise<CallToolResult> => {
            // Mock: dans la vraie vie tu appellerais ta DB ou une API ici
            const fakeDb: Record<string, number> = {
                "google": 180000,
                "openAI": 1000,
                "greenflex": 6,
                "totorame": 10,                
                "tutu": 10,
            };

            const count = fakeDb[companyName.toLowerCase()] ?? 0;

            return {
                content: [
                    {
                        type: "text",
                        text: `${count} employé(s).`,
                    },
                ],
            };
        }
    );
    
    server.tool(
        'getResidenceCountByClientName',
        "Récupère le nombre de résidence par nom client",
        { clientName: z.string().describe("Nom du client") },
        async ({ clientName }): Promise<CallToolResult> => {
            // Mock: dans la vraie vie tu appellerais ta DB ou une API ici
            const fakeDb: Record<string, number> = {
                "toto": 180000,
                "titi": 1000,
                "tutu": 6,
            };

            const count = fakeDb[clientName.toLowerCase()] ?? 0;

            return {
                content: [
                    {
                        type: "text",
                        text: `${count} résidence(s).`,
                    },
                ],
            };
        }
    );
    return server;
};

const app = express();
app.use(express.json());

// Configure CORS to expose Mcp-Session-Id header for browser-based clients
app.use(
    cors({
        origin: '*', // Allow all origins - adjust as needed for production
        exposedHeaders: ['Mcp-Session-Id']
    })
);

app.post('/mcp', async (req: Request, res: Response) => {
    const server = getServer();
    try {
        const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined
        });
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        res.on('close', () => {
            console.log('Request closed');
            transport.close();
            server.close();
        });
    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error'
                },
                id: null
            });
        }
    }
});

app.get('/mcp', async (req: Request, res: Response) => {
    console.log('Received GET MCP request');
    res.writeHead(405).end(
        JSON.stringify({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Method not allowed.'
            },
            id: null
        })
    );
});

app.get('/healthcheck', async (req: Request, res: Response) => {
    console.log('healthcheck');
    res.status(202).json({
        status: 'accepted',
        message: 'born to be alivee',
    });
});

app.delete('/mcp', async (req: Request, res: Response) => {
    console.log('Received DELETE MCP request');
    res.writeHead(405).end(
        JSON.stringify({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Method not allowed.'
            },
            id: null
        })
    );
});

// Start the server
const PORT = 3000;
app.listen(PORT, error => {
    if (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
    console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    process.exit(0);
});