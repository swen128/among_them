import { Player } from "./player";

export interface VotedResult {
    voted: Player;
    reason: string;
}

export type VoteProgress = Map<string, VotedResult | undefined>;

export type VoteResults = Map<string, VotedResult>;

export function emptyVotes(players: Player[]): VoteProgress {
    return new Map(players.map(p => [p.name, undefined]));
}

export function isVoteComplete(progress: VoteProgress): progress is VoteResults {
    return [...progress.values()].every(vote => vote !== undefined);
}
