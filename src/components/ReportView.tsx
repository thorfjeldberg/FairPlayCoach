import { RotateCcw, Trophy, Clock, Medal } from 'lucide-react';
import type { Player } from '../logic/types';

interface ReportViewProps {
    players: Player[];
    goals: { playerId: string; time: number }[];
    opponentScore: number;
    onReset: () => void;
}

export function ReportView({ players, goals, opponentScore, onReset }: ReportViewProps) {
    const sortedPlayers = [...players].sort((a, b) => b.totalPlayTime - a.totalPlayTime);

    const formatTime = (seconds: number) => {
        const totalSeconds = Math.floor(seconds);
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${min}m ${sec}s`;
    };

    const getGoalCount = (pid: string) => goals.filter(g => g.playerId === pid).length;
    const topScorer = players.reduce((prev, current) => (getGoalCount(prev.id) > getGoalCount(current.id) ? prev : current));

    return (
        <div className="p-6 space-y-8 animate-slide-up pb-32">
            <div className="text-center pt-8 space-y-2">
                <div className="inline-block p-4 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-xl mb-4">
                    <Trophy className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-white">Match Complete</h1>
                <p className="text-slate-400">Great game! Here is the summary.</p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 text-center space-y-1">
                    <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Final Score</div>
                    <div className="text-4xl font-black text-white flex justify-center gap-4">
                        <span className="text-blue-400">{goals.length}</span>
                        <span className="text-slate-600">-</span>
                        <span className="text-red-400">{opponentScore}</span>
                    </div>
                </div>
                <div className="glass-card p-4 text-center space-y-1">
                    <div className="text-xs uppercase tracking-wider font-bold text-slate-500">M.V.P (Goals)</div>
                    <div className="text-lg font-bold text-white truncate">{getGoalCount(topScorer.id) > 0 ? topScorer.name : '-'}</div>
                    <div className="text-xs text-slate-500">{getGoalCount(topScorer.id)} Goals</div>
                </div>
            </div>

            {/* Stats Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 bg-slate-800/50 font-bold border-b border-slate-700 flex justify-between text-sm uppercase tracking-wider text-slate-400">
                    <span>Player</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Time</span>
                </div>
                <ul className="divide-y divide-slate-700/50">
                    {sortedPlayers.map((p, i) => (
                        <li key={p.id} className="p-4 flex justify-between items-center group hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-300">
                                    {i + 1}
                                </div>
                                <div>
                                    <span className="font-bold block text-lg group-hover:text-blue-400 transition-colors">{p.name}</span>
                                    {getGoalCount(p.id) > 0 && (
                                        <span className="inline-flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full mt-1">
                                            <Medal className="w-3 h-3" /> {getGoalCount(p.id)} Goal{getGoalCount(p.id) !== 1 && 's'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="font-mono text-xl font-bold text-slate-200">
                                {formatTime(p.totalPlayTime)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={onReset}
                        className="w-full btn-primary py-4 text-xl flex justify-center items-center gap-3"
                    >
                        <RotateCcw className="w-5 h-5" /> Start New Match
                    </button>
                </div>
            </div>
        </div>
    );
}
