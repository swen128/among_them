import React from 'react';
import { ChatLoadingIndicator } from './ChatLoadingIndicator';
import ChatMessage from './ChatMessage';
import { GameState } from './domain';

interface Props {
    state: GameState;
}

const ChatLog: React.FC<Props> = ({ state }) => {
    const isBotThinking = state.phase === "chat" && state.turn.type === "bot";

    return (
        <div className="flex-grow overflow-y-auto p-4">
            {state.chatLog.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}
            
            {isBotThinking && <ChatLoadingIndicator sender={state.turn} />}
        </div>
    );
};

export default ChatLog;
