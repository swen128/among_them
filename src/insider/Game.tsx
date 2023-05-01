import React, { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { LanguageModel } from '../api';
import Chat from './Chat';
import { gameMasterPrompt } from './gm_prompt';
import { parseResponse, qaPhasePrompt } from './prompt';
import { AnswerState, BotPlayer, QuestionState, initialState, isPlayerTurn, withNewAnswer, withNewQuestion } from './state';

interface Props {
    languageModel: LanguageModel;
}

export const Game: React.FC<Props> = ({ languageModel }) => {
    const userName = "Tom";
    const botPlayers: BotPlayer[] = [
        { type: "bot", name: "Bob", characterDescription: "A friendly guy" },
        { type: "bot", name: "Alice", characterDescription: "A cool woman" },
    ];

    const [state, setState] = useState(initialState(userName, botPlayers));

    const [llmState, askLlm] = useAsyncFn(async (state: QuestionState) => {
        const prompt = qaPhasePrompt(state);
        const response = await languageModel.ask(prompt);
        const result = parseResponse(response);

        if (!result.success) {
            console.error("Failed to parse response", result);
            return;
        }

        console.log(`${state.turn.name}'s thoughts: ${result.data.thoughts}`)

        setState(withNewQuestion(state, result.data.question));
    }, [languageModel]);

    useEffect(() => {
        if (!llmState.loading && state.phase === "question" && !isPlayerTurn(state)) {
            askLlm(state).then();
        }
    }, [askLlm, state]);

    const [gameMasterState, askGameMaster] = useAsyncFn(async (state: AnswerState) => {
        const prompt = gameMasterPrompt(state.keyword, state.lastQuestion);
        const response = await languageModel.ask(prompt);

        setState(withNewAnswer(state, response));
    }, [languageModel]);

    useEffect(() => {
        if (!gameMasterState.loading && state.phase === "answer") {
            askGameMaster(state).then();
        }
    }, [askGameMaster, state]);

    const onChatSubmit = (text: string) => {
        setState(state =>
            state.phase === "question"
                ? withNewQuestion(state, text)
                : state
        )
    };

    return (
        <div className="w-full max-w-7xl h-full border p-4 shadow-lg rounded">
            <div>You are the insider. Keyword: {state.keyword}</div>
            {(state.phase === "question" || state.phase === "answer") && <Chat log={state.chatLog} onSubmit={onChatSubmit} />}
        </div>
    );
};
