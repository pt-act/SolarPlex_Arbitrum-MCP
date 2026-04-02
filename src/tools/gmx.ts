import { z } from 'zod';

export const GMX_TOOLS = [
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

export async function handleGMXTool(name: string, args: any) {
  switch (name) {
    case 'gmx_get_prices':
      return await getGMXPrices(args.market);
    case 'gmx_get_positions':
      return await getGMXPositions(args.wallet);
    case 'gmx_open_position':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'open_position',
            params: args,
            status: 'ready_to_sign',
            note: 'Connect wallet to execute transaction on GMX',
          }),
        }],
      };
    case 'gmx_close_position':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'close_position',
            params: args,
            status: 'ready_to_sign',
            note: 'Connect wallet to execute transaction on GMX',
          }),
        }],
      };
    case 'gmx_get_markets':
      return await getGMXMarkets(args.type);
    case 'gmx_get_open_interest':
      return await getGMXOpenInterest(args.market);
    default:
      throw new Error(`Unknown GMX tool: ${name}`);
  }
}

async function getGMXPrices(market: string) {
  const GMX_ORACLE_URL = 'https://arbitrum-api.gmxinfra.io/signed_prices/latest';
  
  try {
    const response = await fetch(GMX_ORACLE_URL);
    const data = await response.json() as any;
    
    const marketPrices = data.signedPrices?.find(
      (p: any) => p.tokenSymbol === market
    );

    if (!marketPrices) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: `Market ${market} not found` }) }],
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify({ market, indexPrice: marketPrices.indexPrice, oraclePrice: marketPrices.oraclePrice, timestamp: marketPrices.timestamp }) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to fetch prices' }) }],
    };
  }
}

async function getGMXPositions(wallet: string) {
  const GMX_POSITIONS_URL = `https://arbitrum-api.gmxinfra.io/positions/${wallet}`;
  
  try {
    const response = await fetch(GMX_POSITIONS_URL);
    const data = await response.json() as any;

    return {
      content: [{ type: 'text', text: JSON.stringify({ wallet, positions: data.positions || [], totalPnl: data.totalPnl || 0 }) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to fetch positions' }) }],
    };
  }
}

async function getGMXMarkets(type: string) {
  const GMX_MARKETS_URL = 'https://arbitrum-api.gmxinfra.io/markets';
  
  try {
    const response = await fetch(GMX_MARKETS_URL);
    const data = await response.json() as any;

    return {
      content: [{ type: 'text', text: JSON.stringify({ type, markets: data.markets || [], count: data.markets?.length || 0 }) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to fetch markets' }) }],
    };
  }
}

async function getGMXOpenInterest(market: string) {
  const GMX_OI_URL = `https://arbitrum-api.gmxinfra.io/open_interest/${market}`;
  
  try {
    const response = await fetch(GMX_OI_URL);
    const data = await response.json() as any;

    return {
      content: [{ type: 'text', text: JSON.stringify({ market, longOpenInterest: data.longOpenInterest || 0, shortOpenInterest: data.shortOpenInterest || 0, totalOpenInterest: data.totalOpenInterest || 0 }) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to fetch open interest' }) }],
    };
  }
}
