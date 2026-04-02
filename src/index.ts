import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config/index.js';

// Import all tools
import { SOLANA_TOOLS, handleSolanaTool } from './tools/solana.js';
import { ARBITRUM_TOOLS, handleArbitrumTool } from './tools/arbitrum.js';
import { GOVERNANCE_TOOLS, handleGovernanceTool } from './tools/governance.js';
import { GMX_TOOLS, handleGMXTool } from './tools/gmx.js';
import { REPUTATION_TOOLS, handleReputationTool } from './tools/reputation.js';
import { DELEGATE_TOOLS, handleDelegateTool } from './tools/delegate.js';
import { ANALYTICS_TOOLS, handleAnalyticsTool } from './tools/analytics.js';

// Combine all tools into a single array
const ALL_TOOLS = [
  ...SOLANA_TOOLS,
  ...ARBITRUM_TOOLS,
  ...GOVERNANCE_TOOLS,
  ...GMX_TOOLS,
  ...REPUTATION_TOOLS,
  ...DELEGATE_TOOLS,
  ...ANALYTICS_TOOLS,
];

// Create tool name to handler mapping
const TOOL_HANDLERS: Record<string, (name: string, args: any) => Promise<any>> = {};

// Map Solana tools
for (const tool of SOLANA_TOOLS) {
  TOOL_HANDLERS[tool.name] = handleSolanaTool;
}

// Map Arbitrum tools
for (const tool of ARBITRUM_TOOLS) {
  TOOL_HANDLERS[tool.name] = handleArbitrumTool;
}

// Map Governance tools
for (const tool of GOVERNANCE_TOOLS) {
  TOOL_HANDLERS[tool.name] = handleGovernanceTool;
}

// Map GMX tools
for (const tool of GMX_TOOLS) {
  TOOL_HANDLERS[tool.name] = handleGMXTool;
}

// Map Reputation tools
for (const tool of REPUTATION_TOOLS) {
  TOOL_HANDLERS[tool.name] = handleReputationTool;
}

// Map Delegate tools
for (const tool of DELEGATE_TOOLS) {
  TOOL_HANDLERS[tool.name] = handleDelegateTool;
}

// Map Analytics tools
for (const tool of ANALYTICS_TOOLS) {
  TOOL_HANDLERS[tool.name] = handleAnalyticsTool;
}

const config = loadConfig();

const server = new Server(
  {
    name: 'solarplex-arbitrum-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register SINGLE ListToolsRequestSchema handler with ALL tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: ALL_TOOLS,
}));

// Register SINGLE CallToolRequestSchema handler that routes to correct handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  
  return await handler(name, args);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`SolarPlex Arbitrum MCP Server running on stdio with ${ALL_TOOLS.length} tools`);
}

main().catch(console.error);
