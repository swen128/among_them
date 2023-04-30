import React, { useState } from 'react';
import ChatLog from './ChatLog';
import { Player, VotingState, isBotVoteComplete, isVoteComplete, votes } from './state';
import VoteInput from './VoteInput';

interface Props {
    state: VotingState;
    onSubmit: (voted: Player) => void;
}

const Vote: React.FC<Props> = ({ state, onSubmit }) => {
    const options = state.botPlayers;

    const [value, setValue] = useState<Player>(options[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value) onSubmit(value);
    };

    const voteProgress = isVoteComplete(state)
        ? votes(state).map(({ voter, voted }) => <li key={voter.name}>{voter.name} voted for {voted.name}</li>)
        : isBotVoteComplete(state)
            ? <div>Awaiting your vote...</div>
            : <div>Awaiting votes from the other players...</div>;

    return (
        <div className="flex flex-col h-full">
            {voteProgress}
            <ChatLog log={state.chatLog} />
            <form onSubmit={handleSubmit} className="border-t p-4">
                <VoteInput value={value} options={options} onChange={setValue} />
                <button type='submit'>Vote</button>
            </form>
        </div>
    );
};

export default Vote;
