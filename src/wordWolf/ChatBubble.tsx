import React from 'react';
import { Player } from './domain';

interface Props {
    sender: Player;
    children: React.ReactNode;
}

const ChatBubble: React.FC<Props> = ({ sender, children }) => {
    const bubbleStyle = sender.type === 'human'
        ? 'bg-indigo-500 text-white float-left'
        : 'bg-gray-200 text-gray-800 float-right';

    return (
        <div className={`p-4 my-2 rounded-lg ${bubbleStyle} max-w-[85%] clear-both`}>
            <p className="font-bold">{sender.name}</p>
            <p></p>{children}
        </div>
    );
};

export default ChatBubble;
