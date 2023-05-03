import React, { useState } from 'react';

interface Props {
    onButtonClick: (options: { apiKey: string, model: string, playerName: string }) => void;
}

export const StartScreen: React.FC<Props> = ({ onButtonClick }) => {
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY ?? "")
    const [model, setModel] = useState('gpt-4');
    const [playerName, setPlayerName] = useState('');

    const handleButtonClick = () => {
        // TODO: More sophisticated validation.
        const playerNamePattern = /^[a-zA-Z0-9_]+$/;
        if (!playerNamePattern.test(playerName)) {
            alert("The player name must be alphanumeric and underscores only.")
            return;
        }

        onButtonClick({ apiKey, model, playerName });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-6 rounded shadow-md w-96 flex flex-col gap-4 justify-center">
                {/* TODO: Extract input component. */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setApiKey(event.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <select
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base"
                        value={model}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setModel(event.target.value)}
                    >
                        {/* TODO: Add GPT-3.5 */}
                        <option value="gpt-4">GPT-4</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Player Name</label>
                    <input
                        value={playerName}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPlayerName(event.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base"
                    />
                </div>

                <div className='text-center'>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleButtonClick}
                    >
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
};

