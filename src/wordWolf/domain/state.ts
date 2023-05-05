import { ChatMessage } from "./chatMessage";
import { Player } from "./player";
import { VoteProgress, VoteResults, VotedResult, emptyVotes, isVoteComplete } from "./vote";

export type GameState = ChattingState | VotingState | FinishedState;

export interface ChattingState extends BaseGameState {
    phase: "chat";
    turn: Player;
    remainingTurns: number;
}

export interface VotingState extends BaseGameState {
    phase: "vote";
    votes: VoteProgress;
}

export interface FinishedState extends BaseGameState {
    phase: "finished";
    votes: VoteResults;
}

interface BaseGameState {
    chatLog: ChatMessage[];
    players: Player[];
    commonWord: string;
    wolfWord: string;
    wolf: Player;
}

export function initialState(options: {
    players: Player[],
    wolf: Player,
    wolfWord: string,
    commonWord: string,
}): ChattingState {
    return {
        ...options,
        chatLog: [],
        phase: "chat",
        turn: options.players[0],
        remainingTurns: options.players.length * 4,
    };
}

export function withNewChatMessage(state: ChattingState, text: string): ChattingState | VotingState {
    const chatLog = [...state.chatLog, { sender: state.turn, text }];
    const remainingTurns = state.remainingTurns - 1;

    return remainingTurns <= 0
        ? { ...state, chatLog, phase: "vote", votes: emptyVotes(state.players) }
        : { ...state, chatLog, turn: nextPlayer(state), remainingTurns };
}

export function withNewVote(state: VotingState, voter: Player, vote: VotedResult): VotingState | FinishedState {
    const votes = new Map(state.votes);
    votes.set(voter.name, vote);

    return isVoteComplete(votes)
        ? { ...state, phase: "finished", votes }
        : { ...state, votes };
}

function nextPlayer(state: ChattingState): Player {
    const players = state.players;
    const nextIndex = (players.indexOf(state.turn) + 1) % players.length;
    return players[nextIndex];
}
