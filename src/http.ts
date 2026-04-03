import { createServer } from 'http';
import { z } from 'zod';
import { loadConfig } from './config/index.js';

// Import all tools
import { SOLANA_TOOLS, handleSolanaTool } from './tools/solana.js';
import { ARBITRUM_TOOLS, handleArbitrumTool } from './tools/arbitrum.js';
import { GOVERNANCE_TOOLS, handleGovernanceTool } from './tools/governance.js';
import { GMX_TOOLS, handleGMXTool } from './tools/gmx.js';
import { REPUTATION_TOOLS, handleReputationTool } from './tools/reputation.js';
import { DELEGATE_TOOLS, handleDelegateTool } from './tools/delegate.js';
import { ANALYTICS_TOOLS, handleAnalyticsTool } from './tools/analytics.js';

const ALL_TOOLS = [
  ...SOLANA_TOOLS,
  ...ARBITRUM_TOOLS,
  ...GOVERNANCE_TOOLS,
  ...GMX_TOOLS,
  ...REPUTATION_TOOLS,
  ...DELEGATE_TOOLS,
  ...ANALYTICS_TOOLS,
];

const TOOL_HANDLERS: Record<string, (name: string, args: any) => Promise<any>> = {};
for (const tool of SOLANA_TOOLS) TOOL_HANDLERS[tool.name] = handleSolanaTool;
for (const tool of ARBITRUM_TOOLS) TOOL_HANDLERS[tool.name] = handleArbitrumTool;
for (const tool of GOVERNANCE_TOOLS) TOOL_HANDLERS[tool.name] = handleGovernanceTool;
for (const tool of GMX_TOOLS) TOOL_HANDLERS[tool.name] = handleGMXTool;
for (const tool of REPUTATION_TOOLS) TOOL_HANDLERS[tool.name] = handleReputationTool;
for (const tool of DELEGATE_TOOLS) TOOL_HANDLERS[tool.name] = handleDelegateTool;
for (const tool of ANALYTICS_TOOLS) TOOL_HANDLERS[tool.name] = handleAnalyticsTool;

const config = loadConfig();
const PORT = parseInt(process.env.PORT || '3000');

function toJSON(obj: any): string {
  return JSON.stringify(obj, (_, v) => {
    if (v instanceof z.ZodType) return undefined;
    return v;
  });
}

const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  // GET / - Health check and agent info
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200);
    res.end(toJSON({
      name: 'SolarPlex Arbitrum MCP',
      version: '1.2.0',
      status: 'online',
      tools: ALL_TOOLS.length,
      chains: ['solana', 'arbitrum', 'polygon', 'bsc', 'ethereum', 'base'],
      endpoints: {
        tools: '/tools',
        invoke: '/invoke (POST)',
        chat: '/chat (POST)',
      },
    }));
    return;
  }

  // GET /tools - List all available tools
  if (req.method === 'GET' && url.pathname === '/tools') {
    res.writeHead(200);
    res.end(toJSON({
      tools: ALL_TOOLS.map(t => ({
        name: t.name,
        description: t.description,
      })),
      total: ALL_TOOLS.length,
    }));
    return;
  }

  // POST /invoke - Call a tool directly
  if (req.method === 'POST' && url.pathname === '/invoke') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { tool, arguments: args } = JSON.parse(body);
        const handler = TOOL_HANDLERS[tool];
        if (!handler) {
          res.writeHead(404);
          res.end(toJSON({ error: `Unknown tool: ${tool}` }));
          return;
        }
        const result = await handler(tool, args || {});
        res.writeHead(200);
        res.end(toJSON(result));
      } catch (e: any) {
        res.writeHead(400);
        res.end(toJSON({ error: e.message }));
      }
    });
    return;
  }

  // POST /chat - Natural language interface
  if (req.method === 'POST' && url.pathname === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        const msg = message.toLowerCase();

        // Route to appropriate tool based on message
        let toolName = '';
        let args: any = {};

        if (msg.includes('balance') && (msg.includes('arbitrum') || msg.includes('eth'))) {
          toolName = 'arbitrum_get_balance';
          args = { address: message.match(/0x[a-fA-F0-9]{40}/)?.[0] || '0xE0DAD8AD88A1139323C90f0F3c6b2612Be9E1815' };
        } else if (msg.includes('gmx') && msg.includes('price')) {
          toolName = 'gmx_get_prices';
          args = { market: msg.match(/\b(eth|btc|sol|arb)\b/i)?.[0]?.toUpperCase() || 'ETH' };
        } else if (msg.includes('gmx') && msg.includes('market')) {
          toolName = 'gmx_get_markets';
          args = { type: 'perps' };
        } else if (msg.includes('tier') || msg.includes('reputation')) {
          toolName = 'governance_get_tier';
          args = {
            wallet: message.match(/0x[a-fA-F0-9]{40}/)?.[0] || '0xE0DAD8AD88A1139323C90f0F3c6b2612Be9E1815',
            chain: 'arbitrum'
          };
        } else if (msg.includes('voting power') || msg.includes('vote')) {
          toolName = 'governance_calculate_voting_power';
          args = { tokenBalance: '10000', fairscore: 78 };
        } else if (msg.includes('register') || msg.includes('agent')) {
          toolName = 'arbitrum_register_agent';
          args = { name: 'SolarPlex', description: 'Multi-chain governance agent', skills: ['code', 'solana', 'arbitrum', 'governance'] };
        } else {
          // Default: return available tools
          res.writeHead(200);
          res.end(toJSON({
            message: 'I can help with: balance, GMX prices, tiers, voting power, agent registration. Try: "What is my Arbitrum balance?" or "Show GMX ETH prices"',
            tools: ALL_TOOLS.map(t => t.name),
          }));
          return;
        }

        const handler = TOOL_HANDLERS[toolName];
        const result = await handler(toolName, args);
        res.writeHead(200);
        res.end(toJSON({ tool: toolName, result }));
      } catch (e: any) {
        res.writeHead(400);
        res.end(toJSON({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(toJSON({ error: 'Not found. Try GET / or GET /tools' }));
});

server.listen(PORT, () => {
  console.error(`SolarPlex MCP HTTP Server running on port ${PORT}`);
  console.error(`Tools: ${ALL_TOOLS.length} available`);
  console.error(`Endpoints: GET / | GET /tools | POST /invoke | POST /chat`);
});
