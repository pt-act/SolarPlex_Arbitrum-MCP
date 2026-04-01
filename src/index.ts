import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadConfig } from './config/index.js';
import { registerSolanaTools } from './tools/solana.js';
import { registerArbitrumTools } from './tools/arbitrum.js';
import { registerGovernanceTools } from './tools/governance.js';

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

// Register all tools
registerSolanaTools(server, config);
registerArbitrumTools(server, config);
registerGovernanceTools(server, config);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SolarPlex Arbitrum MCP Server running on stdio');
}

main().catch(console.error);
