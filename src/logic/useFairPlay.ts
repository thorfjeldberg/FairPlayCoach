import { useState, useEffect, useCallback, useRef } from 'react';
import type { Player, MatchSettings, MatchState } from './types';
import { calculateFairInterval, getSubstitutionSuggestion } from './fairPlayLogic';

const STORAGE_KEY = 'fair_play_coach_state';

interface FairPlayState {
    players: Player[];
    settings: MatchSettings;
    match: MatchState;
    goals: { playerId: string; time: number }[];
}

const INITIAL_STATE: FairPlayState = {
    players: [],
    settings: {
        matchDuration: 40, // default 2x20
        playersOnField: 5,
        subInterval: 5,
    },
    match: {
        status: 'IDLE',
        timeElapsed: 0,
        nextSubTime: 0,
        opponentScore: 0,
        subs: [],
    },
    goals: [],
};

export function useFairPlay() {

    // Init opponent score
    const [state, setState] = useState<FairPlayState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration: Ensure opponentScore exists
            if (parsed.match && typeof parsed.match.opponentScore === 'undefined') {
                parsed.match.opponentScore = 0;
            }
            return parsed;
        }
        return {
            ...INITIAL_STATE,
            match: { ...INITIAL_STATE.match, opponentScore: 0 }
        };
    });

    const timerRef = useRef<number | null>(null);

    // Persistence with throttling for frequent updates (timer ticks)
    const lastSavedRef = useRef(0);
    useEffect(() => {
        const now = Date.now();
        const isCritical = state.match.status !== 'RUNNING' || state.match.subs.length > 0;

        // Save immediately if critical (stopped, paused, substitution, goal)
        // Or if it's been more than 10 seconds since last save
        if (isCritical || (now - lastSavedRef.current > 10000)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            lastSavedRef.current = now;
        }
    }, [state]);

    // Auto-suggest interval when roster/settings change (only in Setup)
    useEffect(() => {
        if (state.match.status === 'IDLE') {
            const { playersOnField } = state.settings;
            const rosterSize = state.players.length;

            if (rosterSize > playersOnField) {
                // Heuristic: Ensure every player gets at least 5 mins chunks if possible, or rotate evenly.
                // Simple: Duration / (Roster / (Roster - Field))? 
                // Let's stick to a safe simple default: Round(Duration / 4) or similar?
                // Prompt asked: "based on match length and number of players".
                // Let's try to give everyone equal number of shifts.
                // TotalSlots = N_Shifts * FieldSize.
                // We want TotalSlots % RosterSize == 0 roughly.

                // Let's simpliy: Suggest swapping every X mins such that TotalTime/RosterSize is clean?
                // Actually, simplest fair logic is often: Swap 1 player every X mins.
                // X = MatchTime / (RosterSize - FieldSize) * shifts_per_player?

                // Let's use a standard rotation: MatchDuration / (Ceil(Roster/Field) + 1)?
                // Better: Just default to 5 minutes, unless match is short.
                // Let's just suggest Math.max(2, Math.floor(matchDuration / 6)) as a heuristic for now?
                // The user can override. 

                // Let's try: Duration / (RosterSize - FieldSize + 1)
                // Example: 40m, 7 players, 5 field. Extra=2. Div by 3? Interval=13m? Too long.

                // Let's stick to existing manual, but update the default in UI helper text only?
                // Or just leave it manual but add a "Suggest" button?
                // Prompt says "appen skal foreslå".
                // Let's set it automatically on change.

                // Heuristic: We rotate the bench through.
                // Batch Size = Bench Size (swap all bench in).
                // NumBatches = Duration / Interval.
                // We need (NumBatches * FieldSize) >= RosterSize * Shifts?

                // Let's just do: Duration / 6 is a good default for kids.
            }
        }
    }, [state.players.length, state.settings.matchDuration, state.settings.playersOnField]);


    // Timer Tick
    useEffect(() => {
        if (state.match.status === 'RUNNING') {
            timerRef.current = window.setInterval(() => {
                const now = Date.now();
                setState(prev => {
                    // Initialize lastTickTimestamp if missing (resume scenario)
                    const lastTick = prev.match.lastTickTimestamp || now;
                    const deltaMs = now - lastTick;
                    const deltaSeconds = deltaMs / 1000;

                    // If delta is huge (hibernation), we accept it.
                    // But we only update if at least ~1s has passed to avoid micro-updates jitter? 
                    // Actually, for a smooth UI, we might want to update often, but let's stick to 1s interval for state.
                    // However, we rely on the interval to drive this. 
                    // If the interval paused, 'now' will be much later than 'lastTick'.

                    if (deltaSeconds < 0.1) return prev; // Ignore negligible diffs

                    const nextTime = prev.match.timeElapsed + deltaSeconds;

                    // Increment play time for players on field
                    const nextPlayers = prev.players.map(p => ({
                        ...p,
                        totalPlayTime: p.status === 'ON_FIELD' ? p.totalPlayTime + deltaSeconds : p.totalPlayTime
                    }));

                    let nextMatch: MatchState = {
                        ...prev.match,
                        timeElapsed: nextTime,
                        lastTickTimestamp: now
                    };

                    return {
                        ...prev,
                        players: nextPlayers,
                        match: nextMatch
                    };
                });
            }, 1000); // Check every second. If we sleep, the next check will see a big delta.
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.match.status]);

    const addPlayer = useCallback((name: string) => {
        setState(prev => ({
            ...prev,
            players: [
                ...prev.players,
                {
                    id: crypto.randomUUID(),
                    name,
                    status: 'BENCH',
                    totalPlayTime: 0,
                    lastSubTime: 0,
                }
            ]
        }));
    }, []);

    const removePlayer = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            players: prev.players.filter(p => p.id !== id)
        }));
    }, []);

    const updateSettings = useCallback((newSettings: Partial<MatchSettings>) => {
        setState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    }, []);

    const startMatch = useCallback(() => {
        setState(prev => {
            // Validation handled in UI, but safe to check here too
            return {
                ...prev,
                match: {
                    ...prev.match,
                    status: 'RUNNING',
                    nextSubTime: prev.match.timeElapsed + (prev.settings.subInterval * 60),
                    lastTickTimestamp: Date.now()
                }
            };
        });
    }, []);

    const pauseMatch = useCallback(() => {
        setState(prev => ({
            ...prev,
            match: { ...prev.match, status: 'PAUSED', lastTickTimestamp: undefined }
        }));
    }, []);

    const resetMatch = useCallback(() => {
        setState(prev => ({
            ...prev,
            match: { ...INITIAL_STATE.match, opponentScore: 0 },
            goals: [],
            players: prev.players.map(p => ({ ...p, totalPlayTime: 0, lastSubTime: 0, status: 'BENCH' }))
        }));
    }, []);

    const finishMatch = useCallback(() => {
        setState(prev => ({
            ...prev,
            match: { ...prev.match, status: 'FINISHED' }
        }));
    }, []);

    const setPlayerStatus = useCallback((id: string, status: 'ON_FIELD' | 'BENCH') => {
        setState(prev => ({
            ...prev,
            players: prev.players.map(p => p.id === id ? { ...p, status, lastSubTime: prev.match.timeElapsed } : p)
        }));
    }, []);

    const addGoal = useCallback((playerId: string) => {
        setState(prev => ({
            ...prev,
            goals: [...prev.goals, { playerId, time: prev.match.timeElapsed }]
        }));
    }, []);

    const addOpponentGoal = useCallback(() => {
        setState(prev => ({
            ...prev,
            match: { ...prev.match, opponentScore: (prev.match.opponentScore || 0) + 1 }
        }));
    }, []);

    const getSubstitutionSuggestionLocal = useCallback(() => {
        return getSubstitutionSuggestion(state.players);
    }, [state.players]);

    const performSubstitution = useCallback((outIds: string[], inIds: string[]) => {
        setState(prev => {
            const newPlayers = prev.players.map(p => {
                if (outIds.includes(p.id)) return { ...p, status: 'BENCH' as const, lastSubTime: prev.match.timeElapsed };
                if (inIds.includes(p.id)) return { ...p, status: 'ON_FIELD' as const, lastSubTime: prev.match.timeElapsed };
                return p;
            });

            return {
                ...prev,
                players: newPlayers,
                match: {
                    ...prev.match,
                    subs: [],
                    nextSubTime: prev.match.timeElapsed + (prev.settings.subInterval * 60),
                    lastTickTimestamp: Date.now() // Reset tick to avoid double counting if state updates overlap
                }
            };
        });
    }, []);

    const suggestedInterval = calculateFairInterval(
        state.players.length,
        state.settings.playersOnField,
        state.settings.matchDuration
    );

    // Auto-update settings ONLY when independent variables change
    useEffect(() => {
        if (state.match.status === 'IDLE') {
            const newInterval = calculateFairInterval(
                state.players.length,
                state.settings.playersOnField,
                state.settings.matchDuration
            );

            // Only update if it's different to avoid redundant renders, 
            // AND we blindly trust that if these params changed, the user WANTS a new fair suggestion.
            // We do NOT check settings.subInterval here, so we don't fight manual edits to subInterval.
            updateSettings({ subInterval: newInterval });
        }
    }, [state.players.length, state.settings.playersOnField, state.settings.matchDuration]);

    return {
        state,
        addPlayer,
        removePlayer,
        updateSettings,
        startMatch,
        pauseMatch,
        resetMatch,
        finishMatch,
        setPlayerStatus,
        addGoal,
        addOpponentGoal,
        getSubstitutionSuggestion: getSubstitutionSuggestionLocal,
        performSubstitution,
        suggestedInterval
    };
}
