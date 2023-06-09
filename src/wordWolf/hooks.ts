import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { LanguageModel } from "../api";
import { promptChat, promptVote } from './botBrain';
import { BotPlayer, ChattingState, GameState, HumanPlayer, Player, VotedResult, VotingState, initialState, isBot, isBotVoteComplete, isPlayerTurn, isVoteComplete, withNewChatMessage, withNewVote } from './domain';
import { getRandomWordPair } from './wordPairs';

function useGame(init: GameState) {
    const [state, setState] = useState(init);

    const submitChat = (text: string) => {
        setState(state => state.phase === "chat" ? withNewChatMessage(state, text) : state)
    };
    const submitVote = (voter: Player, vote: VotedResult) => {
        setState(state => state.phase === "vote" && !isVoteComplete(state)
            ? withNewVote(state, voter, vote)
            : state
        );
    };
    const restart = (state: ChattingState) => setState(state);

    return { state, submitChat, submitVote, restart };
}

export function useSinglePlayerGame(languageModel: LanguageModel, userName: string) {
    const humanPlayer: HumanPlayer = { type: "human", name: userName };
    const initialState = bootStrap(humanPlayer);
    const { state, submitChat, submitVote, restart } = useGame(initialState);

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
        submitVote: submitHumanVote,
        restart: () => restart(bootStrap(humanPlayer)),
    };
}

function bootStrap(humanPlayer: HumanPlayer): ChattingState {
    const botPlayers: BotPlayer[] = [
        { type: "bot", name: "tanaka", characterDescription: "砕けた口調のエセ関西弁で話す熟練ワード人狼プレイヤー" },
        { type: "bot", name: "sato", characterDescription: "砕けた口調のエセ関西弁で話す熟練ワード人狼プレイヤー" },
    ];
    const players = [...botPlayers, humanPlayer];
    const wolf = players[Math.floor(Math.random() * players.length)];
    const [wolfWord, commonWord] = getRandomWordPair();
    return initialState({ players, wolf, wolfWord, commonWord });
}

const promptChat_ = async (languageModel: LanguageModel, state: ChattingState): Promise<string> => {
    try {
        const maxRetries = 3;
        const response = await retryUnsafe(maxRetries, () => promptChat(languageModel, state));

        console.log(`${state.turn.name}'s thoughts: ${response.thoughts}`);
        console.log(`${state.turn.name}'s guess of werewolf: ${response.likelyWerewolf}`);
        console.log(response);

        return response.say;
    } catch (e) {
        console.error(e);
        return "";
    }
}

const promptVote_ = (lm: LanguageModel, state: VotingState) => async (voter: BotPlayer): Promise<VotedResult> => {
    const maxRetries = 3;
    const func = async () => {
        const response = await promptVote(lm, state, voter);
        
        console.log(`${voter.name}'s thoughts: ${response.reason}`);
        console.log(`${voter.name}'s vote: ${response.voted.name}`);

        return response;
    }
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
    return func().catch(e => {
        if (maxRetries <= 0) return fallback();
        console.warn(e);
        return retry(maxRetries - 1, func, fallback);
    });
}

function retryUnsafe<T>(maxRetries: number, func: () => Promise<T>): Promise<T> {
    return func().catch(e => {
        if (maxRetries <= 0) throw e;
        console.warn(e);
        return retryUnsafe(maxRetries - 1, func);
    });
}
