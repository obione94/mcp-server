import mcpClient from '../../infrastructure/mcpClient';

export async function fetchMcpTools() {
    try {
        const toolsRaw = await mcpClient.listTools();
        const mcpTools = (toolsRaw as any).tools?.map((tool: any) => {
            return {
                function: {
                    name: tool.name,
                    description: tool.description,
                    arguments: JSON.stringify(tool.inputSchema),
                }
            }
        });
        console.log(`✅ mcpTools : ${mcpTools.length} `,mcpTools);
        return mcpTools;
    } catch (e) {
        console.error('❌ MCP tools fetch failed:', e);
        return [];
    }
}

export async function runWithTools(ollamaMessage:any[]) {
    console.log(`messages : `,JSON.stringify(ollamaMessage, null, 2));
    const message = [];

    for (const toolCall of ollamaMessage) {
        const toolName = toolCall.function.name;
        console.log(`📞 Appel MCP: ${toolName}(${JSON.stringify(toolCall.function.arguments)})`);
        try {
            const result = await mcpClient.callTool({name:toolName, arguments:toolCall.function.arguments});
            const mcpResult:string = (result as any)?.content?.[0]?.text || JSON.stringify(result);
            console.log(`🔧  mcpClient.callTool : `, mcpResult);
            message.push({
                role: "tool",
                tool_call_id: toolCall.id,  // 🔥 AJOUTE ÇA !
                name:toolName,
                content: String(mcpResult) // reponse tool
            });
        } catch (e) {
            console.error(`❌ Tool ${toolName} failed:`, e);
            message.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: `Erreur: ${e}`
            });
        }
    }

    message.unshift({
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
    });

    return message;
}


