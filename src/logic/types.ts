export type PlayerStatus = 'ON_FIELD' | 'BENCH';

export interface Player {
    id: string;
    name: string;
    status: PlayerStatus;
    totalPlayTime: number; // in seconds
    lastSubTime: number; // match time (seconds) when they last changed status
}

export interface MatchSettings {
    matchDuration: number; // in minutes
    playersOnField: number;
    subInterval: number; // in minutes, calculated or manual
}

export interface MatchState {
    status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED';
    timeElapsed: number; // in seconds
    nextSubTime: number; // in seconds
    opponentScore: number;
    lastTickTimestamp?: number; // For diff calculation
    subs: SubstitutionProposal[];
    notificationSent?: boolean;
}

export interface SubstitutionProposal {
    out: string[]; // player IDs
    in: string[]; // player IDs
    reason: 'SCHEDULED' | 'FORCED';
}
