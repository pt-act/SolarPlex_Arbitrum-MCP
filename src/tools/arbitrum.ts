import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Config } from '../config/index.js';

export function registerArbitrumTools(server: Server, config: Config) {
  // List Arbitrum tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'arbitrum_register_agent',
        description: 'Register agent on Arbitrum ERC-8004 identity registry',
        inputSchema: z.object({
          name: z.string(),
          description: z.string(),
          skills: z.array(z.string()),
          endpoint: z.string().optional(),
        }),
      },
      {
        name: 'arbitrum_get_balance',
        description: 'Get Arbitrum ETH balance',
        inputSchema: z.object({
          address: z.string(),
        }),
      },
      {
        name: 'arbitrum_deploy_stylus',
        description: 'Deploy a Stylus (Rust) contract to Arbitrum',
        inputSchema: z.object({
          contractPath: z.string(),
          network: z.enum(['mainnet', 'sepolia']).default('sepolia'),
        }),
      },
      {
        name: 'arbitrum_deploy_solidity',
        description: 'Deploy a Solidity contract to Arbitrum',
        inputSchema: z.object({
          contractName: z.string(),
          constructorArgs: z.array(z.string()).optional(),
          network: z.enum(['mainnet', 'sepolia']).default('sepolia'),
        }),
      },
      {
        name: 'arbitrum_read_contract',
        description: 'Read from an Arbitrum contract',
        inputSchema: z.object({
          address: z.string(),
          abi: z.array(z.any()),
          functionName: z.string(),
          args: z.array(z.any()).optional(),
        }),
      },
      {
        name: 'arbitrum_write_contract',
        description: 'Write to an Arbitrum contract',
        inputSchema: z.object({
          address: z.string(),
          abi: z.array(z.any()),
          functionName: z.string(),
          args: z.array(z.any()).optional(),
        }),
      },
      {
        name: 'arbitrum_bridge_assets',
        description: 'Bridge assets to/from Arbitrum',
        inputSchema: z.object({
          fromChain: z.enum(['ethereum', 'arbitrum']),
          toChain: z.enum(['ethereum', 'arbitrum']),
          tokenAddress: z.string(),
          amount: z.string(),
        }),
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'arbitrum_register_agent':
        return await registerAgent(args as {
          name: string;
          description: string;
          skills: string[];
          endpoint?: string;
        });
      
      case 'arbitrum_get_balance':
        return await getArbitrumBalance(args as { address: string });
      
      case 'arbitrum_deploy_stylus':
        return await deployStylus(args as {
          contractPath: string;
          network: string;
        });
      
      case 'arbitrum_deploy_solidity':
        return await deploySolidity(args as {
          contractName: string;
          constructorArgs?: string[];
          network: string;
        });
      
      case 'arbitrum_read_contract':
        return await readContract(args as {
          address: string;
          abi: any[];
          functionName: string;
          args?: any[];
        });
      
      case 'arbitrum_write_contract':
        return await writeContract(args as {
          address: string;
          abi: any[];
          functionName: string;
          args?: any[];
        });
      
      case 'arbitrum_bridge_assets':
        return await bridgeAssets(args as {
          fromChain: string;
          toChain: string;
          tokenAddress: string;
          amount: string;
        });
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}

async function registerAgent(args: {
  name: string;
  description: string;
  skills: string[];
  endpoint?: string;
}) {
  // Will implement ERC-8004 registration
  return {
    content: [
      {
        type: 'text',
        text: `Registering agent "${args.name}" on Arbitrum ERC-8004 registry`,
      },
    ],
  };
}

async function getArbitrumBalance(args: { address: string }) {
  return {
    content: [
      {
        type: 'text',
        text: `Getting Arbitrum balance for ${args.address}`,
      },
    ],
  };
}

async function deployStylus(args: { contractPath: string; network: string }) {
  return {
    content: [
      {
        type: 'text',
        text: `Deploying Stylus contract from ${args.contractPath} to ${args.network}`,
      },
    ],
  };
}

async function deploySolidity(args: {
  contractName: string;
  constructorArgs?: string[];
  network: string;
}) {
  return {
    content: [
      {
        type: 'text',
        text: `Deploying Solidity contract ${args.contractName} to ${args.network}`,
      },
    ],
  };
}

async function readContract(args: {
  address: string;
  abi: any[];
  functionName: string;
  args?: any[];
}) {
  return {
    content: [
      {
        type: 'text',
        text: `Reading ${args.functionName} from contract ${args.address}`,
      },
    ],
  };
}

async function writeContract(args: {
  address: string;
  abi: any[];
  functionName: string;
  args?: any[];
}) {
  return {
    content: [
      {
        type: 'text',
        text: `Writing ${args.functionName} to contract ${args.address}`,
      },
    ],
  };
}

async function bridgeAssets(args: {
  fromChain: string;
  toChain: string;
  tokenAddress: string;
  amount: string;
}) {
  return {
    content: [
      {
        type: 'text',
        text: `Bridging ${args.amount} from ${args.fromChain} to ${args.toChain}`,
      },
    ],
  };
}
