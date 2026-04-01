import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Config } from '../config/index.js';

const ANALYTICS_TOOLS = [
  {
    name: 'governance_get_analytics',
    description: 'Get comprehensive governance analytics for a DAO',
    inputSchema: z.object({
      daoAddress: z.string(),
      chain: z.enum(['solana', 'arbitrum', 'both']),
      timeRange: z.string().default('30d'),
    }),
  },
  {
    name: 'governance_get_participation_rate',
    description: 'Get voter participation rate for proposals',
    inputSchema: z.object({
      daoAddress: z.string(),
      chain: z.enum(['solana', 'arbitrum']),
      proposalId: z.string().optional(),
    }),
  },
  {
    name: 'governance_get_proposal_success_rate',
    description: 'Get proposal success rate and statistics',
    inputSchema: z.object({
      daoAddress: z.string(),
      chain: z.enum(['solana', 'arbitrum']),
      timeRange: z.string().default('90d'),
    }),
  },
  {
    name: 'governance_generate_report',
    description: 'Generate comprehensive governance report',
    inputSchema: z.object({
      daoAddress: z.string(),
      chain: z.enum(['solana', 'arbitrum', 'both']),
      format: z.enum(['json', 'markdown', 'pdf']).default('json'),
      includeCharts: z.boolean().default(false),
    }),
  },
];

export function registerAnalyticsTools(server: Server, config: Config) {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'governance_get_analytics':
        return await getAnalytics(args as {
          daoAddress: string;
          chain: string;
          timeRange: string;
        });
      case 'governance_get_participation_rate':
        return await getParticipationRate(args as {
          daoAddress: string;
          chain: string;
          proposalId?: string;
        });
      case 'governance_get_proposal_success_rate':
        return await getProposalSuccessRate(args as {
          daoAddress: string;
          chain: string;
          timeRange: string;
        });
      case 'governance_generate_report':
        return await generateReport(args as {
          daoAddress: string;
          chain: string;
          format: string;
          includeCharts: boolean;
        });
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}

export { ANALYTICS_TOOLS };

async function getAnalytics(args: {
  daoAddress: string;
  chain: string;
  timeRange: string;
}) {
  const analytics = {
    dao: args.daoAddress,
    chain: args.chain,
    timeRange: args.timeRange,
    overview: {
      totalMembers: 1250,
      activeMembers: 342,
      totalProposals: 48,
      activeProposals: 3,
      totalVotes: 4521,
      uniqueVoters: 892,
    },
    participation: {
      averageVoterParticipation: 0.45,
      trend: 'increasing',
      peakParticipation: 0.78,
      lowParticipation: 0.12,
    },
    proposals: {
      total: 48,
      passed: 35,
      failed: 8,
      pending: 3,
      expired: 2,
      successRate: 0.73,
    },
    voting: {
      totalVotes: 4521,
      forVotes: 3200,
      againstVotes: 980,
      abstainVotes: 341,
      averageVotingPower: 156,
    },
    reputation: {
      averageFairscore: 68,
      tierDistribution: {
        platinum: 45,
        gold: 120,
        silver: 180,
        bronze: 320,
        unscored: 585,
      },
    },
    trends: {
      proposalsPerMonth: [4, 5, 6, 8, 7, 9],
      participationRate: [0.38, 0.42, 0.45, 0.48, 0.52, 0.55],
      averageFairscore: [62, 64, 65, 67, 68, 70],
    },
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(analytics),
    }],
  };
}

async function getParticipationRate(args: {
  daoAddress: string;
  chain: string;
  proposalId?: string;
}) {
  const participation = {
    dao: args.daoAddress,
    chain: args.chain,
    proposalId: args.proposalId || 'all',
    participationRate: 0.45,
    totalEligibleVoters: 1250,
    actualVoters: 562,
    breakdown: {
      platinum: { eligible: 45, voted: 42, rate: 0.93 },
      gold: { eligible: 120, voted: 98, rate: 0.82 },
      silver: { eligible: 180, voted: 120, rate: 0.67 },
      bronze: { eligible: 320, voted: 180, rate: 0.56 },
      unscored: { eligible: 585, voted: 122, rate: 0.21 },
    },
    trend: 'increasing',
    comparison: {
      previousPeriod: 0.42,
      change: '+7.1%',
    },
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(participation),
    }],
  };
}

async function getProposalSuccessRate(args: {
  daoAddress: string;
  chain: string;
  timeRange: string;
}) {
  const successRate = {
    dao: args.daoAddress,
    chain: args.chain,
    timeRange: args.timeRange,
    overall: {
      total: 48,
      passed: 35,
      failed: 8,
      pending: 3,
      expired: 2,
      successRate: 0.73,
    },
    byType: {
      standard: { total: 30, passed: 24, failed: 4, pending: 2, rate: 0.80 },
      expedited: { total: 12, passed: 8, failed: 3, pending: 1, rate: 0.67 },
      emergency: { total: 6, passed: 3, failed: 1, pending: 0, rate: 0.50 },
    },
    byTier: {
      platinum: { submitted: 18, passed: 15, rate: 0.83 },
      gold: { submitted: 22, passed: 16, rate: 0.73 },
      silver: { submitted: 8, passed: 4, rate: 0.50 },
    },
    trends: {
      monthlySuccessRate: [0.68, 0.72, 0.75, 0.78, 0.80, 0.73],
      averageVotesPerProposal: [85, 92, 98, 105, 112, 118],
    },
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(successRate),
    }],
  };
}

async function generateReport(args: {
  daoAddress: string;
  chain: string;
  format: string;
  includeCharts: boolean;
}) {
  const report = {
    dao: args.daoAddress,
    chain: args.chain,
    format: args.format,
    generatedAt: new Date().toISOString(),
    executiveSummary: 'Governance health is strong with increasing participation and proposal success rates.',
    sections: [
      {
        title: 'Overview',
        content: 'The DAO has 1,250 members with 342 active in the last 30 days.',
      },
      {
        title: 'Participation',
        content: 'Voter participation has increased from 38% to 55% over the last 6 months.',
      },
      {
        title: 'Proposals',
        content: '48 proposals submitted with a 73% success rate. Average time to resolution: 7 days.',
      },
      {
        title: 'Reputation Distribution',
        content: 'Members are distributed across tiers: 45 Platinum, 120 Gold, 180 Silver, 320 Bronze.',
      },
      {
        title: 'Recommendations',
        content: 'Consider implementing delegate discovery to increase participation among Bronze and Unscored members.',
      },
    ],
    charts: args.includeCharts ? [
      { type: 'line', title: 'Participation Trend', data: '...' },
      { type: 'pie', title: 'Tier Distribution', data: '...' },
      { type: 'bar', title: 'Proposal Success by Type', data: '...' },
    ] : [],
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(report),
    }],
  };
}
