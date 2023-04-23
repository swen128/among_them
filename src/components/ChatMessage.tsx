// src/ChatMessage.tsx
import React from 'react';
import { ChatMessage } from '../domain/state';

const ChatMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const messageClasses =
        message.sender.type === 'human'
            ? 'bg-blue-500 text-white self-end'
            : 'bg-gray-300 text-black self-start';

    return (
        <div className="rounded-xl p-2 mb-2 flex items-center">
            <div className={`rounded-lg px-4 py-2 ${messageClasses}`}>
                {message.text}
            </div>
        </div>
    );
};

export default ChatMessage;
