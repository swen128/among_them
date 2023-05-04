import React from 'react';
import { useEffectOnce } from 'react-use';
import { LanguageModel } from '../api';
import { GamePresenter } from './GamePresenter';
import { useSinglePlayerGame } from './hooks';
import { GameState, isBot, playerWord } from './state';

interface Props {
    languageModel: LanguageModel;
    playerName: string;
}

export const Game: React.FC<Props> = ({ languageModel, playerName }) => {
    const { state, submitChat, submitVote } = useSinglePlayerGame(languageModel, playerName);
    useCheatingLog(state);

    return <GamePresenter state={state} onChatSubmit={submitChat} onVoteSubmit={submitVote} />;
};

function useCheatingLog(state: GameState) {
    useEffectOnce(() => {
        const botPlayers = state.players.filter(isBot);
        botPlayers.forEach(player => {
            console.log(`${player.name}'s word: ${playerWord(state, player)}`);
        });
    });
}
