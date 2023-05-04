interface BaseGameState {
    chatLog: ChatMessage[];
    players: Player[];
    commonWord: string;
    wolfWord: string;
    wolf: Player;
}

export interface ChattingState extends BaseGameState {
    phase: "chat";
    turn: Player;
    remainingTurns: number;
}

export interface VotingState extends BaseGameState {
    phase: "vote";
    votes: Map<string, VotedResult | undefined>;
}

export interface VotedResult {
    voted: Player;
    reason: string;
}

function votingState(state: ChattingState): VotingState {
    const votes = new Map<string, VotedResult | undefined>();
    for (const player of state.players) {
        votes.set(player.name, undefined);
    }
    return { ...state, phase: "vote", votes };
}

export type GameState = ChattingState | VotingState;

export interface ChatMessage {
    sender: Player;
    text: string;
}

export type Player = HumanPlayer | BotPlayer;

export interface HumanPlayer {
    type: "human";
    name: string;
}

export interface BotPlayer {
    type: "bot";
    name: string;
    characterDescription: string;
}

export function isBot(player: Player): player is BotPlayer {
    return player.type === "bot";
}

export function isPlayerTurn(state: ChattingState): boolean {
    return state.turn.type === "human";
}

function nextPlayer(state: ChattingState): Player {
    const players = state.players;
    const nextIndex = (players.indexOf(state.turn) + 1) % players.length;
    return players[nextIndex];
}

export function withNewChatMessage(state: ChattingState, text: string): ChattingState | VotingState {
    const chatLog = [...state.chatLog, { sender: state.turn, text }];
    const remainingTurns = state.remainingTurns - 1;

    return remainingTurns <= 0
        ? { ...votingState(state), chatLog }
        : { ...state, chatLog, turn: nextPlayer(state), remainingTurns: remainingTurns };
}

export function playerWord(state: GameState, player: Player): string {
    return player.name === state.wolf.name ? state.wolfWord : state.commonWord;
}

export function isVoteComplete(state: GameState): boolean {
    return state.phase === "vote" &&
        [...state.votes.values()].every(voted => voted !== undefined);
}

export function isBotVoteComplete(state: GameState): boolean {
    return state.phase === "vote" &&
        allVotes(state).every(({ voter, result }) => !isBot(voter) || result !== undefined);
}

export function isHumanVoteComplete(state: GameState): boolean {
    return state.phase === "vote" &&
        allVotes(state).every(({ voter, result }) => isBot(voter) || result !== undefined);
}

function allVotes(state: VotingState): { voter: Player, result: VotedResult | undefined }[] {
    return [...state.votes.entries()]
        .map(([voterName, result]) => ({
            voter: state.players.find(p => p.name === voterName)!,
            result,
        }));
}

export function votes(state: VotingState): { voter: Player, result: VotedResult }[] {
    return [...state.votes.entries()]
        .filter(([, result]) => result !== undefined)
        .map(([voterName, result]) => ({
            voter: state.players.find(p => p.name === voterName)!,
            result: result!
        }));
}

export function withNewVote(state: VotingState, voter: Player, vote: VotedResult): VotingState {
    const votes = new Map(state.votes);
    votes.set(voter.name, vote);
    return { ...state, votes };
}

export function counts(state: VotingState): Map<Player, number> {
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

export function executedPlayers(state: VotingState): Player[] {
    const cnts = counts(state);
    const maxCount = Math.max(...cnts.values());

    return [...cnts.entries()]
        .filter(([, count]) => count === maxCount)
        .map(([player]) => player);
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
