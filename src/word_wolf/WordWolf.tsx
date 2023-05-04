import React, { useState } from 'react';
import { OpenAiChat } from '../api';
import { Game } from './Game';
import { StartScreen } from './StartScreen';

export const WordWolf: React.FC = () => {
    const [state, setState] = useState<State>({ isStarted: false });

    return !state.isStarted
        ? <StartScreen onButtonClick={options => setState({ isStarted: true, options })} />
        : <Game
            playerName={state.options.playerName}
            languageModel={new OpenAiChat(state.options.apiKey)}
        />;
};

type State = StartedState | NotStartedState;

interface StartedState {
    isStarted: true;
    options: {
        apiKey: string;
        playerName: string;
    }
}

interface NotStartedState {
    isStarted: false;
}
