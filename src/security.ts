import { createWalletClient, http, type Address, type Hex, type Chain, type Account, type Transport, type WalletClient, parseEther } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

// Security configuration
const SECURITY_CONFIG = {
  maxWritesPerMinute: 5,
  maxGasLimit: 5_000_000n,
  allowedNetworks: ['sepolia'] as const,
  requireConfirmation: true,
  logOperations: true,
} as const;

// Rate limiting state
const writeLog: { timestamp: number; action: string; network: string }[] = [];

function checkRateLimit(action: string, network: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 60_000;
  const recentWrites = writeLog.filter(w => now - w.timestamp < windowMs);

  if (recentWrites.length >= SECURITY_CONFIG.maxWritesPerMinute) {
    const oldestInWindow = recentWrites[0];
    const retryAfter = Math.ceil((oldestInWindow.timestamp + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  writeLog.push({ timestamp: now, action, network });
  return { allowed: true };
}

function validatePrivateKey(key: string): { valid: boolean; error?: string; account?: Account } {
  if (!key) return { valid: false, error: 'No private key configured' };

  const cleanKey = key.startsWith('0x') ? key : `0x${key}`;

  if (!/^0x[a-fA-F0-9]{64}$/.test(cleanKey)) {
    return { valid: false, error: 'Invalid private key format — must be 64 hex characters' };
  }

  try {
    const account = privateKeyToAccount(cleanKey as `0x${string}`);
    return { valid: true, account };
  } catch {
    return { valid: false, error: 'Failed to derive account from private key' };
  }
}

function getChain(network: string): Chain | null {
  if (network === 'sepolia') return arbitrumSepolia;
  if (network === 'mainnet') return arbitrum;
  return null;
}

function getRpcUrl(network: string): string {
  if (network === 'sepolia') {
    return process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
  }
  return process.env.ARBITRUM_RPC_URL || 'https://arbitrum.drpc.org';
}

export function createSecureWalletClient(network: string = 'sepolia'): { error: string | null; client: WalletClient<Transport, Chain, Account> | null; address?: string } {
  const chain = getChain(network);
  if (!chain) {
    throw new Error(`Unsupported network: ${network}. Allowed: ${SECURITY_CONFIG.allowedNetworks.join(', ')}`);
  }

  if (!SECURITY_CONFIG.allowedNetworks.includes(network as any)) {
    throw new Error(`Network ${network} is not in allowed list. Mainnet writes are disabled for safety.`);
  }

  const privateKey = process.env.AGENT_PRIVATE_KEY;
  const validation = validatePrivateKey(privateKey || '');

  if (!validation.valid) {
    return { error: validation.error ?? 'Unknown validation error', client: null };
  }

  const rpcUrl = getRpcUrl(network);

  const client = createWalletClient({
    account: validation.account!,
    chain,
    transport: http(rpcUrl),
  });

  return { error: null, client, address: validation.account!.address };
}

export function checkWritePermission(action: string, network: string): { allowed: boolean; error?: string; retryAfter?: number } {
  const rateLimit = checkRateLimit(action, network);
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      error: `Rate limit exceeded: max ${SECURITY_CONFIG.maxWritesPerMinute} writes per minute. Retry after ${rateLimit.retryAfter}s.`,
      retryAfter: rateLimit.retryAfter,
    };
  }

  return { allowed: true };
}

export function generateEphemeralKey() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return {
    privateKey,
    address: account.address,
    note: 'Ephemeral key — discard after session. Not persisted.',
  };
}

export function logOperation(action: string, network: string, txHash: string, address: string) {
  if (!SECURITY_CONFIG.logOperations) return;

  const entry = {
    timestamp: new Date().toISOString(),
    action,
    network,
    txHash,
    signer: address,
  };

  console.error(`[SECURITY_LOG] ${JSON.stringify(entry)}`);
}

export function getSecurityStatus() {
  const keyValidation = validatePrivateKey(process.env.AGENT_PRIVATE_KEY || '');
  const now = Date.now();
  const recentWrites = writeLog.filter(w => now - w.timestamp < 60_000).length;

  return {
    walletConfigured: keyValidation.valid,
    walletAddress: keyValidation.account?.address,
    allowedNetworks: SECURITY_CONFIG.allowedNetworks,
    rateLimit: {
      maxWritesPerMinute: SECURITY_CONFIG.maxWritesPerMinute,
      currentWindowWrites: recentWrites,
      remaining: Math.max(0, SECURITY_CONFIG.maxWritesPerMinute - recentWrites),
    },
    mainnetWrites: false,
    operationLogging: SECURITY_CONFIG.logOperations,
  };
}
