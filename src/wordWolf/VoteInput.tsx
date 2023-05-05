import React from 'react';
import { Player } from './domain';

interface Props {
    value: Player | undefined;
    options: Player[];
    disabled?: boolean;
    onChange: (voted: Player) => void;
}

const VoteInput: React.FC<Props> = ({ value, options, onChange, disabled }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.value;
        const player = options.find(p => p.name === name);
        if (player) onChange(player);
    };

    return (
        <select
            className='border border-gray-300 disabled:opacity-40 rounded-lg p-2.5 w-full'
            value={value?.name}
            disabled={disabled}
            onChange={handleChange}
        >
            {options.map(player => (
                <option key={player.name} value={player.name}>{player.name}</option>
            ))}
        </select>
    );
};

export default VoteInput;
