import React, { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { LanguageModel } from '../api/language_model';
import Chat from './Chat';
import Vote from './Vote';
import { buildPrompt, parseResponse } from './prompt';
import { promptVote } from './prompt_voting';
import { BotPlayer, ChattingState, GameState, HumanPlayer, Player, VotingState, humanPlayerWord, initialState, isBotVoteComplete, isPlayerTurn, isVoteComplete, withNewChatMessage, withNewVote } from './state';

interface Props {
    languageModel: LanguageModel;
}

const Game: React.FC<Props> = ({ languageModel }) => {
    const userName = "Tom";
    const [state, setState] = useState(initial(userName));

    const [llmState, askLlm] = useAsyncFn(async (state: ChattingState) => {
        const prompt = buildPrompt(state);
        const response = await languageModel.ask(prompt);
        const result = parseResponse(response);

        if (!result.success) {
            console.error("Failed to parse response", result);
            return;
        }

        console.log(`${state.turn.name}'s thoughts: ${result.data.thoughts}`)

        setState(withNewChatMessage(state, result.data.say));
    }, [languageModel]);

    useEffect(() => {
        if (!llmState.loading && state.phase === "chat" && !isPlayerTurn(state)) {
            askLlm(state).then();
        }
    }, [askLlm, state]);

    const [voteState, askVotes] = useAsyncFn(async (state: VotingState) => {
        const maxRetries = 3;
        const f = promptVote(languageModel, maxRetries, state);

        const promises = state.botPlayers.map(async (voter) => {
            const voted = await f(voter);
            setState(state => withNewVote(state as VotingState, voter, voted));
        });
        await Promise.all(promises);
    }, [languageModel]);

    useEffect(() => {
        if (!voteState.loading && state.phase === "vote" && !isBotVoteComplete(state)) {
            askVotes(state).then();
        }
    }, [askVotes, state, voteState]);

    const onChatSubmit = (text: string) => {
        setState(state =>
            state.phase === "chat"
                ? withNewChatMessage(state, text)
                : state
        )
    };

    const onVoteSubmit = (voted: Player) => {
        if (state.phase !== "vote" || isVoteComplete(state)) return;
        setState(withNewVote(state, state.humanPlayer, voted));
    };

    return (
        <div className="w-full max-w-7xl h-full border p-4 shadow-lg rounded">
            <div>Your word: {humanPlayerWord(state)}</div>
            {state.phase === "chat" && <Chat state={state} onSubmit={onChatSubmit} />}
            {state.phase === "vote" && <Vote state={state} onSubmit={onVoteSubmit} />}
        </div>
    );
};

function initial(userName: string): GameState {
    const humanPlayer: HumanPlayer = { type: "human", name: userName };
    const botPlayers: BotPlayer[] = [
        { type: "bot", name: "Bob", characterDescription: "A friendly guy" },
        { type: "bot", name: "Alice", characterDescription: "A cool woman" },
    ];
    const players = [...botPlayers, humanPlayer];
    const werewolf = players[Math.floor(Math.random() * players.length)];
    return initialState(humanPlayer, botPlayers, werewolf);
}

export default Game;
