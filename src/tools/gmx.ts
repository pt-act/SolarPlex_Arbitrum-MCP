import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Config } from '../config/index.js';

const GMX_TOOLS = [
  {
    name: 'gmx_get_prices',
    description: 'Get current token prices from GMX oracle',
    inputSchema: z.object({
      market: z.string(),
    }),
  },
  {
    name: 'gmx_get_positions',
    description: 'Get open positions for a wallet on GMX',
    inputSchema: z.object({
      wallet: z.string(),
    }),
  },
  {
    name: 'gmx_open_position',
    description: 'Open a leveraged position on GMX V2',
    inputSchema: z.object({
      market: z.string(),
      collateral: z.string(),
      size: z.string(),
      isLong: z.boolean(),
      slippage: z.number().default(0.3),
    }),
  },
  {
    name: 'gmx_close_position',
    description: 'Close a position on GMX V2',
    inputSchema: z.object({
      market: z.string(),
      isLong: z.boolean(),
      percentage: z.number().default(100),
    }),
  },
  {
    name: 'gmx_get_markets',
    description: 'Get available markets on GMX V2',
    inputSchema: z.object({
      type: z.enum(['perps', 'spot']).default('perps'),
    }),
  },
  {
    name: 'gmx_get_open_interest',
    description: 'Get open interest for a market',
    inputSchema: z.object({
      market: z.string(),
    }),
  },
];

export function registerGMXTools(server: Server, config: Config) {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'gmx_get_prices':
        return await getGMXPrices(args as { market: string });
      case 'gmx_get_positions':
        return await getGMXPositions(args as { wallet: string });
      case 'gmx_open_position':
        return await openGMXPosition(args as {
          market: string;
          collateral: string;
          size: string;
          isLong: boolean;
          slippage: number;
        });
      case 'gmx_close_position':
        return await closeGMXPosition(args as {
          market: string;
          isLong: boolean;
          percentage: number;
        });
      case 'gmx_get_markets':
        return await getGMXMarkets(args as { type: string });
      case 'gmx_get_open_interest':
        return await getGMXOpenInterest(args as { market: string });
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}

export { GMX_TOOLS };

async function getGMXPrices(args: { market: string }) {
  const GMX_ORACLE_URL = 'https://arbitrum-api.gmxinfra.io/signed_prices/latest';
  
  try {
    const response = await fetch(GMX_ORACLE_URL);
    const data = await response.json() as any;
    
    const marketPrices = data.signedPrices?.find(
      (p: any) => p.tokenSymbol === args.market
    );

    if (!marketPrices) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: `Market ${args.market} not found` }) }],
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify({ market: args.market, indexPrice: marketPrices.indexPrice, oraclePrice: marketPrices.oraclePrice, timestamp: marketPrices.timestamp }) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to fetch prices' }) }],
    };
  }
}

async function getGMXPositions(args: { wallet: string }) {
  const GMX_POSITIONS_URL = `https://arbitrum-api.gmxinfra.io/positions/${args.wallet}`;
  
  try {
    const response = await fetch(GMX_POSITIONS_URL);
    const data = await response.json() as any;

    return {
      content: [{ type: 'text', text: JSON.stringify({ wallet: args.wallet, positions: data.positions || [], totalPnl: data.totalPnl || 0 }) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to fetch positions' }) }],
    };
  }
}

async function openGMXPosition(args: {
  market: string;
  collateral: string;
  size: string;
  isLong: boolean;
  slippage: number;
}) {
  const orderParams = {
    market: args.market,
    collateral: args.collateral,
    sizeDelta: args.size,
    isLong: args.isLong,
    slippage: args.slippage,
    orderType: 'market',
  };

  return {
    content: [{ type: 'text', text: JSON.stringify({ action: 'open_position', params: orderParams, status: 'ready_to_sign', note: 'Connect wallet to execute transaction' }) }],
  };
}

async function closeGMXPosition(args: {
  market: string;
  isLong: boolean;
  percentage: number;
}) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ action: 'close_position', params: { market: args.market, isLong: args.isLong, percentage: args.percentage }, status: 'ready_to_sign', note: 'Connect wallet to execute transaction' }) }],
  };
}

async function getGMXMarkets(args: { type: string }) {
  const GMX_MARKETS_URL = 'https://arbitrum-api.gmxinfra.io/markets';
  
  try {
    const response = await fetch(GMX_MARKETS_URL);
    const data = await response.json() as any;

    return {
      content: [{ type: 'text', text: JSON.stringify({ type: args.type, markets: data.markets || [], count: data.markets?.length || 0 }) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to fetch markets' }) }],
    };
  }
}

async function getGMXOpenInterest(args: { market: string }) {
  const GMX_OI_URL = `https://arbitrum-api.gmxinfra.io/open_interest/${args.market}`;
  
  try {
    const response = await fetch(GMX_OI_URL);
    const data = await response.json() as any;

    return {
      content: [{ type: 'text', text: JSON.stringify({ market: args.market, longOpenInterest: data.longOpenInterest || 0, shortOpenInterest: data.shortOpenInterest || 0, totalOpenInterest: data.totalOpenInterest || 0 }) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to fetch open interest' }) }],
    };
  }
}
