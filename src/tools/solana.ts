import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Config } from '../config/index.js';

export function registerSolanaTools(server: Server, config: Config) {
  // List Solana tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'solana_get_balance',
        description: 'Get Solana wallet balance',
        inputSchema: z.object({
          address: z.string(),
        }),
      },
      {
        name: 'solana_get_governance_state',
        description: 'Get CredDAO governance state for a wallet',
        inputSchema: z.object({
          wallet: z.string(),
        }),
      },
      {
        name: 'solana_create_proposal',
        description: 'Create a governance proposal on Solana',
        inputSchema: z.object({
          title: z.string(),
          description: z.string(),
          proposalType: z.enum(['standard', 'expedited', 'emergency']),
          ipfsCid: z.string().optional(),
        }),
      },
      {
        name: 'solana_cast_vote',
        description: 'Cast a vote on a Solana proposal',
        inputSchema: z.object({
          proposalAddress: z.string(),
          vote: z.enum(['for', 'against', 'abstain']),
        }),
      },
      {
        name: 'solana_get_fairscore',
        description: 'Get FairScore for a Solana wallet',
        inputSchema: z.object({
          wallet: z.string(),
        }),
      },
      {
        name: 'solana_delegate',
        description: 'Delegate voting power to another member',
        inputSchema: z.object({
          delegate: z.string(),
        }),
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'solana_get_balance':
        return await getSolanaBalance(args as { address: string });
      
      case 'solana_get_governance_state':
        return await getGovernanceState(args as { wallet: string });
      
      case 'solana_create_proposal':
        return await createProposal(args as {
          title: string;
          description: string;
          proposalType: string;
          ipfsCid?: string;
        });
      
      case 'solana_cast_vote':
        return await castVote(args as {
          proposalAddress: string;
          vote: string;
        });
      
      case 'solana_get_fairscore':
        return await getFairScore(args as { wallet: string });
      
      case 'solana_delegate':
        return await delegate(args as { delegate: string });
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}

async function getSolanaBalance(args: { address: string }) {
  // Implementation will connect to QuickNode RPC
  return {
    content: [
      {
        type: 'text',
        text: `Getting balance for ${args.address} via QuickNode RPC`,
      },
    ],
  };
}

async function getGovernanceState(args: { wallet: string }) {
  return {
    content: [
      {
        type: 'text',
        text: `Getting governance state for ${args.wallet}`,
      },
    ],
  };
}

async function createProposal(args: {
  title: string;
  description: string;
  proposalType: string;
  ipfsCid?: string;
}) {
  return {
    content: [
      {
        type: 'text',
        text: `Creating proposal: ${args.title} (${args.proposalType})`,
      },
    ],
  };
}

async function castVote(args: { proposalAddress: string; vote: string }) {
  return {
    content: [
      {
        type: 'text',
        text: `Casting ${args.vote} vote on proposal ${args.proposalAddress}`,
      },
    ],
  };
}

async function getFairScore(args: { wallet: string }) {
  return {
    content: [
      {
        type: 'text',
        text: `Getting FairScore for ${args.wallet}`,
      },
    ],
  };
}

async function delegate(args: { delegate: string }) {
  return {
    content: [
      {
        type: 'text',
        text: `Delegating to ${args.delegate}`,
      },
    ],
  };
}
