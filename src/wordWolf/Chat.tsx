import React, { useState } from 'react';
import ChatLog from './ChatLog';
import { ChattingState, isPlayerTurn } from './domain';

interface Props {
    state: ChattingState;
    onSubmit: (text: string) => void;
}

const Chat: React.FC<Props> = ({ state, onSubmit }) => {
    const [inputValue, setInputValue] = useState('');
    const canSubmit = isPlayerTurn(state);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(inputValue.trim());
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-full">
            <div>Remaining turns: {state.remainingTurns}</div>
            <ChatLog state={state} />
            <form onSubmit={handleSubmit} className="border-t p-4">
                <input
                    className="border border-gray-300 rounded-lg py-2 px-4 block appearance-none leading-normal w-full"
                    type="text"
                    placeholder={canSubmit ? "Type your message..." : "The bot is thinking..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={!canSubmit}
                    autoFocus
                />
            </form>
        </div>
    );
};

export default Chat;
