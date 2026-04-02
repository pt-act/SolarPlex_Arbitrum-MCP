import { z } from 'zod';

/**
 * RepuLayer reputation source weights for composite score calculation.
 * 
 * The composite score is calculated as:
 * compositeScore = (creddao × 0.4) + (trustlend × 0.3) + (repugate × 0.3)
 * 
 * Weight rationale:
 * - CredDAO (0.4): Governance participation is the primary reputation signal
 * - TrustLend (0.3): Credit history shows financial responsibility
 * - RepuGate (0.3): Launch participation shows ecosystem engagement
 */
export const REPUTATION_WEIGHTS = {
  creddao: 0.4,
  trustlend: 0.3,
  repugate: 0.3,
} as const;

/**
 * Calculates weighted composite reputation score from multiple sources.
 * 
 * @param scores - Object with scores from each source (0-100)
 * @returns Weighted composite score (0-100)
 * @throws Error if any score is not a finite number
 */
export function calculateCompositeScore(scores: {
  creddao?: number;
  trustlend?: number;
  repugate?: number;
}): number {
  let totalWeight = 0;
  let weightedSum = 0;
  
  if (scores.creddao !== undefined) {
    if (!Number.isFinite(scores.creddao)) {
      throw new Error(`Invalid creddao score: ${scores.creddao}`);
    }
    weightedSum += scores.creddao * REPUTATION_WEIGHTS.creddao;
    totalWeight += REPUTATION_WEIGHTS.creddao;
  }
  
  if (scores.trustlend !== undefined) {
    if (!Number.isFinite(scores.trustlend)) {
      throw new Error(`Invalid trustlend score: ${scores.trustlend}`);
    }
    weightedSum += scores.trustlend * REPUTATION_WEIGHTS.trustlend;
    totalWeight += REPUTATION_WEIGHTS.trustlend;
  }
  
  if (scores.repugate !== undefined) {
    if (!Number.isFinite(scores.repugate)) {
      throw new Error(`Invalid repugate score: ${scores.repugate}`);
    }
    weightedSum += scores.repugate * REPUTATION_WEIGHTS.repugate;
    totalWeight += REPUTATION_WEIGHTS.repugate;
  }
  
  if (totalWeight === 0) {
    return 0;
  }
  
  return Math.round(weightedSum / totalWeight);
}

export const REPUTATION_TOOLS = [
  {
    name: 'governance_get_cross_chain_reputation',
    description: 'Get unified reputation across Solana and Arbitrum via RepuLayer',
    inputSchema: z.object({
      solanaWallet: z.string().optional(),
      arbitrumWallet: z.string().optional(),
    }),
  },
  {
    name: 'governance_get_reputation_breakdown',
    description: 'Get detailed reputation breakdown from all RepuLayer sources',
    inputSchema: z.object({
      wallet: z.string(),
      chain: z.enum(['solana', 'arbitrum']),
    }),
  },
  {
    name: 'governance_compare_reputations',
    description: 'Compare reputation scores between two wallets',
    inputSchema: z.object({
      wallet1: z.string(),
      wallet2: z.string(),
      chain: z.enum(['solana', 'arbitrum', 'both']),
    }),
  },
  {
    name: 'governance_get_reputation_trend',
    description: 'Get reputation trend over time',
    inputSchema: z.object({
      wallet: z.string(),
      chain: z.enum(['solana', 'arbitrum']),
      days: z.number().default(30),
    }),
  },
];

/**
 * Handles reputation tool calls.
 * 
 * @param name - Tool name
 * @param args - Tool arguments
 * @returns MCP response with content array
 */
export async function handleReputationTool(name: string, args: any) {
  switch (name) {
    case 'governance_get_cross_chain_reputation':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            solanaWallet: args.solanaWallet,
            arbitrumWallet: args.arbitrumWallet,
            reputation: {
              solana: args.solanaWallet ? { fairscore: 0, tier: 'unscored', sources: ['creddao', 'trustlend', 'repugate'], note: 'Connect to RepuLayer to get real data' } : null,
              arbitrum: args.arbitrumWallet ? { fairscore: 0, tier: 'unscored', sources: ['erc8004'], note: 'Connect to Arbitrum RPC to get real data' } : null,
              combined: { score: 0, tier: 'unscored' },
            },
          }),
        }],
      };
    case 'governance_get_reputation_breakdown':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet: args.wallet,
            chain: args.chain,
            sources: {
              creddao: { fairscore: 0, note: 'Connect to CredDAO to get real data' },
              trustlend: { creditScore: 0, note: 'Connect to TrustLend to get real data' },
              repugate: { participationScore: 0, note: 'Connect to RepuGate to get real data' },
            },
            composite: { score: 0, tier: 'unscored', formula: '(creddao × 0.4) + (trustlend × 0.3) + (repugate × 0.3)' },
          }),
        }],
      };
    case 'governance_compare_reputations':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet1: { address: args.wallet1, fairscore: 0, tier: 'unscored' },
            wallet2: { address: args.wallet2, fairscore: 0, tier: 'unscored' },
            note: 'Connect to chain RPCs to get real comparison data',
          }),
        }],
      };
    case 'governance_get_reputation_trend':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet: args.wallet,
            chain: args.chain,
            period: `${args.days} days`,
            dataPoints: [],
            note: 'Connect to chain RPCs to get real trend data',
          }),
        }],
      };
    default:
      throw new Error(`Unknown reputation tool: ${name}`);
  }
}
