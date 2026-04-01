import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Config } from '../config/index.js';

export function registerGovernanceTools(server: Server, config: Config) {
  // List governance tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
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
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'governance_get_reputation':
        return await getCrossChainReputation(args as {
          wallet: string;
          chains: string[];
        });
      
      case 'governance_get_tier':
        return await getGovernanceTier(args as {
          wallet: string;
          chain: string;
        });
      
      case 'governance_calculate_voting_power':
        return await calculateVotingPower(args as {
          tokenBalance: string;
          fairscore: number;
        });
      
      case 'governance_get_proposal_status':
        return await getProposalStatus(args as {
          proposalId: string;
          chain: string;
        });
      
      case 'governance_create_multichain_proposal':
        return await createMultiChainProposal(args as {
          title: string;
          description: string;
          proposalType: string;
          chains: string[];
        });
      
      case 'governance_get_delegation_efficiency':
        return await getDelegationEfficiency(args as {
          delegator: string;
          delegate: string;
        });
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}

async function getCrossChainReputation(args: {
  wallet: string;
  chains: string[];
}) {
  const formula = `votingPower = √(tokens) × (1 + fairscore/50)`;
  return {
    content: [
      {
        type: 'text',
        text: `Getting cross-chain reputation for ${args.wallet} on ${args.chains.join(', ')}`,
      },
    ],
  };
}

async function getGovernanceTier(args: { wallet: string; chain: string }) {
  const tiers = {
    platinum: { range: '85-100', timeLock: '24h' },
    gold: { range: '70-84', timeLock: '48h' },
    silver: { range: '50-69', timeLock: '72h' },
    bronze: { range: '30-49', timeLock: '168h' },
    unscored: { range: '0-29', timeLock: '336h' },
  };
  
  return {
    content: [
      {
        type: 'text',
        text: `Getting governance tier for ${args.wallet} on ${args.chain}`,
      },
    ],
  };
}

async function calculateVotingPower(args: {
  tokenBalance: string;
  fairscore: number;
}) {
  const tokens = parseFloat(args.tokenBalance);
  const quadraticBase = Math.sqrt(tokens);
  const reputationMultiplier = 1 + args.fairscore / 50;
  const votingPower = Math.floor(quadraticBase * reputationMultiplier);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          quadraticBase: quadraticBase.toFixed(2),
          reputationMultiplier: reputationMultiplier.toFixed(2),
          totalPower: votingPower,
          formula: `√${tokens} × (1 + ${args.fairscore}/50) = ${votingPower}`,
        }),
      },
    ],
  };
}

async function getProposalStatus(args: { proposalId: string; chain: string }) {
  return {
    content: [
      {
        type: 'text',
        text: `Getting proposal ${args.proposalId} status on ${args.chain}`,
      },
    ],
  };
}

async function createMultiChainProposal(args: {
  title: string;
  description: string;
  proposalType: string;
  chains: string[];
}) {
  return {
    content: [
      {
        type: 'text',
        text: `Creating multi-chain proposal: ${args.title} on ${args.chains.join(', ')}`,
      },
    ],
  };
}

async function getDelegationEfficiency(args: {
  delegator: string;
  delegate: string;
}) {
  const formula = `efficiency = delegateScore × participationRate × tierMultiplier / 10000`;
  return {
    content: [
      {
        type: 'text',
        text: `Calculating delegation efficiency from ${args.delegator} to ${args.delegate}`,
      },
    ],
  };
}
