# SolarPlex Arbitrum MCP — Skill

**Version:** 1.2.0
**Type:** MCP Server + Skill
**Chains:** Solana, Arbitrum, Polygon, BSC, Ethereum, Base
**Ecosystem:** RepuLayer (CredDAO + TrustLend + RepuGate)

---

## What This Skill Does

Enables AI agents to interact with **Arbitrum** and 5 other chains through 37 tools covering:
- On-chain identity registration (ERC-8004)
- Real-time GMX V2 DeFi data
- Cross-chain reputation via RepuLayer
- Quadratic voting with reputation-weighted power
- Delegate discovery and delegation strategy
- Governance analytics and reporting

## When to Use This Skill

Use this skill when the user asks to:
- Check balances, read contracts, or deploy on Arbitrum
- Get GMX prices, markets, or open interest
- Calculate governance voting power or check reputation tiers
- Find delegates or analyze delegation efficiency
- Register an agent on the ERC-8004 identity registry
- Bridge assets between chains
- Generate governance analytics or reports

## How It Works

### Architecture

```
User Request → MCP Server → Tool Router → Chain/Protocol API → Response
```

The MCP server routes tool calls to the appropriate handler:
- **Arbitrum tools** → viem publicClient (reads) or walletClient (writes)
- **GMX tools** → GMX Infra REST API (live oracle data)
- **Reputation tools** → RepuLayer composite formula (CredDAO×0.4 + TrustLend×0.3 + RepuGate×0.3)
- **Governance tools** → Pure math (quadratic voting: √tokens × (1 + fairscore/50))

### Two Access Modes

1. **stdio (MCP protocol)** — For Claude Desktop, Cursor, IDE integration
2. **HTTP REST** — For web apps, agents, automated testing

### HTTP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check + agent info |
| `/tools` | GET | List all 37 tools |
| `/invoke` | POST | Call any tool directly |
| `/chat` | POST | Natural language interface |

### Live Demo

```bash
# Check health
curl https://solarplex-arbitrum-mcp-production.up.railway.app/

# Get GMX ETH price
curl -X POST https://solarplex-arbitrum-mcp-production.up.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show GMX ETH prices"}'

# Register agent on ERC-8004 (signed tx)
curl -X POST https://solarplex-arbitrum-mcp-production.up.railway.app/invoke \
  -H "Content-Type: application/json" \
  -d '{"tool": "arbitrum_register_agent", "arguments": {"name": "MyAgent", "description": "Test agent", "skills": ["governance"]}}'
```

## Tool Categories

### Arbitrum (7 tools)
Chain interaction — balance checks, contract reads/writes, deployment, ERC-8004 registration.

### GMX V2 (6 tools)
Real-time DeFi data from GMX oracle — prices, positions, markets, open interest.

### Reputation (4 tools)
Cross-chain reputation via RepuLayer — composite scoring from CredDAO, TrustLend, RepuGate.

### Governance (6 tools)
Quadratic voting, tier management, proposal creation, delegation efficiency.

### Delegate Discovery (4 tools)
Find delegates by interest, view voting history, get delegation suggestions.

### Analytics (4 tools)
DAO metrics, participation rates, proposal success rates, report generation.

### Solana (6 tools)
Balance, governance state, proposals, voting, FairScore, delegation.

## Key Formulas

### Quadratic Voting Power
```
votingPower = √(tokenBalance) × (1 + fairscore / 50)
```
- √(tokens): Quadratic scaling prevents whale dominance
- (1 + fairscore/50): Reputation multiplier (0x at score 0, 3x at score 100)

### Composite Reputation Score
```
compositeScore = (creddao × 0.4) + (trustlend × 0.3) + (repugate × 0.3)
```
- CredDAO (0.4): Governance participation is primary signal
- TrustLend (0.3): Credit history shows financial responsibility
- RepuGate (0.3): Launch participation shows ecosystem engagement

### Governance Tiers
| Tier | Score Range | Time-Lock |
|------|-------------|-----------|
| Platinum | 85-100 | 24h |
| Gold | 70-84 | 48h |
| Silver | 50-69 | 72h |
| Bronze | 30-49 | 168h |
| Unscored | 0-29 | 336h |

## Installation

### npm (Recommended)
```bash
npm install -g solarplex-arbitrum-mcp
```

### From Source
```bash
git clone https://github.com/pt-act/SolarPlex_Arbitrum-MCP.git
cd SolarPlex_Arbitrum-MCP
npm install
npm run build
```

## Configuration

Required environment variables:
```bash
ARBITRUM_RPC_URL=https://your-arbitrum-endpoint.quiknode.pro/...
ARBITRUM_SEPOLIA_RPC_URL=https://your-sepolia-endpoint.quiknode.pro/...
AGENT_PRIVATE_KEY=0x...  # For signed transactions (ERC-8004 registration)
```

## Links

- **GitHub:** https://github.com/pt-act/SolarPlex_Arbitrum-MCP
- **npm:** https://www.npmjs.com/package/solarplex-arbitrum-mcp
- **Live Endpoint:** https://solarplex-arbitrum-mcp-production.up.railway.app
- **Docs:** https://solar-plex.netlify.app/docs
- **Ecosystem:** https://solar-plex.netlify.app

## License

MIT
