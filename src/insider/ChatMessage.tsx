// src/ChatMessage.tsx
import React from 'react';
import { ChatMessage } from './state';

const ChatMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const messageClasses = {
        human: 'bg-blue-500 text-white self-end',
        bot: 'bg-gray-300 text-black self-start',
        "game_master": 'bg-green-500 text-white self-start',
    }[message.sender.type];

    return (
        <div className="rounded-xl p-2 mb-2 flex items-center">
            <div className={`rounded-lg px-4 py-2 ${messageClasses}`}>
                [{message.sender.name}] {message.text}
            </div>
        </div>
    );
};

export default ChatMessage;
