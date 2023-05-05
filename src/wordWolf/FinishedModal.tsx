import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { FinishedState, HumanPlayer, endResults } from './domain';

interface Props {
    state: FinishedState;
    humanPlayer: HumanPlayer;
    open: boolean;
    onClose: () => void;
    onRestart: () => void;
}

export const FinishedModal: React.FC<Props> = ({ state, humanPlayer, open, onClose, onRestart }) => {

    const results = endResults(state);
    const hasHumanWon = results.hasPlayerWon(humanPlayer);
    const executedPlayerNames = results.executed.map(player => player.name).join(", ");

    return (
        <>
            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {hasHumanWon ? "You won!" : "You lost!"}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {results.votes.map(({ voter, result }) =>
                                                <li key={voter.name}>{voter.name} voted for {result.voted.name}. (Reason: {result.reason})</li>)
                                            }
                                        </p>

                                        <p>{executedPlayerNames} executed.</p>

                                        <p>{state.wolf.name} was the werewolf.</p>

                                        <p>Wolf word: {state.wolfWord}</p>

                                        <p>Common word: {state.commonWord}</p>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={onRestart}
                                        >
                                            Restart
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default FinishedModal
