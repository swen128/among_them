// src/Chat.tsx
import React from 'react';
import { Player } from './state';

interface Props {
    value: Player | undefined;
    options: Player[];
    onChange: (voted: Player) => void;
}

const VoteInput: React.FC<Props> = ({ value, options, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.value;
        const player = options.find(p => p.name === name);
        if (player) onChange(player);
    };

    return (
        <select
            value={value?.name}
            onChange={handleChange}
        >
            {options.map(player => (
                <option key={player.name} value={player.name}>{player.name}</option>
            ))}
        </select>
    );
};

export default VoteInput;
