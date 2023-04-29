interface BaseGameState {
    chatLog: ChatMessage[];
    botPlayers: BotPlayer[];
    humanPlayer: HumanPlayer;
    commonWord: string;
    wolfWord: string;
    wolf: Player;
}

export interface ChattingState extends BaseGameState {
    phase: "chat";
    turn: Player;
}

export interface VotingState extends BaseGameState {
    phase: "vote";
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

export function isPlayerTurn(state: ChattingState): boolean {
    return state.turn.type === "human";
}

export function allPlayers(state: GameState): Player[] {
    return [...state.botPlayers, state.humanPlayer];
}

function nextPlayer(state: ChattingState): Player {
    const players = allPlayers(state);
    const nextIndex = (players.indexOf(state.turn) + 1) % players.length;
    return players[nextIndex];
}

export function withNewChatMessage(state: ChattingState, text: string): ChattingState {
    const message = { sender: state.turn, text };

    return {
        ...state,
        chatLog: [...state.chatLog, message],
        turn: nextPlayer(state),
    };
}

export function playerWord(state: GameState, player: Player): string {
    return player === state.wolf ? state.wolfWord : state.commonWord;
}

export function humanPlayerWord(state: GameState): string {
    return playerWord(state, state.humanPlayer);
}

export function initialState(humanPlayer: HumanPlayer, botPlayers: BotPlayer[], wolf: Player): GameState {
    return {
        chatLog: [],
        humanPlayer,
        botPlayers,
        phase: "chat",
        turn: botPlayers[0],
        commonWord: "Minecraft",
        wolfWord: "Terraria",
        wolf,
    };
}
