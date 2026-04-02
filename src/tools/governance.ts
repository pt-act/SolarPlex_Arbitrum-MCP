import { z } from 'zod';

/**
 * Governance tier definitions with time-lock periods.
 * Tiers are based on FairScore (0-100) and determine:
 * - Proposal creation privileges
 * - Time-lock duration before execution
 * - Voting power multipliers
 */
export const TIER_DEFINITIONS = {
  platinum: { range: '85-100', timeLock: '24h', minScore: 85 },
  gold: { range: '70-84', timeLock: '48h', minScore: 70 },
  silver: { range: '50-69', timeLock: '72h', minScore: 50 },
  bronze: { range: '30-49', timeLock: '168h', minScore: 30 },
  unscored: { range: '0-29', timeLock: '336h', minScore: 0 },
} as const;

/**
 * Maps a FairScore (0-100) to a governance tier.
 * 
 * Tier thresholds:
 * - Platinum: 85-100 (24h time-lock)
 * - Gold: 70-84 (48h time-lock)
 * - Silver: 50-69 (72h time-lock)
 * - Bronze: 30-49 (168h time-lock)
 * - Unscored: 0-29 (336h time-lock)
 * 
 * @param score - FairScore value (0-100)
 * @returns Tier name ('platinum' | 'gold' | 'silver' | 'bronze' | 'unscored')
 * @throws Error if score is not a finite number
 */
export function getTierFromScore(score: number): keyof typeof TIER_DEFINITIONS {
  if (!Number.isFinite(score)) {
    throw new Error(`Invalid score: ${score} must be a finite number`);
  }
  if (score >= 85) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  if (score >= 30) return 'bronze';
  return 'unscored';
}

/**
 * Calculates quadratic voting power with reputation multiplier.
 * 
 * Formula: votingPower = √(tokenBalance) × (1 + fairscore/50)
 * 
 * Design rationale:
 * - √(tokens): Quadratic scaling prevents whale dominance
 *   - 100 tokens → 10 power, 10000 tokens → 100 power (100x tokens = 10x power)
 * - (1 + fairscore/50): Reputation multiplier
 *   - fairscore=0 → 1.0x (no boost)
 *   - fairscore=50 → 2.0x (double power)
 *   - fairscore=100 → 3.0x (triple power)
 *   - The /50 divisor was chosen so that a median score (50) gives a 2x boost
 * 
 * @param tokenBalance - Token balance as string (to handle large numbers)
 * @param fairscore - FairScore value (0-100)
 * @returns Voting power as integer
 * @throws Error if tokenBalance is NaN or negative
 */
export function calculateVotingPower(tokenBalance: string, fairscore: number): number {
  const tokens = parseFloat(tokenBalance);
  
  // Guard against NaN and invalid inputs
  if (isNaN(tokens)) {
    throw new Error(`Invalid tokenBalance: "${tokenBalance}" is not a number`);
  }
  if (tokens < 0) {
    throw new Error(`Invalid tokenBalance: ${tokens} cannot be negative`);
  }
  if (!Number.isFinite(fairscore) || fairscore < 0 || fairscore > 100) {
    throw new Error(`Invalid fairscore: ${fairscore} must be 0-100`);
  }
  
  const quadraticBase = Math.sqrt(tokens);
  const reputationMultiplier = 1 + fairscore / 50;
  return Math.floor(quadraticBase * reputationMultiplier);
}

export const GOVERNANCE_TOOLS = [
  {
    name: 'governance_get_reputation',
    description: 'Get cross-chain reputation score',
    inputSchema: z.object({
      wallet: z.string(),
      chains: z.array(z.enum(['solana', 'arbitrum'])),
    }),
  },
  {
    name: 'governance_get_tier',
    description: 'Get governance tier across chains',
    inputSchema: z.object({
      wallet: z.string(),
      chain: z.enum(['solana', 'arbitrum']),
    }),
  },
  {
    name: 'governance_calculate_voting_power',
    description: 'Calculate quadratic voting power',
    inputSchema: z.object({
      tokenBalance: z.string(),
      fairscore: z.number(),
    }),
  },
  {
    name: 'governance_get_proposal_status',
    description: 'Get proposal status across chains',
    inputSchema: z.object({
      proposalId: z.string(),
      chain: z.enum(['solana', 'arbitrum']),
    }),
  },
  {
    name: 'governance_create_multichain_proposal',
    description: 'Create proposals on both Solana and Arbitrum',
    inputSchema: z.object({
      title: z.string(),
      description: z.string(),
      proposalType: z.enum(['standard', 'expedited', 'emergency']),
      chains: z.array(z.enum(['solana', 'arbitrum'])),
    }),
  },
  {
    name: 'governance_get_delegation_efficiency',
    description: 'Calculate delegation efficiency score',
    inputSchema: z.object({
      delegator: z.string(),
      delegate: z.string(),
    }),
  },
];

/**
 * Handles governance tool calls.
 * 
 * @param name - Tool name
 * @param args - Tool arguments
 * @returns MCP response with content array
 */
export async function handleGovernanceTool(name: string, args: any) {
  switch (name) {
    case 'governance_get_reputation':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet: args.wallet,
            chains: args.chains,
            reputation: args.chains.reduce((acc: any, chain: string) => {
              acc[chain] = { fairscore: 0, tier: 'unscored', note: 'Connect to chain RPC to get real data' };
              return acc;
            }, {}),
          }),
        }],
      };
    case 'governance_get_tier':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet: args.wallet,
            chain: args.chain,
            tier: 'unscored',
            tiers: TIER_DEFINITIONS,
            note: 'Connect to chain RPC to get real tier',
          }),
        }],
      };
    case 'governance_calculate_voting_power':
      try {
        const votingPower = calculateVotingPower(args.tokenBalance, args.fairscore);
        const tokens = parseFloat(args.tokenBalance);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              tokenBalance: args.tokenBalance,
              fairscore: args.fairscore,
              quadraticBase: Math.sqrt(tokens).toFixed(2),
              reputationMultiplier: (1 + args.fairscore / 50).toFixed(2),
              totalPower: votingPower,
              formula: `√${tokens} × (1 + ${args.fairscore}/50) = ${votingPower}`,
            }),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: (error as Error).message }),
          }],
        };
      }
    case 'governance_get_proposal_status':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            proposalId: args.proposalId,
            chain: args.chain,
            status: 'unknown',
            note: 'Connect to chain RPC to get real proposal status',
          }),
        }],
      };
    case 'governance_create_multichain_proposal':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'create_multichain_proposal',
            params: args,
            status: 'ready_to_sign',
            note: 'Connect wallet to execute transaction',
          }),
        }],
      };
    case 'governance_get_delegation_efficiency':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            delegator: args.delegator,
            delegate: args.delegate,
            efficiency: 0,
            formula: 'efficiency = delegateScore × participationRate × tierMultiplier / 10000',
            note: 'Connect to chain RPC to get real delegation data',
          }),
        }],
      };
    default:
      throw new Error(`Unknown governance tool: ${name}`);
  }
}
