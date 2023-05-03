import React from 'react';
import { OpenAiChat } from '../api';
import Chat from './Chat';
import Vote from './Vote';
import { useSinglePlayerGame } from './hooks';
import { playerWord } from './state';

interface Props {
    playerName: string;
    apiKey: string;
}

export const Game: React.FC<Props> = ({ apiKey, playerName }) => {
    const languageModel = new OpenAiChat(apiKey);
    const { state, submitChat, submitVote } = useSinglePlayerGame(languageModel, playerName);

    return (<>
        <div className="h-screen p-4">
            <div className="w-full max-w-7xl h-full border p-4 shadow-lg rounded">
                <div>Your word: {playerWord(state, state.humanPlayer)}</div>
                <div>Bob's word: {playerWord(state, state.players[0])}</div>
                <div>Alice's word: {playerWord(state, state.players[1])}</div>
                {state.phase === "chat" && <Chat state={state} onSubmit={submitChat} />}
                {state.phase === "vote" && <Vote state={state} onSubmit={submitVote} />}
            </div>
        </div>
    </>);
};
