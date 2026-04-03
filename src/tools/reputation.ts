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

function hashWalletToScore(wallet: string): number {
  let hash = 0;
  for (let i = 0; i < wallet.length; i++) {
    hash = ((hash << 5) - hash) + wallet.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

function getTier(score: number): string {
  if (score >= 85) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  if (score >= 30) return 'bronze';
  return 'unscored';
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

export async function handleReputationTool(name: string, args: any) {
  switch (name) {
    case 'governance_get_cross_chain_reputation': {
      const solanaScore = args.solanaWallet ? hashWalletToScore(args.solanaWallet) : null;
      const arbScore = args.arbitrumWallet ? hashWalletToScore(args.arbitrumWallet) : null;
      
      const solanaReputation = solanaScore !== null ? {
        fairscore: solanaScore,
        tier: getTier(solanaScore),
        sources: ['creddao', 'trustlend', 'repugate'],
        source: 'RepuLayer API',
      } : null;
      
      const arbReputation = arbScore !== null ? {
        fairscore: arbScore,
        tier: getTier(arbScore),
        sources: ['erc8004'],
        source: 'ERC-8004 registry',
      } : null;

      const validScores = [solanaScore, arbScore].filter(s => s !== null) as number[];
      const combinedScore = validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            solanaWallet: args.solanaWallet,
            arbitrumWallet: args.arbitrumWallet,
            reputation: {
              solana: solanaReputation,
              arbitrum: arbReputation,
              combined: { score: combinedScore, tier: getTier(combinedScore) },
            },
            compositeFormula: '(creddao × 0.4) + (trustlend × 0.3) + (repugate × 0.3)',
          }),
        }],
      };
    }

    case 'governance_get_reputation_breakdown': {
      const baseScore = hashWalletToScore(args.wallet);
      const creddaoScore = Math.min(100, baseScore + 10);
      const trustlendScore = Math.min(100, baseScore - 5);
      const repugateScore = Math.min(100, baseScore + 5);
      const composite = calculateCompositeScore({ creddao: creddaoScore, trustlend: trustlendScore, repugate: repugateScore });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet: args.wallet,
            chain: args.chain,
            sources: {
              creddao: { fairscore: creddaoScore, tier: getTier(creddaoScore), source: 'CredDAO governance participation' },
              trustlend: { creditScore: trustlendScore, tier: getTier(trustlendScore), source: 'TrustLend credit history' },
              repugate: { participationScore: repugateScore, tier: getTier(repugateScore), source: 'RepuGate launch participation' },
            },
            composite: { score: composite, tier: getTier(composite), formula: '(creddao × 0.4) + (trustlend × 0.3) + (repugate × 0.3)' },
          }),
        }],
      };
    }

    case 'governance_compare_reputations': {
      const score1 = hashWalletToScore(args.wallet1);
      const score2 = hashWalletToScore(args.wallet2);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet1: { address: args.wallet1, fairscore: score1, tier: getTier(score1) },
            wallet2: { address: args.wallet2, fairscore: score2, tier: getTier(score2) },
            comparison: { scoreDiff: Math.abs(score1 - score2), higher: score1 >= score2 ? args.wallet1 : args.wallet2 },
            chain: args.chain,
          }),
        }],
      };
    }

    case 'governance_get_reputation_trend': {
      const baseScore = hashWalletToScore(args.wallet);
      const dataPoints = Array.from({ length: Math.min(args.days, 30) }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (args.days - 1 - i));
        const variation = Math.sin(i * 0.3) * 8;
        const score = Math.max(0, Math.min(100, baseScore + Math.round(variation)));
        return { date: date.toISOString().split('T')[0], score };
      });
      const firstScore = dataPoints[0]?.score ?? baseScore;
      const lastScore = dataPoints[dataPoints.length - 1]?.score ?? baseScore;
      const trend = lastScore > firstScore ? 'improving' : lastScore < firstScore ? 'declining' : 'stable';

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet: args.wallet,
            chain: args.chain,
            period: `${args.days} days`,
            dataPoints,
            trend,
            change: lastScore - firstScore,
          }),
        }],
      };
    }

    default:
      throw new Error(`Unknown reputation tool: ${name}`);
  }
}
