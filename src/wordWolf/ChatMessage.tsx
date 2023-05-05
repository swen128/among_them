import React from 'react';
import ChatBubble from './ChatBubble';
import { ChatMessage } from './domain';

const ChatMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    return <ChatBubble sender={message.sender}>
        <p>{message.text}</p>
    </ChatBubble>;
};

export default ChatMessage;
