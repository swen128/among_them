import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { LanguageModel } from "../api";
import { promptChat, promptVote } from './bot_brain';
import { BotPlayer, ChattingState, GameState, HumanPlayer, Player, VotedResult, VotingState, initialState, isBot, isBotVoteComplete, isPlayerTurn, isVoteComplete, withNewChatMessage, withNewVote } from './state';

function useGame(initialState: GameState) {
    const [state, setState] = useState(initialState);

    const submitChat = (text: string) => {
        setState(state => state.phase === "chat" ? withNewChatMessage(state, text) : state)
    };
    const submitVote = (voter: Player, vote: VotedResult) => {
        setState(state => state.phase === "vote" && !isVoteComplete(state)
            ? withNewVote(state, voter, vote)
            : state
        );
    };

    return { state, submitChat, submitVote };
}

export function useSinglePlayerGame(languageModel: LanguageModel, userName: string) {
    const humanPlayer: HumanPlayer = { type: "human", name: userName };
    const initialState = initial(humanPlayer);
    const { state, submitChat, submitVote } = useGame(initialState);

    const botPlayers = state.players.filter(isBot);

    const [llmState, submitBotChat] = useAsyncFn(async (state: ChattingState) => {
        const message = await promptChat_(languageModel, state);
        submitChat(message);
    }, [state]);

    useEffect(() => {
        if (!llmState.loading && state.phase === "chat" && !isPlayerTurn(state))
            submitBotChat(state);
    }, [state]);

    const [voteState, submitBotVotes] = useAsyncFn(async (state: VotingState) => {
        const promises = botPlayers.map(async (voter) => {
            const voted = await promptVote_(languageModel, state)(voter);
            submitVote(voter, voted);
        });
        await Promise.all(promises);
    }, [state]);

    useEffect(() => {
        if (!voteState.loading && state.phase === "vote" && !isBotVoteComplete(state))
            submitBotVotes(state);
    }, [state.phase]);

    const submitHumanChat = (text: string) => {
        if (state.phase === "chat" && isPlayerTurn(state)) submitChat(text);
    };
    const submitHumanVote = (voted: Player) => {
        submitVote(humanPlayer, { voted, reason: "" });
    };

    return {
        state: { ...state, humanPlayer },
        submitChat: submitHumanChat,
        submitVote: submitHumanVote
    };
}

function initial(humanPlayer: HumanPlayer): GameState {
    const botPlayers: BotPlayer[] = [
        { type: "bot", name: "Bob", characterDescription: "A confident, experienced Word Werewolf player" },
        { type: "bot", name: "Alice", characterDescription: "A confident, experienced Word Werewolf player" },
    ];
    const players = [...botPlayers, humanPlayer];
    const werewolf = players[Math.floor(Math.random() * players.length)];
    return initialState(players, werewolf);
}

const promptChat_ = async (languageModel: LanguageModel, state: ChattingState): Promise<string> => {
    try {
        const maxRetries = 3;
        const response = await retryUnsafe(maxRetries, () => promptChat(languageModel, state));

        console.log(`${state.turn.name}'s thoughts: ${response.thoughts}`);
        console.log(`${state.turn.name}'s guess of werewolf: ${response.mostLikelyGuess.werewolf}`);
        console.log(response);

        return response.say;
    } catch (e) {
        console.error(e);
        return "";
    }
}

const promptVote_ = (lm: LanguageModel, state: VotingState) =>
    async (voter: BotPlayer): Promise<VotedResult> => {
        const maxRetries = 3;
        const func = () => promptVote(lm, state, voter);
        const fallback = () => ({ voted: randomVote(state, voter), reason: "Random vote" });
        return retry(maxRetries, func, fallback);
    }

function randomVote(state: VotingState, voter: BotPlayer): Player {
    const players = state.players;
    const voterIndex = players.indexOf(voter);

    const i = Math.floor(Math.random() * players.length - 1);
    const votedIndex = i < voterIndex ? i : i + 1;

    return state.players[votedIndex];
}

function retry<T>(maxRetries: number, func: () => Promise<T>, fallback: () => T): Promise<T> {
    return func().catch(() => {
        if (maxRetries <= 0) return fallback();
        return retry(maxRetries - 1, func, fallback);
    });
}

function retryUnsafe<T>(maxRetries: number, func: () => Promise<T>): Promise<T> {
    return func().catch(e => {
        if (maxRetries <= 0) throw e;
        return retryUnsafe(maxRetries - 1, func);
    });
}
