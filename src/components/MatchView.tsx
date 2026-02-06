import { useState } from 'react';
import { Pause, Play, UserMinus, UserPlus, StopCircle, ArrowRightLeft, Shield, Swords } from 'lucide-react';
import type { MatchState, Player, MatchSettings } from '../logic/types';

interface MatchViewProps {
    match: MatchState;
    players: Player[];
    settings: MatchSettings;
    goals: { playerId: string; time: number }[];
    onPause: () => void;
    onResume: () => void;
    onEndMatch: () => void;
    onGoal: (playerId: string) => void;
    onOpponentGoal: () => void;
    onPerformSub: (outIds: string[], inIds: string[]) => void;
    onManualSub: (playerId: string, targetStatus: 'ON_FIELD' | 'BENCH') => void;
}

export function MatchView({
    match, players, settings, goals,
    onPause, onResume, onEndMatch, onGoal, onOpponentGoal,
    onPerformSub, onManualSub
}: MatchViewProps) {

    const [showGoalSelector, setShowGoalSelector] = useState(false);

    const timeDisplay = (seconds: number) => {
        const totalSeconds = Math.floor(seconds);
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const remaining = (settings.matchDuration * 60) - match.timeElapsed;
    const timeToSub = match.nextSubTime - match.timeElapsed;
    const isSubWarning = timeToSub <= 30 && timeToSub > 0;
    const isSubDue = timeToSub <= 0;

    const onField = players.filter(p => p.status === 'ON_FIELD');
    const onBench = players.filter(p => p.status === 'BENCH').sort((a, b) => a.lastSubTime - b.lastSubTime);

    const numToSwap = Math.max(1, Math.min(onBench.length, onField.length));

    const handleSubAction = () => {
        const candidatesOut = [...onField].sort((a, b) => b.totalPlayTime - a.totalPlayTime).slice(0, numToSwap);
        const candidatesIn = [...onBench].slice(0, numToSwap);

        if (candidatesIn.length > 0 && candidatesOut.length > 0) {
            onPerformSub(candidatesOut.map(p => p.id), candidatesIn.map(p => p.id));
        }
    };

    const currentScore = goals.length;
    const opponentScore = match.opponentScore || 0;
    const isPaused = match.status === 'PAUSED';

    return (
        <div className={`p-4 min-h-screen flex flex-col pb-36 transition-all duration-500 ${isSubWarning ? 'bg-yellow-950/20 shadow-[inset_0_0_100px_rgba(234,179,8,0.2)]' : ''}`}>

            {/* Scoreboard */}
            <div className={`glass-card p-4 flex flex-col gap-4 mb-6 relative overflow-hidden transition-all duration-300 ${isSubWarning ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : ''}`}>
                {isSubWarning && <div className="absolute inset-0 bg-yellow-500/20 animate-flash-warning pointer-events-none" />}

                {/* Top Row: Timer & Controls */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`text-5xl font-mono font-bold tracking-tighter ${remaining <= 0 ? 'text-red-500' : 'text-white'}`}>
                            {timeDisplay(remaining > 0 ? remaining : 0)}
                        </div>
                    </div>
                    <div>
                        {match.status === 'RUNNING' ? (
                            <button onClick={onPause} className="bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full shadow-lg active:scale-95 transition-all">
                                <Pause className="w-6 h-6 fill-current" />
                            </button>
                        ) : (
                            <button onClick={onResume} className="bg-green-500 hover:bg-green-400 text-black p-3 rounded-full shadow-lg active:scale-95 transition-all animate-pulse">
                                <Play className="w-6 h-6 fill-current" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Score Split */}
                <div className="flex items-center justify-between bg-slate-950/30 rounded-xl p-2 gap-4">
                    {/* Us */}
                    <div className="flex-1 flex justify-between items-center pl-2">
                        <span className="font-bold text-blue-400 tracking-wider">US</span>
                        <span className="text-4xl font-black text-white">{currentScore}</span>
                    </div>

                    <div className="h-8 w-px bg-slate-700"></div>

                    {/* Them */}
                    <div className="flex-1 flex justify-between items-center pr-2">
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-black text-red-400">{opponentScore}</span>
                        </div>
                        <span className="font-bold text-red-900/50 tracking-wider">THEM</span>
                    </div>
                </div>
            </div>

            {/* Visual Pitch */}
            <div className="flex-1 space-y-4">
                {/* On Field Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end px-2">
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-4 h-4" /> On Pitch ({onField.length})
                        </h3>
                        <span className="text-xs text-slate-500">Tap to sub out</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {onField.map(p => (
                            <button
                                key={p.id}
                                onClick={() => onManualSub(p.id, 'BENCH')}
                                className="glass bg-green-900/10 border-green-500/20 p-3 rounded-xl flex justify-between items-center group active:scale-95 transition-all text-left"
                            >
                                <div className="min-w-0">
                                    <span className="font-bold block text-white truncate group-hover:text-green-300 transition-colors">{p.name}</span>
                                    <span className="text-xs text-green-400/70 font-mono">
                                        {(p.totalPlayTime / 60).toFixed(0)}m
                                    </span>
                                </div>
                                <UserMinus className="w-5 h-5 text-green-500/30 group-hover:text-red-400 transition-colors shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bench Section */}
                <div className="space-y-2 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-end px-2">
                        <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                            <Swords className="w-4 h-4" /> Bench ({onBench.length})
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {onBench.map((p, i) => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    if (onField.length < settings.playersOnField) {
                                        onManualSub(p.id, 'ON_FIELD');
                                    }
                                }}
                                disabled={onField.length >= settings.playersOnField}
                                className={`glass p-3 rounded-xl flex justify-between items-center group transition-all text-left relative overflow-hidden ${i === 0 ? 'bg-green-950/20 ring-1 ring-green-500/30' : 'bg-slate-800/40'} ${onField.length >= settings.playersOnField ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                            >
                                {i === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold block truncate transition-colors ${i === 0 ? 'text-green-400 group-hover:text-green-300' : 'text-slate-300 group-hover:text-white'}`}>{p.name}</span>
                                        {i === 0 && <span className="bg-green-500 text-[10px] text-black font-black px-1 rounded animate-pulse">NEXT</span>}
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs text-slate-500 font-mono truncate">
                                            Rest: {timeDisplay(match.timeElapsed - p.lastSubTime)}
                                        </span>
                                        <span className="text-xs text-orange-400/70 font-mono shrink-0">
                                            {(p.totalPlayTime / 60).toFixed(0)}m
                                        </span>
                                    </div>
                                </div>
                                <UserPlus className={`w-5 h-5 transition-colors shrink-0 ${onField.length >= settings.playersOnField ? 'text-slate-700' : 'text-slate-600 group-hover:text-green-400'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-30">
                <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowGoalSelector(true)}
                        className="btn-primary flex items-center justify-center gap-2 shadow-blue-900/20"
                    >
                        <div className="bg-white text-blue-600 font-black rounded w-6 h-6 flex items-center justify-center text-xs">+</div>
                        GOAL
                    </button>

                    <button
                        onClick={handleSubAction}
                        className={`
                    relative overflow-hidden rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center py-2 cursor-pointer
                    ${isSubDue
                                ? 'bg-gradient-to-tr from-red-600 to-orange-600 text-white animate-pulse shadow-orange-900/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}
                `}
                    >
                        <div className="flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5" />
                            <span>{isSubDue ? 'SUB NOW' : 'Next Sub'}</span>
                        </div>
                        {!isSubDue && <span className="text-xs font-mono opacity-70">{timeDisplay(Math.max(0, timeToSub))}</span>}
                    </button>
                </div>
            </div>

            {/* Goal Selector */}
            {showGoalSelector && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-4 bg-slate-800/50 font-bold text-center border-b border-slate-700 text-lg text-white">Who Scored? ⚽️</div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {onField.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => { onGoal(p.id); setShowGoalSelector(false); }}
                                        className="bg-slate-800 hover:bg-blue-600 p-4 rounded-xl font-bold text-lg text-white transition-colors border border-slate-700 hover:border-blue-500"
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>

                            <div className="border-t border-slate-700 pt-4">
                                <button
                                    onClick={() => { onOpponentGoal(); setShowGoalSelector(false); }}
                                    className="w-full bg-red-900/20 hover:bg-red-600 border border-red-500/30 text-red-200 hover:text-white p-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Shield className="w-5 h-5" /> Opponent Goal
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowGoalSelector(false)}
                            className="w-full bg-slate-950 text-slate-400 py-4 font-medium hover:text-white transition-colors border-t border-slate-800"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* End Match Button */}
            {isPaused && (
                <div className="fixed top-32 right-4 animate-slide-up z-20">
                    <button onClick={onEndMatch} className="bg-red-500/10 hover:bg-red-500 border border-red-500/50 text-red-400 hover:text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-2 transition-all shadow-xl">
                        <StopCircle className="w-4 h-4" /> End Match
                    </button>
                </div>
            )}
        </div>
    );
}
