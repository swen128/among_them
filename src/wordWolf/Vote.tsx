import React, { useState } from 'react';
import ChatLog from './ChatLog';
import VoteInput from './VoteInput';
import { Player, VotingState, isBotVoteComplete, isHumanVoteComplete, isVoteComplete, votes } from './state';

interface Props {
    state: VotingState;
    onSubmit: (voted: Player) => void;
}

const Vote: React.FC<Props> = ({ state, onSubmit }) => {
    const options = state.players.filter(p => p.type === "bot");
    const disabled = isHumanVoteComplete(state);

    const [value, setValue] = useState<Player>(options[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value) onSubmit(value);
    };

    const voteProgress = isVoteComplete(state)
        ? votes(state).map(({ voter, result }) => <li key={voter.name}>{voter.name} voted for {result.voted.name}</li>)
        : isBotVoteComplete(state)
            ? <div>Awaiting your vote...</div>
            : <div>Awaiting votes from the other players...</div>;

    return (
        <div className="flex flex-col h-full">
            {voteProgress}
            <ChatLog state={state} />
            <form onSubmit={handleSubmit} className="border-t p-4 flex gap-4">
                <VoteInput value={value} options={options} onChange={setValue} disabled={disabled} />
                <button
                    type='submit'
                    disabled={disabled}
                    className="bg-blue-500 disabled:bg-gray-200 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Vote
                </button>
            </form>
        </div>
    );
};

export default Vote;
