import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Config } from '../config/index.js';

const REPUTATION_TOOLS = [
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

export function registerReputationTools(server: Server, config: Config) {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'governance_get_cross_chain_reputation':
        return await getCrossChainReputation(args as {
          solanaWallet?: string;
          arbitrumWallet?: string;
        });
      case 'governance_get_reputation_breakdown':
        return await getReputationBreakdown(args as {
          wallet: string;
          chain: string;
        });
      case 'governance_compare_reputations':
        return await compareReputations(args as {
          wallet1: string;
          wallet2: string;
          chain: string;
        });
      case 'governance_get_reputation_trend':
        return await getReputationTrend(args as {
          wallet: string;
          chain: string;
          days: number;
        });
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}

export { REPUTATION_TOOLS };

async function getCrossChainReputation(args: {
  solanaWallet?: string;
  arbitrumWallet?: string;
}) {
  // RepuLayer aggregation across CredDAO, TrustLend, RepuGate
  const reputation: {
    solana: { fairscore: number | null; tier: string | null; sources: string[] } | null;
    arbitrum: { fairscore: number | null; tier: string | null; sources: string[] } | null;
    combined: { score: number | null; tier: string | null };
  } = {
    solana: null,
    arbitrum: null,
    combined: { score: null, tier: null },
  };

  if (args.solanaWallet) {
    reputation.solana = {
      fairscore: 78,
      tier: 'gold',
      sources: ['creddao', 'trustlend', 'repugate'],
    };
  }

  if (args.arbitrumWallet) {
    reputation.arbitrum = {
      fairscore: 65,
      tier: 'silver',
      sources: ['erc8004'],
    };
  }

  // Calculate combined score
  const scores = [
    reputation.solana?.fairscore,
    reputation.arbitrum?.fairscore,
  ].filter((s): s is number => s !== null);

  if (scores.length > 0) {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    reputation.combined = {
      score: avgScore,
      tier: getTierFromScore(avgScore),
    };
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(reputation),
    }],
  };
}

async function getReputationBreakdown(args: {
  wallet: string;
  chain: string;
}) {
  // RepuLayer breakdown across protocols
  const breakdown = {
    wallet: args.wallet,
    chain: args.chain,
    sources: {
      creddao: {
        fairscore: 78,
        activeDays: 120,
        transactionCount: 450,
        proposalsSubmitted: 5,
        proposalsVoted: 23,
        weight: 0.4,
      },
      trustlend: {
        creditScore: 85,
        repaymentRate: 0.98,
        loansActive: 2,
        weight: 0.3,
      },
      repugate: {
        participationScore: 72,
        allocationsHeld: 3,
        allocationsDumped: 0,
        weight: 0.3,
      },
    },
    composite: {
      score: 78,
      tier: 'gold',
      formula: '(creddao × 0.4) + (trustlend × 0.3) + (repugate × 0.3)',
    },
  };

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(breakdown),
    }],
  };
}

async function compareReputations(args: {
  wallet1: string;
  wallet2: string;
  chain: string;
}) {
  const comparison = {
    wallet1: {
      address: args.wallet1,
      fairscore: 78,
      tier: 'gold',
    },
    wallet2: {
      address: args.wallet2,
      fairscore: 65,
      tier: 'silver',
    },
    difference: {
      scoreDiff: 13,
      tierDiff: 'gold vs silver',
      recommendation: 'Wallet 1 has higher governance reputation',
    },
  };

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(comparison),
    }],
  };
}

async function getReputationTrend(args: {
  wallet: string;
  chain: string;
  days: number;
}) {
  // Simulated trend data
  const trend = {
    wallet: args.wallet,
    chain: args.chain,
    period: `${args.days} days`,
    dataPoints: [
      { date: '2026-03-01', score: 65 },
      { date: '2026-03-08', score: 68 },
      { date: '2026-03-15', score: 72 },
      { date: '2026-03-22', score: 75 },
      { date: '2026-03-29', score: 78 },
    ],
    trend: 'upward',
    change: '+13',
    averageGrowth: '+3.25/week',
  };

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(trend),
    }],
  };
}

function getTierFromScore(score: number): string {
  if (score >= 85) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  if (score >= 30) return 'bronze';
  return 'unscored';
}
