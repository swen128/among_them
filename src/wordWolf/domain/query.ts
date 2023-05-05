import { BotPlayer, Player } from "./player";
import { ChattingState, FinishedState, GameState, VotingState } from "./state";
import { VotedResult } from "./vote";

export function isBot(player: Player): player is BotPlayer {
    return player.type === "bot";
}

export function isPlayerTurn(state: ChattingState): boolean {
    return state.turn.type === "human";
}

export function playerWord(state: GameState, player: Player): string {
    return player.name === state.wolf.name ? state.wolfWord : state.commonWord;
}

export function isVoteComplete(state: VotingState): boolean {
    return state.phase === "vote" &&
        [...state.votes.values()].every(voted => voted !== undefined);
}

export function isBotVoteComplete(state: VotingState): boolean {
    return state.phase === "vote" &&
        allVotes(state).every(({ voter, result }) => !isBot(voter) || result !== undefined);
}

export function isHumanVoteComplete(state: VotingState): boolean {
    return state.phase === "vote" &&
        allVotes(state).every(({ voter, result }) => isBot(voter) || result !== undefined);
}

function allVotes(state: VotingState | FinishedState): { voter: Player, result: VotedResult | undefined }[] {
    return [...state.votes.entries()]
        .map(([voterName, result]) => ({
            voter: state.players.find(p => p.name === voterName)!,
            result,
        }));
}

export function votes(state: VotingState | FinishedState): { voter: Player, result: VotedResult }[] {
    return [...state.votes.entries()]
        .filter(([, result]) => result !== undefined)
        .map(([voterName, result]) => ({
            voter: state.players.find(p => p.name === voterName)!,
            result: result!
        }));
}

export function counts(state: VotingState | FinishedState): Map<Player, number> {
    const votedPlayers = [...state.votes.values()]
        .filter(result => result !== undefined)
        .map(result => result!.voted);

    const counts = new Map<Player, number>();
    for (const player of votedPlayers) {
        const count = counts.get(player) ?? 0;
        counts.set(player, count + 1);
    }
    return counts;
}

export function executedPlayers(state: FinishedState): Player[] {
    const cnts = counts(state);
    const maxCount = Math.max(...cnts.values());

    return [...cnts.entries()]
        .filter(([, count]) => count === maxCount)
        .map(([player]) => player);
}
