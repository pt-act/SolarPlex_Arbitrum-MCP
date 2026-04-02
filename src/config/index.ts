import { z } from 'zod';

export const ConfigSchema = z.object({
  solana: z.object({
    rpcUrl: z.string().url(),
    wsUrl: z.string().url().optional(),
    programId: z.string(),
    fairscoreProgramId: z.string(),
    network: z.enum(['mainnet', 'devnet']).default('devnet'),
  }),
  arbitrum: z.object({
    rpcUrl: z.string().url(),
    wsUrl: z.string().url().optional(),
    chainId: z.number().default(42161),
    sepoliaRpcUrl: z.string().url().optional(),
    identityRegistry: z.string().default('0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'),
    reputationRegistry: z.string().default('0x8004BAa17C55a88189AE136b182e5fdA19dE9b63'),
  }),
  quicknode: z.object({
    apiKey: z.string().optional().default(''),
    solanaEndpoint: z.string().url().optional().default('https://api.devnet.solana.com'),
    arbitrumEndpoint: z.string().url().optional().default('https://arbitrum.drpc.org'),
  }),
  agent: z.object({
    wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    name: z.string().default('SolarPlex'),
    skills: z.array(z.string()).default([
      'code',
      'solana',
      'anchor',
      'rust',
      'smart-contracts',
      'dao',
      'governance',
      'security',
    ]),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    solana: {
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      wsUrl: process.env.SOLANA_WS_URL,
      programId: process.env.SOLANA_PROGRAM_ID || 'CreDDAo111111111111111111111111111111111111',
      fairscoreProgramId: process.env.FAIRSCORE_PROGRAM_ID || 'Faire11111111111111111111111111111111111111',
      network: (process.env.SOLANA_NETWORK as 'mainnet' | 'devnet') || 'devnet',
    },
    arbitrum: {
      rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arbitrum.drpc.org',
      wsUrl: process.env.ARBITRUM_WS_URL,
      chainId: parseInt(process.env.ARBITRUM_CHAIN_ID || '42161'),
      sepoliaRpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL,
      identityRegistry: process.env.ARBITRUM_IDENTITY_REGISTRY || '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
      reputationRegistry: process.env.ARBITRUM_REPUTATION_REGISTRY || '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63',
    },
    quicknode: {
      apiKey: process.env.QUICKNODE_API_KEY || '',
      solanaEndpoint: process.env.QUICKNODE_SOLANA_ENDPOINT,
      arbitrumEndpoint: process.env.QUICKNODE_ARBITRUM_ENDPOINT,
    },
    agent: {
      wallet: process.env.AGENT_WALLET || '0xE0DAD8AD88A1139323C90f0F3c6b2612Be9E1815',
      name: process.env.AGENT_NAME || 'SolarPlex',
    },
  });
}
