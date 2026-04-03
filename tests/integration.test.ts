import { describe, it, expect, beforeAll } from 'vitest';
import { calculateVotingPower, getTierFromScore } from '../src/tools/governance.js';
import { calculateCompositeScore, REPUTATION_WEIGHTS } from '../src/tools/reputation.js';
import { handleArbitrumTool } from '../src/tools/arbitrum.js';
import { handleGMXTool } from '../src/tools/gmx.js';
import { handleGovernanceTool } from '../src/tools/governance.js';
import { handleReputationTool } from '../src/tools/reputation.js';
import { handleDelegateTool } from '../src/tools/delegate.js';
import { handleAnalyticsTool } from '../src/tools/analytics.js';

const TEST_WALLET = '0xE0DAD8AD88A1139323C90f0F3c6b2612Be9E1815';

describe('Integration: End-to-End Tool Workflows', () => {

  describe('Arbitrum Read Flow', () => {
    it('should return balance for a valid address', async () => {
      try {
        const result = await handleArbitrumTool('arbitrum_get_balance', {
          address: TEST_WALLET,
        });
        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe(TEST_WALLET);
        expect(data.balance).toMatch(/ETH/);
        expect(data.chainId).toBe(42161);
      } catch (e: any) {
        // RPC may be rate-limited in test environment
        if (e.message?.includes('RPC') || e.message?.includes('balance')) {
          console.warn('Skipping balance test — RPC unavailable');
          return;
        }
        throw e;
      }
    });
  });

  describe('GMX Live Data Flow', () => {
    it('should return real ETH prices from GMX oracle', async () => {
      const result = await handleGMXTool('gmx_get_prices', { market: 'ETH' });
      const data = JSON.parse(result.content[0].text);
      expect(data.market).toBe('ETH');
      expect(data.minPrice).toBeDefined();
      expect(data.maxPrice).toBeDefined();
      expect(data.tokenAddress).toBeDefined();
    });

    it('should return available GMX markets', async () => {
      const result = await handleGMXTool('gmx_get_markets', { type: 'perps' });
      const data = JSON.parse(result.content[0].text);
      expect(data.type).toBe('perps');
      expect(Array.isArray(data.markets)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });
  });

  describe('Reputation Composite Flow', () => {
    it('should return cross-chain reputation with scores', async () => {
      const result = await handleReputationTool('governance_get_cross_chain_reputation', {
        solanaWallet: TEST_WALLET,
        arbitrumWallet: TEST_WALLET,
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.reputation.solana).not.toBeNull();
      expect(data.reputation.solana.fairscore).toBeGreaterThanOrEqual(0);
      expect(['platinum', 'gold', 'silver', 'bronze', 'unscored']).toContain(data.reputation.solana.tier);
      expect(data.reputation.arbitrum).not.toBeNull();
      expect(data.reputation.combined.score).toBeGreaterThanOrEqual(0);
      expect(data.compositeFormula).toContain('creddao');
    });

    it('should return reputation breakdown with composite score', async () => {
      const result = await handleReputationTool('governance_get_reputation_breakdown', {
        wallet: TEST_WALLET,
        chain: 'arbitrum',
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.sources.creddao.fairscore).toBeGreaterThan(0);
      expect(data.sources.trustlend.creditScore).toBeGreaterThan(0);
      expect(data.sources.repugate.participationScore).toBeGreaterThan(0);
      expect(data.composite.score).toBeGreaterThan(0);
      expect(data.composite.formula).toContain('creddao');
    });

    it('should return reputation trend with data points', async () => {
      const result = await handleReputationTool('governance_get_reputation_trend', {
        wallet: TEST_WALLET,
        chain: 'arbitrum',
        days: 30,
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.dataPoints.length).toBeGreaterThan(0);
      expect(data.dataPoints[0]).toHaveProperty('date');
      expect(data.dataPoints[0]).toHaveProperty('score');
      expect(['improving', 'declining', 'stable']).toContain(data.trend);
    });

    it('should compare two wallets with different scores', async () => {
      const wallet2 = '0x1234567890123456789012345678901234567890';
      const result = await handleReputationTool('governance_compare_reputations', {
        wallet1: TEST_WALLET,
        wallet2,
        chain: 'both',
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.wallet1.fairscore).toBeGreaterThan(0);
      expect(data.wallet2.fairscore).toBeGreaterThan(0);
      expect(data.comparison.higher).toBeDefined();
    });
  });

  describe('Governance Full Flow', () => {
    it('should return reputation with tier per chain', async () => {
      const result = await handleGovernanceTool('governance_get_reputation', {
        wallet: TEST_WALLET,
        chains: ['solana', 'arbitrum'],
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.reputation.solana.fairscore).toBeGreaterThan(0);
      expect(data.reputation.arbitrum.fairscore).toBeGreaterThan(0);
      expect(['platinum', 'gold', 'silver', 'bronze', 'unscored']).toContain(data.reputation.solana.tier);
    });

    it('should return tier with full tier info', async () => {
      const result = await handleGovernanceTool('governance_get_tier', {
        wallet: TEST_WALLET,
        chain: 'arbitrum',
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.fairscore).toBeGreaterThan(0);
      expect(data.tier).toBeDefined();
      expect(data.tierInfo).toHaveProperty('timeLock');
      expect(data.tierInfo).toHaveProperty('minScore');
    });

    it('should calculate voting power with formula breakdown', async () => {
      const result = await handleGovernanceTool('governance_calculate_voting_power', {
        tokenBalance: '10000',
        fairscore: 78,
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.totalPower).toBe(256);
      expect(data.quadraticBase).toBe('100.00');
      expect(data.reputationMultiplier).toBe('2.56');
      expect(data.formula).toContain('√');
    });

    it('should return delegation efficiency', async () => {
      const delegate = '0x1234567890123456789012345678901234567890';
      const result = await handleGovernanceTool('governance_get_delegation_efficiency', {
        delegator: TEST_WALLET,
        delegate,
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.efficiency).toBeGreaterThan(0);
      expect(data.efficiency).toBeLessThanOrEqual(100);
    });
  });

  describe('Delegate Discovery Flow', () => {
    it('should find delegates matching interests', async () => {
      const result = await handleDelegateTool('governance_find_delegates', {
        interests: ['defi', 'governance'],
        chain: 'arbitrum',
        minScore: 50,
        maxResults: 5,
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.delegates.length).toBeGreaterThan(0);
      expect(data.delegates[0]).toHaveProperty('address');
      expect(data.delegates[0]).toHaveProperty('score');
      expect(data.delegates[0]).toHaveProperty('tier');
      expect(data.delegates[0].score).toBeGreaterThanOrEqual(50);
    });

    it('should return voting history for a delegate', async () => {
      const result = await handleDelegateTool('governance_get_delegate_voting_history', {
        delegate: TEST_WALLET,
        chain: 'arbitrum',
        limit: 10,
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.votingHistory.length).toBeGreaterThan(0);
      expect(data.votingHistory[0]).toHaveProperty('proposalId');
      expect(data.votingHistory[0]).toHaveProperty('vote');
      expect(data.votingHistory[0]).toHaveProperty('date');
    });

    it('should suggest delegation strategies', async () => {
      const result = await handleDelegateTool('governance_suggest_delegation', {
        wallet: TEST_WALLET,
        chain: 'arbitrum',
        goals: ['maximize governance impact'],
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.suggestions.length).toBeGreaterThan(0);
      expect(data.suggestions[0]).toHaveProperty('strategy');
      expect(data.suggestions[0]).toHaveProperty('delegate');
      expect(data.suggestions[0]).toHaveProperty('score');
    });
  });

  describe('Analytics Flow', () => {
    it('should return DAO analytics overview', async () => {
      const result = await handleAnalyticsTool('governance_get_analytics', {
        daoAddress: TEST_WALLET,
        chain: 'arbitrum',
        timeRange: '30d',
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.overview.totalMembers).toBeGreaterThan(0);
      expect(data.overview.activeMembers).toBeGreaterThan(0);
      expect(data.overview.totalProposals).toBeGreaterThan(0);
    });

    it('should return participation rate with benchmark', async () => {
      const result = await handleAnalyticsTool('governance_get_participation_rate', {
        daoAddress: TEST_WALLET,
        chain: 'arbitrum',
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.participationRate).toBeGreaterThan(0);
      expect(data.benchmark).toHaveProperty('average');
      expect(data.benchmark).toHaveProperty('target');
    });

    it('should return proposal success rate', async () => {
      const result = await handleAnalyticsTool('governance_get_proposal_success_rate', {
        daoAddress: TEST_WALLET,
        chain: 'arbitrum',
        timeRange: '90d',
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.successRate).toBeGreaterThan(0);
      expect(data.totalProposals).toBeGreaterThan(0);
      expect(data.passed + data.rejected).toBe(data.totalProposals);
    });

    it('should generate report with summary', async () => {
      const result = await handleAnalyticsTool('governance_generate_report', {
        daoAddress: TEST_WALLET,
        chain: 'arbitrum',
        format: 'json',
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.generatedAt).toBeDefined();
      expect(data.summary).toHaveProperty('healthScore');
      expect(data.summary).toHaveProperty('participationTrend');
    });
  });

  describe('ERC-8004 Registration Flow', () => {
    it('should return registration details (no private key in test)', async () => {
      const result = await handleArbitrumTool('arbitrum_register_agent', {
        name: 'TestAgent',
        description: 'Test agent for integration testing',
        skills: ['governance', 'defi'],
        endpoint: 'https://test.example.com',
      });
      const data = JSON.parse(result.content[0].text);
      expect(data.action).toBe('register_agent');
      expect(data.name).toBe('TestAgent');
      expect(data.registry).toBeDefined();
      expect(data.chain).toBe('arbitrum-sepolia');
    });
  });

  describe('Cross-Tool Consistency', () => {
    it('should produce consistent tiers across reputation and governance tools', async () => {
      const repResult = await handleReputationTool('governance_get_cross_chain_reputation', {
        solanaWallet: TEST_WALLET,
        arbitrumWallet: TEST_WALLET,
      });
      const repData = JSON.parse(repResult.content[0].text);

      const govResult = await handleGovernanceTool('governance_get_tier', {
        wallet: TEST_WALLET,
        chain: 'arbitrum',
      });
      const govData = JSON.parse(govResult.content[0].text);

      expect(repData.reputation.arbitrum.tier).toBe(govData.tier);
    });

    it('should produce consistent delegation efficiency across tools', async () => {
      const delegate = '0x1234567890123456789012345678901234567890';

      const govResult = await handleGovernanceTool('governance_get_delegation_efficiency', {
        delegator: TEST_WALLET,
        delegate,
      });
      const govData = JSON.parse(govResult.content[0].text);

      const delResult = await handleDelegateTool('governance_calculate_delegation_efficiency', {
        delegator: TEST_WALLET,
        delegate,
        chain: 'arbitrum',
      });
      const delData = JSON.parse(delResult.content[0].text);

      expect(govData.efficiency).toBe(delData.efficiency);
    });
  });
});

describe('Integration: Reputation Formula Verification', () => {
  it('should correctly weight CredDAO as primary source (0.4)', () => {
    expect(REPUTATION_WEIGHTS.creddao).toBe(0.4);
    expect(REPUTATION_WEIGHTS.trustlend).toBe(0.3);
    expect(REPUTATION_WEIGHTS.repugate).toBe(0.3);
  });

  it('should calculate composite score correctly', () => {
    const score = calculateCompositeScore({
      creddao: 80,
      trustlend: 60,
      repugate: 70,
    });
    // (80 × 0.4) + (60 × 0.3) + (70 × 0.3) = 32 + 18 + 21 = 71
    expect(score).toBe(71);
  });

  it('should handle partial scores (only CredDAO)', () => {
    const score = calculateCompositeScore({ creddao: 80 });
    expect(score).toBe(80);
  });

  it('should handle partial scores (CredDAO + TrustLend)', () => {
    const score = calculateCompositeScore({ creddao: 80, trustlend: 60 });
    // (80 × 0.4 + 60 × 0.3) / (0.4 + 0.3) = (32 + 18) / 0.7 = 71.4 → 71
    expect(score).toBe(71);
  });
});

describe('Integration: Quadratic Voting Verification', () => {
  it('should prevent whale dominance (100x tokens = 10x power)', () => {
    const power1 = calculateVotingPower('100', 0);
    const power2 = calculateVotingPower('10000', 0);
    expect(power2 / power1).toBeCloseTo(10, 0);
  });

  it('should give reputation multiplier boost', () => {
    const base = calculateVotingPower('10000', 0);
    const boosted = calculateVotingPower('10000', 100);
    expect(boosted).toBeGreaterThan(base * 2);
  });

  it('should match tier thresholds', () => {
    const scores = [0, 30, 50, 70, 85, 100];
    const expectedTiers = ['unscored', 'bronze', 'silver', 'gold', 'platinum', 'platinum'];

    scores.forEach((score, i) => {
      expect(getTierFromScore(score)).toBe(expectedTiers[i]);
    });
  });
});
