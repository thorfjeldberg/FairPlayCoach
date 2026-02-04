import { describe, it, expect } from 'vitest';
import { calculateFairInterval } from './fairPlayLogic';

describe('calculateFairInterval', () => {
    it('returns duration if roster size equals field size', () => {
        expect(calculateFairInterval(5, 5, 40)).toBe(40);
    });

    it('suggests a fair interval for rotation (7 players, 5 field, 40m)', () => {
        // roster=7, field=5, duration=40
        // GCD(7, 5) = 1
        // cycleSteps = 7 / 1 = 7
        // interval = 40 / 7 = 5.714...
        // 5.7 is returned
        expect(calculateFairInterval(7, 5, 40)).toBe(5.7);
    });

    it('suggests a fair interval for rotation (10 players, 5 field, 40m)', () => {
        // roster=10, field=5, duration=40
        // GCD(10, 5) = 5
        // cycleSteps = 10 / 5 = 2
        // interval = 40 / 2 = 20
        // 20 > 12, so 10 is returned
        expect(calculateFairInterval(10, 5, 40)).toBe(10);
    });

    it('handles small rosters without errors', () => {
        expect(calculateFairInterval(1, 1, 20)).toBe(20);
    });
});
