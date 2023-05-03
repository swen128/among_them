import React from 'react';
import { LanguageModel } from '../api';
import Chat from './Chat';
import Vote from './Vote';
import { useSinglePlayerGame } from './hooks';
import { playerWord } from './state';

interface Props {
    languageModel: LanguageModel;
}

export const Game: React.FC<Props> = ({ languageModel }) => {
    const userName = "Tom";
    const { state, submitChat, submitVote } = useSinglePlayerGame(languageModel, userName);

    return (
        <div className="w-full max-w-7xl h-full border p-4 shadow-lg rounded">
            <div>Your word: {playerWord(state, state.humanPlayer)}</div>
            <div>Bob's word: {playerWord(state, state.players[0])}</div>
            <div>Alice's word: {playerWord(state, state.players[1])}</div>
            {state.phase === "chat" && <Chat state={state} onSubmit={submitChat} />}
            {state.phase === "vote" && <Vote state={state} onSubmit={submitVote} />}
        </div>
    );
};
