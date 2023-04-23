interface BaseGameState {
    chatLog: ChatMessage[];
    humanPlayer: HumanPlayer;
    botPlayers: BotPlayer[];
    keyword: string;
    maxTurns: number;
}

export interface QuestionState extends BaseGameState {
    phase: "question";
    turn: Player;
}

export interface AnswerState extends BaseGameState {
    phase: "answer";
    turn: Player;
    lastQuestion: string;
}

export interface VotingState extends BaseGameState {
    phase: "vote";
}

export type GameState = QuestionState | AnswerState | VotingState;

export interface ChatMessage {
    sender: Player | GameMaster;
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

export interface GameMaster {
    type: "game_master";
    name: "Game Master";
}

const gameMaster: GameMaster = { type: "game_master", name: "Game Master" };

export function isPlayerTurn(state: QuestionState): boolean {
    return state.turn.type === "human";
}

function nextPlayer(state: AnswerState): Player {
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

export function withNewQuestion(state: QuestionState, text: string): AnswerState {
    const message = { sender: state.turn, text };

    return {
        ...state,
        phase: "answer",
        chatLog: [...state.chatLog, message],
        lastQuestion: message.text,
    };
}

export function withNewAnswer(state: AnswerState, text: string): QuestionState {
    const message = { sender: gameMaster, text };

    return {
        ...state,
        phase: "question",
        chatLog: [...state.chatLog, message],
        turn: nextPlayer(state),
    };
}

export function initialState(humanPlayerName: string, botPlayers: BotPlayer[]): GameState {
    return {
        chatLog: [],
        humanPlayer: { type: "human", name: humanPlayerName },
        botPlayers,
        phase: "question",
        turn: botPlayers[0],
        keyword: "Minecraft",
        maxTurns: 10,
    };
}
