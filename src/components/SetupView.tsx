import React, { useState } from 'react';
import { Plus, Users, Clock, Play, Trash2, UserCheck, UserMinus } from 'lucide-react';
import type { MatchSettings, Player } from '../logic/types';

interface SetupViewProps {
    players: Player[];
    settings: MatchSettings;
    suggestedInterval: number;
    onAddPlayer: (name: string) => void;
    onRemovePlayer: (id: string) => void;
    onUpdateSettings: (settings: Partial<MatchSettings>) => void;
    onStartMatch: () => void;
    onSetStatus: (id: string, status: 'ON_FIELD' | 'BENCH') => void;
}

export function SetupView({
    players, settings, suggestedInterval,
    onAddPlayer, onRemovePlayer, onUpdateSettings, onStartMatch, onSetStatus
}: SetupViewProps) {
    const [newName, setNewName] = useState('');

    // Auto-fill suggested interval if the user hasn't heavily customized it?
    // Let's just use it as a guideline or auto-set it when roster/settings change.
    // Actually, better to just let the parent hook Update it, OR show it as "Recommended".
    // Let's autofill it on load if it's suspicious? No, explicit is better.
    // Let's just show a "Use Recommended" button.

    const startersCount = players.filter(p => p.status === 'ON_FIELD').length;
    const isRosterValid = startersCount === settings.playersOnField;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onAddPlayer(newName.trim());
            setNewName('');
        }
    };

    return (
        <div className="p-6 space-y-8 animate-slide-up pb-32">
            <div className="text-center space-y-2 mt-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                    Fair Play Coach
                </h1>
                <p className="text-slate-400 font-medium">Setup your squad & match</p>
            </div>

            {/* Settings Card */}
            <div className="glass-card p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-3 text-blue-400">
                    <Clock className="w-6 h-6" /> Match Settings
                </h2>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-500">Duration</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.matchDuration}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => onUpdateSettings({ matchDuration: parseInt(e.target.value) || 20 })}
                                className="input-field pr-12 font-mono text-2xl font-bold text-white text-center"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">MIN</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Field Size</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.playersOnField}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => onUpdateSettings({ playersOnField: parseInt(e.target.value) || 5 })}
                                className="input-field font-mono text-2xl font-bold text-white text-center ring-2 ring-blue-500/20"
                            />
                        </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs uppercase tracking-wider font-bold text-slate-500">Sub Interval</label>
                            <button
                                onClick={() => onUpdateSettings({ subInterval: suggestedInterval })}
                                className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
                            >
                                Use Recommended ({suggestedInterval}m)
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.subInterval}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => onUpdateSettings({ subInterval: parseInt(e.target.value) || 5 })}
                                className="input-field pr-12 font-mono text-2xl font-bold text-white text-center"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">MIN</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roster Card */}
            <div className="glass-card p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-green-400">
                        <Users className="w-6 h-6" /> Roster
                    </h2>
                    <div className={`px-2 py-1 rounded text-xs font-bold font-mono transition-colors ${isRosterValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400 animate-pulse'}`}>
                        {startersCount} / {settings.playersOnField} STARTERS
                    </div>
                </div>

                <form onSubmit={handleAdd} className="flex gap-2">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Add player..."
                        className="input-field"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors">
                        <Plus className="w-6 h-6" />
                    </button>
                </form>

                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {players.map(p => {
                        const isStarter = p.status === 'ON_FIELD';
                        return (
                            <li key={p.id} className={`p-3 rounded-xl flex justify-between items-center animate-slide-up transition-all ${isStarter ? 'bg-green-900/20 border border-green-500/30' : 'bg-slate-800/50 border border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            if (!isStarter && startersCount >= settings.playersOnField) return; // Prevent adding if full
                                            onSetStatus(p.id, isStarter ? 'BENCH' : 'ON_FIELD')
                                        }}
                                        disabled={!isStarter && startersCount >= settings.playersOnField}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isStarter
                                            ? 'bg-green-500 text-black hover:bg-green-400'
                                            : startersCount >= settings.playersOnField
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                            }`}
                                    >
                                        {isStarter ? <UserCheck className="w-5 h-5" /> : <UserMinus className="w-5 h-5" />}
                                    </button>
                                    <span className={`font-bold text-lg ${isStarter ? 'text-white' : 'text-slate-400'}`}>{p.name}</span>
                                </div>
                                <button onClick={() => onRemovePlayer(p.id)} className="text-slate-600 hover:text-red-400 transition-colors p-2">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </li>
                        );
                    })}
                    {players.length === 0 && (
                        <div className="text-center py-8 text-slate-500 italic border-2 border-dashed border-slate-700 rounded-xl">
                            Add players to start
                        </div>
                    )}
                </ul>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={onStartMatch}
                        disabled={!isRosterValid}
                        className="w-full btn-primary py-4 text-xl flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        {isRosterValid ? (
                            <>Start Match <Play className="w-5 h-5 fill-current" /></>
                        ) : (
                            <span className="text-base">Assign Exactly {settings.playersOnField} Starters</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
