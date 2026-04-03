# SolarPlex Arbitrum MCP

[![npm version](https://img.shields.io/npm/v/solarplex-arbitrum-mcp)](https://www.npmjs.com/package/solarplex-arbitrum-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Endpoint](https://img.shields.io/badge/Live-Railway-green)](https://solarplex-arbitrum-mcp-production.up.railway.app)

Multi-chain MCP server enabling AI agents to interact with **Arbitrum** — ERC-8004 identity registration, GMX ecosystem integration, cross-chain reputation via RepuLayer, and 37 governance tools across 6 chains.

**Live endpoint:** https://solarplex-arbitrum-mcp-production.up.railway.app

---

## Quick Start

### Try it now (no install needed)

```bash
# Health check
curl https://solarplex-arbitrum-mcp-production.up.railway.app/

# List all tools
curl https://solarplex-arbitrum-mcp-production.up.railway.app/tools

# Chat naturally
curl -X POST https://solarplex-arbitrum-mcp-production.up.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show GMX ETH prices"}'

# Call a tool directly
curl -X POST https://solarplex-arbitrum-mcp-production.up.railway.app/invoke \
  -H "Content-Type: application/json" \
  -d '{"tool": "arbitrum_get_balance", "arguments": {"address": "0xE0DAD8AD88A1139323C90f0F3c6b2612Be9E1815"}}'
```

### Install locally

```bash
npm install -g solarplex-arbitrum-mcp
```

---

## What This Is

SolarPlex MCP is the **Arbitrum bridge** for the SolArPlex AI agent ecosystem. It connects AI agents to:

- **Arbitrum chain** — read balances, deploy contracts, register identities (ERC-8004)
- **GMX V2** — real-time prices, markets, open interest from the GMX oracle
- **RepuLayer** — cross-chain reputation aggregation (CredDAO + TrustLend + RepuGate)
- **6 chains total** — Solana, Arbitrum, Polygon, BSC, Ethereum, Base

### Architecture

```
AI Agent (Claude, Cursor, etc.)
         │
         ▼
┌─────────────────────────────────┐
│   SolarPlex MCP Server (37)     │
├──────────┬──────────┬───────────┤
│ Solana   │ Arbitrum │ GMX V2    │
│ (6 tools)│ (7 tools)│ (6 tools) │
├──────────┴──────────┴───────────┤
│  Reputation + Governance (18)   │
└─────────────────────────────────┘
         │
    ┌────┼────────────┐
    ▼    ▼            ▼
  Solana  Arbitrum   GMX Oracle
  RPC     + Sepolia  (live API)
```

---

## All 37 Tools

### Arbitrum (7) — Core chain interaction

| Tool | Description |
|------|-------------|
| `arbitrum_register_agent` | Register on ERC-8004 identity registry (signed tx) |
| `arbitrum_get_balance` | Get ETH balance (viem publicClient) |
| `arbitrum_read_contract` | Read from any contract (viem readContract) |
| `arbitrum_write_contract` | Write to contract (requires wallet signature) |
| `arbitrum_deploy_stylus` | Deploy Stylus (Rust) contract |
| `arbitrum_deploy_solidity` | Deploy Solidity contract |
| `arbitrum_bridge_assets` | Bridge assets to/from Arbitrum |

### GMX V2 (6) — Real-time DeFi data

| Tool | Description |
|------|-------------|
| `gmx_get_prices` | Token prices from GMX oracle (live API) |
| `gmx_get_positions` | Open positions for a wallet |
| `gmx_open_position` | Open leveraged position (requires signature) |
| `gmx_close_position` | Close position (requires signature) |
| `gmx_get_markets` | Available markets (perps/spot) |
| `gmx_get_open_interest` | Open interest per market |

### Reputation (4) — RepuLayer cross-chain bridge

| Tool | Description |
|------|-------------|
| `governance_get_cross_chain_reputation` | Unified reputation (Solana + Arbitrum) |
| `governance_get_reputation_breakdown` | CredDAO + TrustLend + RepuGate breakdown |
| `governance_compare_reputations` | Compare two wallets |
| `governance_get_reputation_trend` | Score trend over N days |

### Governance (6) — Quadratic voting + tiers

| Tool | Description |
|------|-------------|
| `governance_get_reputation` | Cross-chain reputation score |
| `governance_get_tier` | Governance tier (platinum/gold/silver/bronze) |
| `governance_calculate_voting_power` | √(tokens) × (1 + fairscore/50) |
| `governance_get_proposal_status` | Proposal status on-chain |
| `governance_create_multichain_proposal` | Create on Solana + Arbitrum |
| `governance_get_delegation_efficiency` | Delegation efficiency score |

### Delegate Discovery (4)

| Tool | Description |
|------|-------------|
| `governance_find_delegates` | Find delegates by interest |
| `governance_get_delegate_voting_history` | Voting history per delegate |
| `governance_calculate_delegation_efficiency` | Efficiency between delegator/delegate |
| `governance_suggest_delegation` | Optimal delegation strategy |

### Analytics (4)

| Tool | Description |
|------|-------------|
| `governance_get_analytics` | DAO overview (members, proposals, votes) |
| `governance_get_participation_rate` | Voter participation rate |
| `governance_get_proposal_success_rate` | Proposal pass/fail stats |
| `governance_generate_report` | Comprehensive governance report |

### Solana (6)

| Tool | Description |
|------|-------------|
| `solana_get_balance` | SOL balance |
| `solana_get_governance_state` | CredDAO governance state |
| `solana_create_proposal` | Create governance proposal |
| `solana_cast_vote` | Cast vote |
| `solana_get_fairscore` | FairScore for wallet |
| `solana_delegate` | Delegate voting power |

---

## Live Demo: On-Chain Registration

The `arbitrum_register_agent` tool performs a **real signed transaction** on Arbitrum Sepolia:

```bash
curl -X POST https://solarplex-arbitrum-mcp-production.up.railway.app/invoke \
  -H "Content-Type: application/json" \
  -d '{"tool": "arbitrum_register_agent", "arguments": {"name": "SolarPlex", "description": "Multi-chain governance agent", "skills": ["code", "solana", "arbitrum", "governance"]}}'
```

Returns:
```json
{
  "status": "confirmed",
  "transactionHash": "0x6803d227a2415a76fa464dec8490ac6dd189f0e399ea7c70d90457a4c3ee922c",
  "explorerUrl": "https://sepolia.arbiscan.io/tx/0x6803d227a2415a76fa464dec8490ac6dd189f0e399ea7c70d90457a4c3ee922c"
}
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ARBITRUM_RPC_URL` | Yes | Arbitrum One RPC endpoint |
| `ARBITRUM_SEPOLIA_RPC_URL` | Yes | Arbitrum Sepolia RPC endpoint |
| `AGENT_PRIVATE_KEY` | For writes | Wallet private key for signing transactions |
| `QUICKNODE_API_KEY` | Optional | QuickNode API key |
| `QUICKNODE_SOLANA_ENDPOINT` | Optional | Solana QuickNode endpoint |
| `QUICKNODE_ARBITRUM_ENDPOINT` | Optional | Arbitrum QuickNode endpoint |

### Claude Desktop Config

```json
{
  "mcpServers": {
    "solarplex": {
      "command": "solarplex-mcp",
      "env": {
        "ARBITRUM_RPC_URL": "https://your-endpoint.quiknode.pro/...",
        "ARBITRUM_SEPOLIA_RPC_URL": "https://your-sepolia-endpoint.quiknode.pro/..."
      }
    }
  }
}
```

---

## ArbiLink Agentic Bounty Compliance

| Requirement | Status |
|-------------|--------|
| Skill/MCP for AI ↔ Arbitrum | ✅ 37 tools across 6 chains |
| Agent registered on ERC-8004 | ✅ Real signed tx on Arbitrum Sepolia |
| Open source | ✅ Public GitHub repo |
| Framework protected | ✅ Source in `src/`, only `dist/` published |
| Published on npm | ✅ `solarplex-arbitrum-mcp` v1.2.0 |
| ⭐ GMX integration | ✅ Live prices from GMX oracle API |
| ⭐ Cross-chain reputation | ✅ RepuLayer bridge (CredDAO + TrustLend + RepuGate) |
| ⭐ Delegate discovery | ✅ Interest-based matching with voting history |
| ⭐ Governance analytics | ✅ DAO metrics, participation rates, reports |
| ⭐ Live deployed agent | ✅ Railway HTTP endpoint |

---

## Ecosystem

Part of the **SolArPlex** multi-chain AI agent network:

- **CredDAO** — Solana reputation-weighted governance
- **TrustLend** — Under-collateralized lending via FairScore
- **RepuGate** — Reputation-gated token launchpad
- **RepuLayer** — Cross-chain reputation aggregation
- **AgentxploiTor** — Autonomous security auditing

**Roadmap:** 7-phase ecosystem from reputation building → full cross-chain launch. See [solar-plex.netlify.app](https://solar-plex.netlify.app) for details.

---

## License

MIT
