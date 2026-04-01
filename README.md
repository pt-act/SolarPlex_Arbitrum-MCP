# SolarPlex Arbitrum MCP

Multi-chain MCP (Model Context Protocol) for the SolarPlex agent, enabling AI-powered governance operations across Solana and Arbitrum.

## Overview

SolarPlex MCP extends the CredDAO governance platform with multi-chain capabilities, allowing AI agents to:
- Deploy and interact with smart contracts on both Solana and Arbitrum
- Manage reputation-weighted governance across chains
- Register on ERC-8004 identity registry (Arbitrum)
- Bridge assets between chains

## Architecture

```
SolarPlex MCP Server
├── Tools:
│   ├── solana_governance      → Solana/Anchor governance
│   ├── arbitrum_governance    → Arbitrum/Stylus governance
│   ├── fairscore_oracle       → FairScore integration
│   └── multi_chain_bridge     → Cross-chain coordination
├── Registration:
│   ├── Solana: moltlaunch wallet
│   └── Arbitrum: ERC-8004 registry
└── QuickNode:
    ├── Solana: Existing endpoint
    └── Arbitrum: New endpoint
```

## Available Tools

### Solana Tools
- `solana_get_balance` - Get Solana wallet balance
- `solana_get_governance_state` - Get CredDAO governance state
- `solana_create_proposal` - Create governance proposal
- `solana_cast_vote` - Cast vote on proposal
- `solana_get_fairscore` - Get FairScore for wallet
- `solana_delegate` - Delegate voting power

### Arbitrum Tools
- `arbitrum_register_agent` - Register on ERC-8004 registry
- `arbitrum_get_balance` - Get Arbitrum ETH balance
- `arbitrum_deploy_stylus` - Deploy Stylus (Rust) contract
- `arbitrum_deploy_solidity` - Deploy Solidity contract
- `arbitrum_read_contract` - Read from contract
- `arbitrum_write_contract` - Write to contract
- `arbitrum_bridge_assets` - Bridge assets

### Governance Tools
- `governance_get_reputation` - Cross-chain reputation
- `governance_get_tier` - Governance tier
- `governance_calculate_voting_power` - Quadratic voting formula
- `governance_get_proposal_status` - Proposal status
- `governance_create_multichain_proposal` - Multi-chain proposal
- `governance_get_delegation_efficiency` - Delegation efficiency

## Installation

```bash
# Clone the repo
git clone https://github.com/your-username/solarplex-arbitrum-mcp.git
cd solarplex-arbitrum-mcp

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
- Solana RPC/WebSocket endpoints
- Arbitrum RPC/WebSocket endpoints
- QuickNode API keys
- Agent wallet address

## Usage with Claude

Add to your Claude MCP configuration:

```json
{
  "mcpServers": {
    "solarplex-arbitrum": {
      "command": "node",
      "args": ["/path/to/solarplex-arbitrum-mcp/dist/index.js"],
      "env": {
        "SOLANA_RPC_URL": "https://your-quicknode-solana-endpoint.quiknode.pro/",
        "ARBITRUM_RPC_URL": "https://your-quicknode-arbitrum-endpoint.quiknode.pro/"
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
