import React, { useState } from 'react';
import ChatLog from './ChatLog';
import FinishedModal from './FinishedModal';
import { FinishedState, HumanPlayer } from './domain';

interface Props {
    state: FinishedState;
    humanPlayer: HumanPlayer
    onRestart: () => void;
}

const Finished: React.FC<Props> = ({ state, humanPlayer, onRestart }) => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="flex flex-col h-full">
            <ChatLog state={state} />
            <FinishedModal
                state={state}
                humanPlayer={humanPlayer}
                open={isModalOpen}
                onClose={closeModal}
                onRestart={onRestart} />
        </div>
    );
};

export default Finished;
