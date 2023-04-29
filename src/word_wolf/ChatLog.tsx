// src/Chat.tsx
import React from 'react';
import ChatMessage from './ChatMessage';

interface Props {
    log: ChatMessage[];
}

const ChatLog: React.FC<Props> = ({ log }) => {
    return (
        <div className="flex-grow overflow-y-auto p-4">
            <div>
                {log.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                ))}
            </div>
        </div>
    );
};

export default ChatLog;
