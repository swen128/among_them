import React, { useState } from 'react';
import ChatLog from './ChatLog';
import { ChattingState } from './state';

interface Props {
    state: ChattingState;
    onSubmit: (text: string) => void;
}

const Chat: React.FC<Props> = ({ state, onSubmit }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(inputValue.trim());
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-full">
            <div>Remaining turns: {state.remainingTurns}</div>
            <ChatLog log={state.chatLog} />
            <form onSubmit={handleSubmit} className="border-t p-4">
                <input
                    className="focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block appearance-none leading-normal w-full"
                    type="text"
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </form>
        </div>
    );
};

export default Chat;
