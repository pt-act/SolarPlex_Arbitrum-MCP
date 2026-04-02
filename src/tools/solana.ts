import { z } from 'zod';

export const SOLANA_TOOLS = [
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
];

export async function handleSolanaTool(name: string, args: any) {
  switch (name) {
    case 'solana_get_balance':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            address: args.address,
            balance: '0 SOL',
            lamports: 0,
            network: 'devnet',
          }),
        }],
      };
    case 'solana_get_governance_state':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet: args.wallet,
            fairscore: 0,
            tier: 'unscored',
            governanceProgram: 'CredDAO',
            network: 'devnet',
          }),
        }],
      };
    case 'solana_create_proposal':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'create_proposal',
            title: args.title,
            description: args.description,
            proposalType: args.proposalType,
            ipfsCid: args.ipfsCid,
            status: 'requires_wallet_signature',
            network: 'devnet',
          }),
        }],
      };
    case 'solana_cast_vote':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'cast_vote',
            proposalAddress: args.proposalAddress,
            vote: args.vote,
            status: 'requires_wallet_signature',
            network: 'devnet',
          }),
        }],
      };
    case 'solana_get_fairscore':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            wallet: args.wallet,
            fairscore: 0,
            tier: 'unscored',
            source: 'FairScore oracle',
          }),
        }],
      };
    case 'solana_delegate':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'delegate',
            delegate: args.delegate,
            status: 'requires_wallet_signature',
            network: 'devnet',
          }),
        }],
      };
    default:
      throw new Error(`Unknown Solana tool: ${name}`);
  }
}
