import { z } from 'zod';
import { createPublicClient, http, formatEther, type Address, type Hex, stringToHex, toHex, parseEther } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import { createSecureWalletClient, checkWritePermission, logOperation, generateEphemeralKey, getSecurityStatus } from '../security.js';

function getPublicClient(network: 'mainnet' | 'sepolia' = 'mainnet') {
  const chain = network === 'sepolia' ? arbitrumSepolia : arbitrum;
  const rpcUrl = network === 'sepolia'
    ? (process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc')
    : (process.env.ARBITRUM_RPC_URL || 'https://arbitrum.drpc.org');
  return createPublicClient({ chain, transport: http(rpcUrl) });
}

export const ARBITRUM_TOOLS = [
  {
    name: 'arbitrum_register_agent',
    description: 'Register agent on Arbitrum ERC-8004 identity registry (signed tx on Sepolia)',
    inputSchema: z.object({
      name: z.string(),
      description: z.string(),
      skills: z.array(z.string()),
      endpoint: z.string().optional(),
      dryRun: z.boolean().optional().default(false),
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
    description: 'Write to an Arbitrum contract (requires wallet signature)',
    inputSchema: z.object({
      address: z.string(),
      abi: z.array(z.any()),
      functionName: z.string(),
      args: z.array(z.any()).optional(),
      dryRun: z.boolean().optional().default(false),
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
  {
    name: 'arbitrum_security_status',
    description: 'Get wallet security status, rate limits, and configuration',
    inputSchema: z.object({}),
  },
  {
    name: 'arbitrum_generate_ephemeral_key',
    description: 'Generate a temporary key for session-based operations (not persisted)',
    inputSchema: z.object({}),
  },
];

export async function handleArbitrumTool(name: string, args: any) {
  switch (name) {
    case 'arbitrum_register_agent': {
      const registry = process.env.ARBITRUM_IDENTITY_REGISTRY || '0x8004A818BFB912233c491871b3d84c89A494BD9e';
      const network = 'sepolia';

      const { client, error: walletError, address } = createSecureWalletClient(network);

      if (walletError || !client) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              action: 'register_agent',
              name: args.name,
              description: args.description,
              skills: args.skills,
              endpoint: args.endpoint,
              registry,
              chain: `arbitrum-${network}`,
              status: 'wallet_error',
              error: walletError,
              note: 'Set AGENT_PRIVATE_KEY env var to enable on-chain registration',
            }),
          }],
        };
      }

      const rateCheck = checkWritePermission('register_agent', network);
      if (!rateCheck.allowed) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              action: 'register_agent',
              status: 'rate_limited',
              error: rateCheck.error,
              retryAfter: rateCheck.retryAfter,
            }),
          }],
        };
      }

      const metadata = {
        name: args.name || 'SolarPlex',
        description: args.description || 'Multi-chain governance agent',
        image: ''
      };
      const metadataParam = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;

      const attributes = [
        { key: 'skills', value: stringToHex((args.skills || []).join(',')) },
        { key: 'endpoint', value: stringToHex(args.endpoint || 'https://solar-plex.netlify.app') },
        { key: 'priceWei', value: toHex(parseEther('0.001'), { size: 32 }) }
      ];

      const ERC8004_ABI = [{
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'attributes', type: 'tuple[]', components: [
            { name: 'key', type: 'string' },
            { name: 'value', type: 'bytes' }
          ]}
        ],
        name: 'register',
        outputs: [{ name: 'id', type: 'uint256' }],
        stateMutability: 'payable',
        type: 'function'
      }];

      if (args.dryRun) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              action: 'register_agent',
              mode: 'dry_run',
              name: args.name,
              description: args.description,
              skills: args.skills,
              endpoint: args.endpoint,
              registry,
              chain: `arbitrum-${network}`,
              signer: address,
              callData: {
                abi: ERC8004_ABI,
                functionName: 'register',
                args: [metadataParam, attributes],
                value: '0',
              },
              note: 'Dry run — no transaction was sent. Remove dryRun: true to execute.',
            }),
          }],
        };
      }

      const tx = await client.writeContract({
        address: registry as Address,
        abi: ERC8004_ABI,
        functionName: 'register',
        args: [metadataParam, attributes],
        value: 0n,
      });

      logOperation('register_agent', network, tx, address!);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'register_agent',
            name: args.name,
            description: args.description,
            skills: args.skills,
            endpoint: args.endpoint,
            registry,
            chain: `arbitrum-${network}`,
            signer: address,
            status: 'confirmed',
            transactionHash: tx,
            explorerUrl: `https://sepolia.arbiscan.io/tx/${tx}`,
            note: 'Agent registered on ERC-8004 identity registry',
          }),
        }],
      };
    }
    case 'arbitrum_get_balance': {
      const publicClient = getPublicClient();
      const balance = await publicClient.getBalance({ address: args.address as Address });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            address: args.address,
            balance: `${formatEther(balance)} ETH`,
            wei: balance.toString(),
            chain: 'arbitrum',
            chainId: 42161,
          }),
        }],
      };
    }
    case 'arbitrum_deploy_stylus':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'deploy_stylus',
            contractPath: args.contractPath,
            network: args.network,
            command: `cargo stylus deploy --endpoint ${args.network === 'sepolia' ? 'https://sepolia-rollup.arbitrum.io/rpc' : 'https://arb1.arbitrum.io/rpc'} --private-key $PRIVATE_KEY`,
            prerequisites: ['cargo-stylus CLI', 'Rust toolchain', 'Private key in $PRIVATE_KEY'],
          }),
        }],
      };
    case 'arbitrum_deploy_solidity':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'deploy_solidity',
            contractName: args.contractName,
            constructorArgs: args.constructorArgs || [],
            network: args.network,
            command: `forge script script/Deploy.s.sol --rpc-url ${args.network === 'sepolia' ? 'https://sepolia-rollup.arbitrum.io/rpc' : 'https://arb1.arbitrum.io/rpc'} --broadcast --private-key $PRIVATE_KEY`,
            prerequisites: ['Foundry (forge)', 'Private key in $PRIVATE_KEY'],
          }),
        }],
      };
    case 'arbitrum_read_contract': {
      const publicClient = getPublicClient();
      const result = await publicClient.readContract({
        address: args.address as Address,
        abi: args.abi,
        functionName: args.functionName,
        args: args.args,
      });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            address: args.address,
            functionName: args.functionName,
            result: typeof result === 'bigint' ? result.toString() : result,
          }),
        }],
      };
    }
    case 'arbitrum_write_contract':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'write_contract',
            address: args.address,
            functionName: args.functionName,
            args: args.args || [],
            status: 'requires_wallet_signature',
            note: 'Write operations require a connected wallet. Use viem walletClient or scripts/ for signing.',
          }),
        }],
      };
    case 'arbitrum_bridge_assets':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            action: 'bridge_assets',
            fromChain: args.fromChain,
            toChain: args.toChain,
            tokenAddress: args.tokenAddress,
            amount: args.amount,
            bridgeUrl: 'https://bridge.arbitrum.io/',
            status: 'requires_wallet_signature',
          }),
        }],
      };
    case 'arbitrum_security_status':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(getSecurityStatus()),
        }],
      };
    case 'arbitrum_generate_ephemeral_key':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ...generateEphemeralKey(),
            warning: 'This key is NOT stored server-side. Use it for this session only.',
          }),
        }],
      };
    default:
      throw new Error(`Unknown Arbitrum tool: ${name}`);
  }
}
