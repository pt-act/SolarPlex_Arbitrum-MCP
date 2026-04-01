# Arbitrum Deployment Guide

## Prerequisites

1. QuickNode account with Arbitrum endpoint
2. Docker (for Stylus development)
3. Foundry (for Solidity development)
4. Wallet with Arbitrum ETH for gas

## QuickNode Arbitrum Setup

### Step 1: Create Arbitrum Endpoint

1. Log into QuickNode dashboard
2. Click "Create Endpoint"
3. Select "Arbitrum" → "Arbitrum One" (or "Arbitrum Sepolia" for testnet)
4. Choose your plan
5. Note your endpoint URL

### Step 2: Configure Environment

```bash
# Set in .env
ARBITRUM_RPC_URL=https://your-arbitrum-endpoint.quiknode.pro/
QUICKNODE_ARBITRUM_ENDPOINT=https://your-arbitrum-endpoint.quiknode.pro/
```

## Stylus (Rust) Development

### Setup

```bash
# Install Rust (1.88+)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add wasm target
rustup target add wasm32-unknown-unknown

# Install cargo-stylus
cargo install --force cargo-stylus

# Create contract
cargo stylus new my-contract
cd my-contract
```

### Deploy to Arbitrum Sepolia

```bash
# Check contract
cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc

# Deploy
cargo stylus deploy \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc \
  --private-key $PRIVATE_KEY

# Export ABI
cargo stylus export-abi
```

## Solidity Development with Foundry

### Setup

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Initialize project
forge init my-contracts
cd my-contracts
```

### Deploy

```bash
# Build
forge build

# Test
forge test

# Deploy to Arbitrum Sepolia
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc \
  --broadcast \
  --private-key $PRIVATE_KEY
```

## Agent Registration (ERC-8004)

Register your agent on the Arbitrum identity registry:

```bash
# Using the MCP
arbitrum_register_agent \
  --name "SolarPlex" \
  --description "Solana governance infrastructure - Anchor smart contracts, FairScore integration, DAO architecture, security audits" \
  --skills "code,solana,anchor,rust,smart-contracts,dao,governance,security" \
  --endpoint "https://solar-plex.netlify.app"
```

## Getting Testnet ETH

### Arbitrum Sepolia

1. Go to https://arbitrum.faucet.dev/
2. Enter your wallet address
3. Claim ETH
4. Bridge from Ethereum Sepolia to Arbitrum Sepolia at https://bridge.arbitrum.io/

## Resources

- [Arbitrum Documentation](https://docs.arbitrum.io/)
- [Stylus SDK](https://github.com/OffchainLabs/stylus-sdk-rs)
- [Foundry Book](https://book.getfoundry.sh/)
- [QuickNode Arbitrum Guide](https://www.quicknode.com/guides/arbitrum/)
