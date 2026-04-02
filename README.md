# SolarPlex Arbitrum MCP

[![npm version](https://img.shields.io/npm/v/solarplex-arbitrum-mcp)](https://www.npmjs.com/package/solarplex-arbitrum-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Multi-chain MCP (Model Context Protocol) for the SolarPlex agent, enabling AI-powered operations across Solana, Arbitrum, Polygon, BSC, Ethereum, and Base.

## Overview

SolarPlex MCP extends the CredDAO governance platform with multi-chain capabilities, allowing AI agents to:
- Deploy and interact with smart contracts on Solana, Arbitrum, Polygon, BSC, Ethereum, and Base
- Manage reputation-weighted governance across chains
- Register on ERC-8004 identity registry (Arbitrum)
- Bridge assets between chains
- Integrate with GMX (Arbitrum ecosystem protocol)
- Aggregate reputation via RepuLayer (CredDAO + TrustLend + RepuGate)
- Discover delegates based on voting history and interests
- Generate governance analytics for DAO operators

## Supported Chains

| Chain | Chain ID | QuickNode Status |
|-------|----------|------------------|
| Solana | Devnet | ✅ Connected |
| Arbitrum One | 42161 | ✅ Connected |
| Arbitrum Sepolia | 421614 | ✅ Connected |
| Polygon | 137 | ✅ Connected |
| BSC | 56 | ✅ Connected |
| Ethereum | 1 | ✅ Connected |
| Base | 8453 | ✅ Connected |

## Architecture

```
SolarPlex MCP Server
├── Solana Tools:
│   ├── solana_get_balance → Get wallet balance
│   ├── solana_get_governance_state → Get governance state
│   ├── solana_create_proposal → Create proposal
│   ├── solana_cast_vote → Cast vote
│   ├── solana_get_fairscore → Get FairScore
│   └── solana_delegate → Delegate voting power
├── Arbitrum Tools:
│   ├── arbitrum_register_agent → Register on ERC-8004
│   ├── arbitrum_get_balance → Get ETH balance
│   ├── arbitrum_deploy_stylus → Deploy Stylus contract
│   ├── arbitrum_deploy_solidity → Deploy Solidity contract
│   ├── arbitrum_read_contract → Read from contract
│   ├── arbitrum_write_contract → Write to contract
│   └── arbitrum_bridge_assets → Bridge assets
├── GMX Tools (Arbitrum Ecosystem):
│   ├── gmx_get_prices → Get token prices from GMX oracle
│   ├── gmx_get_positions → Get open positions
│   ├── gmx_open_position → Open leveraged position
│   ├── gmx_close_position → Close position
│   ├── gmx_get_markets → Get available markets
│   └── gmx_get_open_interest → Get open interest
├── Reputation Tools (RepuLayer Bridge):
│   ├── governance_get_cross_chain_reputation → Unified reputation
│   ├── governance_get_reputation_breakdown → Detailed breakdown
│   ├── governance_compare_reputations → Compare wallets
│   └── governance_get_reputation_trend → Score trend
└── Governance Tools:
    ├── governance_get_reputation → Cross-chain reputation
    ├── governance_get_tier → Governance tier
    ├── governance_calculate_voting_power → Voting power
    ├── governance_get_proposal_status → Proposal status
    ├── governance_create_multichain_proposal → Multi-chain proposal
    └── governance_get_delegation_efficiency → Delegation efficiency
```

## Available Tools (31 total)

### Solana Tools (6)
- `solana_get_balance` - Get Solana wallet balance
- `solana_get_governance_state` - Get CredDAO governance state
- `solana_create_proposal` - Create governance proposal
- `solana_cast_vote` - Cast vote on proposal
- `solana_get_fairscore` - Get FairScore for wallet
- `solana_delegate` - Delegate voting power

### Arbitrum Tools (7)
- `arbitrum_register_agent` - Register on ERC-8004 registry
- `arbitrum_get_balance` - Get Arbitrum ETH balance
- `arbitrum_deploy_stylus` - Deploy Stylus (Rust) contract
- `arbitrum_deploy_solidity` - Deploy Solidity contract
- `arbitrum_read_contract` - Read from contract
- `arbitrum_write_contract` - Write to contract
- `arbitrum_bridge_assets` - Bridge assets

### GMX Tools (6) - Arbitrum Ecosystem Integration
- `gmx_get_prices` - Get current token prices from GMX oracle
- `gmx_get_positions` - Get open positions for a wallet
- `gmx_open_position` - Open a leveraged position on GMX V2
- `gmx_close_position` - Close a position on GMX V2
- `gmx_get_markets` - Get available markets (perps/spot)
- `gmx_get_open_interest` - Get open interest for a market

### Reputation Tools (4) - RepuLayer Bridge
- `governance_get_cross_chain_reputation` - Unified reputation via RepuLayer
- `governance_get_reputation_breakdown` - Detailed breakdown from all sources
- `governance_compare_reputations` - Compare reputation between wallets
- `governance_get_reputation_trend` - Score trend over time

### Delegate Discovery Tools (4) - New
- `governance_find_delegates` - Find delegates matching your interests
- `governance_get_delegate_voting_history` - Get voting history for a delegate
- `governance_calculate_delegation_efficiency` - Calculate delegation efficiency
- `governance_suggest_delegation` - Suggest optimal delegation strategy

### Governance Analytics Tools (4) - New
- `governance_get_analytics` - Get governance analytics for a DAO
- `governance_get_participation_rate` - Get voter participation rate
- `governance_get_proposal_success_rate` - Get proposal success rate
- `governance_generate_report` - Generate governance report

### Governance Tools (6)
- `governance_get_reputation` - Cross-chain reputation
- `governance_get_tier` - Governance tier
- `governance_calculate_voting_power` - Quadratic voting formula
- `governance_get_proposal_status` - Proposal status
- `governance_create_multichain_proposal` - Multi-chain proposal
- `governance_get_delegation_efficiency` - Delegation efficiency

## Installation

### Option 1: npm (Recommended)

```bash
npm install -g solarplex-arbitrum-mcp
```

### Option 2: From Source

```bash
# Clone the repo
git clone https://github.com/pt-act/SolarPlex_Arbitrum-MCP.git
cd SolarPlex_Arbitrum-MCP

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your QuickNode endpoints
nano .env

# Build
npm run build

# Run
npm start
```

## Configuration

Configure via `.env` file (see `.env.example`):

```bash
# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com

# Arbitrum
ARBITRUM_RPC_URL=https://your-arbitrum-endpoint.quiknode.pro/...
ARBITRUM_SEPOLIA_RPC_URL=https://your-arbitrum-sepolia-endpoint.quiknode.pro/...

# Polygon
POLYGON_RPC_URL=https://your-polygon-endpoint.quiknode.pro/...

# BSC
BSC_RPC_URL=https://your-bsc-endpoint.quiknode.pro/...

# Ethereum
ETHEREUM_RPC_URL=https://your-ethereum-endpoint.quiknode.pro/...

# Base
BASE_RPC_URL=https://your-base-endpoint.quiknode.pro/...

# QuickNode API Key
QUICKNODE_API_KEY=your_api_key
```

## Usage with Claude

### If installed via npm

```json
{
  "mcpServers": {
    "solarplex": {
      "command": "solarplex-mcp",
      "env": {
        "SOLANA_RPC_URL": "https://your-solana-endpoint.quiknode.pro/",
        "ARBITRUM_RPC_URL": "https://your-arbitrum-endpoint.quiknode.pro/",
        "POLYGON_RPC_URL": "https://your-polygon-endpoint.quiknode.pro/",
        "BSC_RPC_URL": "https://your-bsc-endpoint.quiknode.pro/",
        "ETHEREUM_RPC_URL": "https://your-ethereum-endpoint.quiknode.pro/",
        "BASE_RPC_URL": "https://your-base-endpoint.quiknode.pro/"
      }
    }
  }
}
```

### If built from source

```json
{
  "mcpServers": {
    "solarplex": {
      "command": "node",
      "args": ["/path/to/solarplex-arbitrum-mcp/dist/index.js"],
      "env": {
        "SOLANA_RPC_URL": "https://your-solana-endpoint.quiknode.pro/",
        "ARBITRUM_RPC_URL": "https://your-arbitrum-endpoint.quiknode.pro/",
        "POLYGON_RPC_URL": "https://your-polygon-endpoint.quiknode.pro/",
        "BSC_RPC_URL": "https://your-bsc-endpoint.quiknode.pro/",
        "ETHEREUM_RPC_URL": "https://your-ethereum-endpoint.quiknode.pro/",
        "BASE_RPC_URL": "https://your-base-endpoint.quiknode.pro/"
      }
    }
  }
}
```

## Arbitrum Challenge Compliance

This MCP is designed for the ArbiLink Agentic Bounty:
1. ✅ Agent registered on Arbitrum ERC-8004 identity registry
2. ✅ MCP (not just skill) for flexible multi-chain operations
3. ✅ Open source - built in public
4. ✅ Framework stays protected - internal logic private
5. ✅ Published on npm - community can install and use
6. ⭐ GMX integration (Arbitrum ecosystem protocol)
7. ⭐ Cross-chain reputation via RepuLayer
8. ⭐ Delegate discovery based on voting history
9. ⭐ Governance analytics for DAO operators

## Service Offerings

| Service | Price | Chain |
|---------|-------|-------|
| Anchor/Solana Development | 0.015 ETH | Solana |
| Stylus/Rust Development | 0.018 ETH | Arbitrum |
| Solidity Development | 0.015 ETH | Arbitrum |
| Governance Architecture | 0.020 ETH | Both |
| FairScore Integration | 0.012 ETH | Solana |
| Security & Audits | 0.018 ETH | Both |

## License

MIT
