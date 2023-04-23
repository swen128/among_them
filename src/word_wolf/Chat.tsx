// src/Chat.tsx
import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
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
            <div className="flex-grow overflow-y-auto p-4">
                <div className="flex flex-col gap-2">
                    {state.chatLog.map((message, index) => (
                        <ChatMessage key={index} message={message} />
                    ))}
                </div>
            </div>
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
