// src/Chat.tsx
import React, { useState } from 'react';
import { ChatMessage } from './state';
import ChatMessageComponent from './ChatMessage';

interface Props {
    log: ChatMessage[];
    onSubmit: (text: string) => void;
}

const Chat: React.FC<Props> = ({ log, onSubmit }) => {
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
                    {log.map((message, index) => (
                        <ChatMessageComponent key={index} message={message} />
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
