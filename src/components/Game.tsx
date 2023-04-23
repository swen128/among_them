import React, { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { LanguageModel } from '../api/language_model';
import { buildPrompt } from '../domain/prompt';
import { BotPlayer, ChattingState, initialState, isPlayerTurn, withNewChatMessage } from '../domain/state';
import Chat from './Chat';

interface Props {
    languageModel: LanguageModel;
}

const Game: React.FC<Props> = ({ languageModel }) => {
    const userName = "Tom";
    const botPlayers: BotPlayer[] = [
        { type: "bot", name: "Bob", characterDescription: "A friendly guy" },
        { type: "bot", name: "Alice", characterDescription: "A cool woman" },
    ];

    const [state, setState] = useState(initialState(userName, botPlayers));

    const [llmState, askLlm] = useAsyncFn(async (state: ChattingState) => {
        const prompt = buildPrompt(state);
        const response = await languageModel.ask(prompt);
        setState(withNewChatMessage(state, response));
    }, [languageModel]);

    useEffect(() => {
        if (!llmState.loading && state.phase === "chat" && !isPlayerTurn(state)) {
            askLlm(state).then();
        }
    }, [askLlm, state]);

    const onChatSubmit = (text: string) => {
        setState(state =>
            state.phase === "chat"
                ? withNewChatMessage(state, text)
                : state
        )
    };

    return (
        <div className="w-full max-w-7xl h-full border p-4 shadow-lg rounded">
            {state.phase === "chat" && <Chat state={state} onSubmit={onChatSubmit} />}
        </div>
    );
};

export default Game;
