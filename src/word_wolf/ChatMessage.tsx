// src/ChatMessage.tsx
import React from 'react';
import { ChatMessage } from './state';

const ChatMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const bubbleStyle = message.sender.type === 'human'
        ? 'bg-indigo-500 text-white float-left'
        : 'bg-gray-200 text-gray-800 float-right';

    return (
        <div className={`p-4 my-2 rounded-lg ${bubbleStyle} max-w-6xl clear-both`}>
            <p className="font-bold">{message.sender.name}</p>
            <p>{message.text}</p>
        </div>
    );
};

export default ChatMessage;
