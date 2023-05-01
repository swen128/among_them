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
    votes: Map<Player, Player | undefined>;
}

function votingState(state: ChattingState): VotingState {
    const votes = new Map<Player, Player | undefined>();
    for (const player of state.players) {
        votes.set(player, undefined);
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
        [...state.votes.entries()]
            .filter(([voter]) => voter.type === "bot")
            .every(([, voted]) => voted !== undefined);
}

export function votes(state: VotingState): { voter: Player, voted: Player }[] {
    return [...state.votes.entries()]
        .filter(([, voted]) => voted !== undefined)
        .map(([voter, voted]) => ({ voter, voted: voted as Player }));
}

export function withNewVote(state: VotingState, voter: Player, voted: Player): VotingState {
    const votes = new Map(state.votes);
    votes.set(voter, voted);
    return { ...state, votes };
}

export function counts(state: VotingState): Map<Player, number> {
    const votedPlayers = [...state.votes.values()]
        .filter(voted => voted !== undefined) as Player[];

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

export function initialState(players: Player[], wolf: Player): ChattingState {
    return {
        chatLog: [],
        players,
        phase: "chat",
        turn: players[0],
        remainingTurns: players.length * 4,
        commonWord: "Minecraft",
        wolfWord: "bike",
        wolf,
    };
}
