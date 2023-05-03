import React from 'react';
import { useEffectOnce } from 'react-use';
import { OpenAiChat } from '../api';
import Chat from './Chat';
import Vote from './Vote';
import { useSinglePlayerGame } from './hooks';
import { GameState, isBot, playerWord } from './state';

interface Props {
    playerName: string;
    apiKey: string;
}

export const Game: React.FC<Props> = ({ apiKey, playerName }) => {
    const languageModel = new OpenAiChat(apiKey);
    const { state, submitChat, submitVote } = useSinglePlayerGame(languageModel, playerName);

    useCheatingLog(state);

    return (<>
        <div className="h-screen p-4">
            <div className="w-full max-w-7xl h-full border p-4 shadow-lg rounded">
                <div>Your word: {playerWord(state, state.humanPlayer)}</div>
                {state.phase === "chat" && <Chat state={state} onSubmit={submitChat} />}
                {state.phase === "vote" && <Vote state={state} onSubmit={submitVote} />}
            </div>
        </div>
    </>);
};

function useCheatingLog(state: GameState) {
    useEffectOnce(() => {
        const botPlayers = state.players.filter(isBot);
        botPlayers.forEach(player => {
            console.log(`${player.name}'s word: ${playerWord(state, player)}`);
        });
    });
}
