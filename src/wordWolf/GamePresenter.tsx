import React from 'react';
import Chat from './Chat';
import Vote from './Vote';
import { GameState, Player, playerWord } from './domain';

interface Props {
    state: GameState;
    onChatSubmit: (message: string) => void;
    onVoteSubmit: (voted: Player) => void;
}

export const GamePresenter: React.FC<Props> = ({ state, onChatSubmit, onVoteSubmit }) => {
    const humanPlayer = state.players.find(player => player.type === "human")!;

    return (<>
        <div className="h-screen md:p-4">
            <div className="w-full max-w-7xl h-full border p-4 shadow-lg rounded">
                <div>Your word: {playerWord(state, humanPlayer)}</div>
                {state.phase === "chat" && <Chat state={state} onSubmit={onChatSubmit} />}
                {state.phase === "vote" && <Vote state={state} onSubmit={onVoteSubmit} />}
            </div>
        </div>
    </>);
};
