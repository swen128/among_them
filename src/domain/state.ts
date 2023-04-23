interface BaseGameState {
    chatLog: ChatMessage[];
    humanPlayer: HumanPlayer;
    botPlayers: BotPlayer[];
    commonWord: string;
    wolfWord: string;
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

function nextPlayer(state: ChattingState): Player {
    const { turn, botPlayers, humanPlayer } = state;

    switch (turn.type) {
        case "human":
            return botPlayers[0];
        case "bot": {
            const nextIndex = botPlayers.indexOf(turn) + 1;
            return nextIndex < botPlayers.length
                ? botPlayers[nextIndex]
                : humanPlayer;
        }
    }
}

export function withNewChatMessage(state: ChattingState, text: string): ChattingState {
    const message = { sender: state.turn, text };

    return {
        ...state,
        chatLog: [...state.chatLog, message],
        turn: nextPlayer(state),
    };
}

export function initialState(humanPlayerName: string, botPlayers: BotPlayer[]): GameState {
    return {
        chatLog: [],
        humanPlayer: { type: "human", name: humanPlayerName },
        botPlayers,
        phase: "chat",
        turn: botPlayers[0],
        commonWord: "Minecraft",
        wolfWord: "Terraria",
    };
}
