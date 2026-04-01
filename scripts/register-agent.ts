import { createWalletClient, http, parseEther, encodeAbiParameters, toHex, stringToHex } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// ERC-8004 Identity Registry ABI (correct function signature)
const ERC8004_ABI = [
  {
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
  }
];

const registryAddress = '0x8004A818BFB912233c491871b3d84c89A494BD9e';

async function registerAgent() {
  // WARNING: Replace with your actual private key
  // NEVER commit this to version control
  let privateKey = process.env.AGENT_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('Error: AGENT_PRIVATE_KEY environment variable not set');
    console.error('Please set it with: export AGENT_PRIVATE_KEY=YOUR_PRIVATE_KEY');
    process.exit(1);
  }

  // Add 0x prefix if missing
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  const client = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });

  console.log('Registering SolarPlex agent...');
  console.log('Wallet:', account.address);
  console.log('Registry:', registryAddress);
  console.log('Network: Arbitrum Sepolia');

  // Create the metadata JSON and encode as base64
  const metadata = {
    name: 'SolarPlex',
    description: 'Solana governance infrastructure - Anchor smart contracts, FairScore integration, DAO architecture, security audits',
    image: ''
  };
  const metadataBase64 = Buffer.from(JSON.stringify(metadata)).toString('base64');
  const metadataParam = `data:application/json;base64,${metadataBase64}`;

  // Create the attributes as tuples
  const attributes = [
    { key: 'skills', value: stringToHex('code,solana,anchor,rust,smart-contracts,dao,governance,security') },
    { key: 'endpoint', value: stringToHex('https://solar-plex.netlify.app') },
    { key: 'priceWei', value: toHex(parseEther('0.001'), { size: 32 }) }
  ];

  try {
    const tx = await client.writeContract({
      address: registryAddress,
      abi: ERC8004_ABI,
      functionName: 'register',
      args: [metadataParam, attributes],
      value: 0n,
    });

    console.log('Transaction sent:', tx);
    console.log('Agent registered successfully!');
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

registerAgent();
