import { Player } from './types';

export const calculateFairInterval = (rosterSize: number, fieldSize: number, duration: number): number => {
    if (rosterSize <= fieldSize) return duration; // No subs needed, play full match

    // GCD-based Fair Play Algorithm
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const cycleSteps = rosterSize / gcd(rosterSize, fieldSize);
    let interval = duration / cycleSteps;

    // Heuristic: If interval is too long (> 12 min), split it in half to give more rotation frequency
    if (interval > 12) interval /= 2;

    return Number(interval.toFixed(1));
};

export const getSubstitutionSuggestion = (players: Player[]) => {
    const onField = players.filter(p => p.status === 'ON_FIELD').sort((a, b) => b.totalPlayTime - a.totalPlayTime);
    const onBench = players.filter(p => p.status === 'BENCH').sort((a, b) => a.lastSubTime - b.lastSubTime);
    return { onField, onBench };
};
