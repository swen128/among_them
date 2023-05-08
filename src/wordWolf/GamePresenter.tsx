import React from 'react';
import Chat from './Chat';
import Finished from './Finished';
import Vote from './Vote';
import { GameState, HumanPlayer, Player, playerWord } from './domain';

interface Props {
    state: GameState;
    humanPlayer: HumanPlayer;
    onChatSubmit: (message: string) => void;
    onVoteSubmit: (voted: Player) => void;
    onRestart: () => void;
}

export const GamePresenter: React.FC<Props> = (props) => {
    return (<>
        <div className="h-screen md:p-4 flex justify-center">
            <div className="w-full max-w-7xl h-full border p-4 shadow-lg rounded">
                <div>Your word: {playerWord(props.state, props.humanPlayer)}</div>
                <SpecificGamePresenter {...props} />
            </div>
        </div>
    </>);
};

const SpecificGamePresenter: React.FC<Props> = ({ state, humanPlayer, onChatSubmit, onVoteSubmit, onRestart }) => {
    switch (state.phase) {
        case "chat": return <Chat state={state} onSubmit={onChatSubmit} />;
        case "vote": return <Vote state={state} onSubmit={onVoteSubmit} />;
        case "finished": return <Finished state={state} humanPlayer={humanPlayer} onRestart={onRestart} />;
    }
};
