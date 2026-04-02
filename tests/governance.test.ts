import { describe, it, expect } from 'vitest';
import { calculateVotingPower, getTierFromScore, TIER_DEFINITIONS } from '../src/tools/governance.js';

describe('Voting Power Calculation', () => {
  describe('Basic calculations', () => {
    it('should calculate correct voting power for 10000 tokens with fairscore 78', () => {
      const result = calculateVotingPower('10000', 78);
      // √10000 = 100, multiplier = 1 + 78/50 = 2.56, power = 100 * 2.56 = 256
      expect(result).toBe(256);
    });

    it('should calculate correct voting power for 100 tokens with fairscore 0', () => {
      const result = calculateVotingPower('100', 0);
      // √100 = 10, multiplier = 1 + 0/50 = 1.0, power = 10 * 1.0 = 10
      expect(result).toBe(10);
    });

    it('should calculate correct voting power for 100 tokens with fairscore 100', () => {
      const result = calculateVotingPower('100', 100);
      // √100 = 10, multiplier = 1 + 100/50 = 3.0, power = 10 * 3.0 = 30
      expect(result).toBe(30);
    });
  });

  describe('Property-based invariants', () => {
    it('should always increase with token balance (monotonicity)', () => {
      const fairscore = 50;
      const power1 = calculateVotingPower('100', fairscore);
      const power2 = calculateVotingPower('400', fairscore);
      const power3 = calculateVotingPower('10000', fairscore);
      
      expect(power2).toBeGreaterThan(power1);
      expect(power3).toBeGreaterThan(power2);
    });

    it('should always increase with fairscore (monotonicity)', () => {
      const tokens = '10000';
      const power1 = calculateVotingPower(tokens, 0);
      const power2 = calculateVotingPower(tokens, 50);
      const power3 = calculateVotingPower(tokens, 100);
      
      expect(power2).toBeGreaterThan(power1);
      expect(power3).toBeGreaterThan(power2);
    });

    it('should show diminishing returns for token balance (quadratic)', () => {
      // 100x tokens should give 10x power (quadratic scaling)
      const power1 = calculateVotingPower('100', 0);
      const power2 = calculateVotingPower('10000', 0);
      
      expect(power2).toBe(Math.floor(Math.sqrt(10000) / Math.sqrt(100) * power1));
    });

    it('should handle zero tokens gracefully', () => {
      const result = calculateVotingPower('0', 50);
      expect(result).toBe(0);
    });

    it('should handle very large token balances', () => {
      const result = calculateVotingPower('1000000000', 50);
      expect(result).toBeGreaterThan(0);
      expect(Number.isFinite(result)).toBe(true);
    });
  });

  describe('Input validation', () => {
    it('should throw on NaN tokenBalance', () => {
      expect(() => calculateVotingPower('abc', 50)).toThrow('Invalid tokenBalance');
    });

    it('should throw on negative tokenBalance', () => {
      expect(() => calculateVotingPower('-100', 50)).toThrow('Invalid tokenBalance');
    });

    it('should throw on fairscore below 0', () => {
      expect(() => calculateVotingPower('100', -1)).toThrow('Invalid fairscore');
    });

    it('should throw on fairscore above 100', () => {
      expect(() => calculateVotingPower('100', 101)).toThrow('Invalid fairscore');
    });

    it('should throw on NaN fairscore', () => {
      expect(() => calculateVotingPower('100', NaN)).toThrow('Invalid fairscore');
    });

    it('should throw on Infinity fairscore', () => {
      expect(() => calculateVotingPower('100', Infinity)).toThrow('Invalid fairscore');
    });
  });
});

describe('Tier System', () => {
  describe('Boundary conditions', () => {
    it('should return silver for score 69', () => {
      expect(getTierFromScore(69)).toBe('silver');
    });

    it('should return gold for score 70', () => {
      expect(getTierFromScore(70)).toBe('gold');
    });

    it('should return gold for score 84', () => {
      expect(getTierFromScore(84)).toBe('gold');
    });

    it('should return platinum for score 85', () => {
      expect(getTierFromScore(85)).toBe('platinum');
    });

    it('should return bronze for score 49', () => {
      expect(getTierFromScore(49)).toBe('bronze');
    });

    it('should return silver for score 50', () => {
      expect(getTierFromScore(50)).toBe('silver');
    });

    it('should return unscored for score 29', () => {
      expect(getTierFromScore(29)).toBe('unscored');
    });

    it('should return unscored for score 30 should be bronze', () => {
      expect(getTierFromScore(30)).toBe('bronze');
    });

    it('should return unscored for score 0', () => {
      expect(getTierFromScore(0)).toBe('unscored');
    });

    it('should return platinum for score 100', () => {
      expect(getTierFromScore(100)).toBe('platinum');
    });
  });

  describe('Property-based invariants', () => {
    it('should never return a tier with higher minScore than input', () => {
      for (let score = 0; score <= 100; score++) {
        const tier = getTierFromScore(score);
        const tierMinScore = TIER_DEFINITIONS[tier].minScore;
        expect(score).toBeGreaterThanOrEqual(tierMinScore);
      }
    });

    it('should return consistent results for same input', () => {
      for (let score = 0; score <= 100; score++) {
        const tier1 = getTierFromScore(score);
        const tier2 = getTierFromScore(score);
        expect(tier1).toBe(tier2);
      }
    });

    it('should have monotonically decreasing tier as score decreases', () => {
      const tierOrder = ['unscored', 'bronze', 'silver', 'gold', 'platinum'];
      let prevTierIndex = -1;
      
      for (let score = 0; score <= 100; score++) {
        const tier = getTierFromScore(score);
        const tierIndex = tierOrder.indexOf(tier);
        // Tier index should be >= previous tier index (or first iteration)
        if (prevTierIndex >= 0) {
          expect(tierIndex).toBeGreaterThanOrEqual(prevTierIndex);
        }
        prevTierIndex = tierIndex;
      }
    });
  });

  describe('Input validation', () => {
    it('should throw on NaN score', () => {
      expect(() => getTierFromScore(NaN)).toThrow('Invalid score');
    });

    it('should throw on Infinity score', () => {
      expect(() => getTierFromScore(Infinity)).toThrow('Invalid score');
    });

    it('should throw on negative Infinity score', () => {
      expect(() => getTierFromScore(-Infinity)).toThrow('Invalid score');
    });
  });
});
