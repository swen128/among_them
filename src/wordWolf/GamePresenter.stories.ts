import type { Meta, StoryObj } from '@storybook/react';
import { GamePresenter } from './GamePresenter';
import { BotPlayer, ChattingState, GameState, HumanPlayer, VotedResult, initialState, emptyVotes } from './domain';

const meta = {
    component: GamePresenter,
    argTypes: {
        onChatSubmit: { action: 'chatSubmitted' },
        onVoteSubmit: { action: 'voteSubmitted' },
        onRestart: { action: 'restart' },
    },
} satisfies Meta<typeof GamePresenter>;

export default meta;
type Story = StoryObj<typeof meta>;

const arg = args();

export const Chatting: Story = { args: arg.chatting };
export const BotSpeaking: Story = { args: arg.botSpeaking };
export const Voting: Story = { args: arg.voting };
export const HumanVoteCompleted: Story = { args: arg.humanVoteCompleted };
export const Defeat: Story = { args: arg.defeat };
export const Victory: Story = { args: arg.victory };

function args() {
    const markus: HumanPlayer = { name: 'Markus', type: 'human' };
    const kara: BotPlayer = { name: 'Kara', type: 'bot', characterDescription: '' };
    const connor: BotPlayer = { name: 'Connor', type: 'bot', characterDescription: '' };
    const players = [markus, kara, connor];
    const wolf = markus;
    const humanPlayer = markus;

    const state: ChattingState = {
        ...initialState({ players, wolf, wolfWord: 'wolf', commonWord: 'dog' }),
        chatLog: [
            { sender: markus, text: 'Lorem' },
            { sender: kara, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vehicula massa ac velit euismod scelerisque. Nullam ac posuere tortor. Cras facilisis, velit non fringilla mollis, eros enim vestibulum ipsum, ac venenatis massa tortor sit amet felis.' },
            { sender: connor, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
            { sender: markus, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vehicula massa ac velit euismod scelerisque. Nullam ac posuere tortor. Cras facilisis, velit non fringilla mollis, eros enim vestibulum ipsum, ac venenatis massa tortor sit amet felis. In consequat ligula at mi aliquam tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum condimentum dolor eu dui malesuada, hendrerit tincidunt erat faucibus. Sed varius eu diam quis molestie. Aenean suscipit iaculis semper. Ut vehicula nec justo eget volutpat. Nam in fermentum arcu. Curabitur eget vehicula arcu, ut tincidunt purus. Nulla convallis elit in ante euismod cursus. Nulla ut enim vitae dolor accumsan euismod. Phasellus consectetur mattis venenatis.' },
            { sender: markus, text: '日本語' },
            { sender: kara, text: 'この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。' },
        ],
    };

    const humanVote = new Map<string, VotedResult | undefined>([
        ["Markus", { voted: kara, reason: "Lorem ipsum" }],
        ["Kara", undefined],
        ["Connor", undefined],
    ]);

    const markusExecuted = new Map<string, VotedResult>([
        ["Markus", { voted: kara, reason: "Lorem ipsum" }],
        ["Kara", { voted: markus, reason: "Lorem ipsum" }],
        ["Connor", { voted: markus, reason: "Lorem ipsum" }],
    ]);

    const karaExecuted = new Map<string, VotedResult>([
        ["Markus", { voted: kara, reason: "Lorem ipsum" }],
        ["Kara", { voted: markus, reason: "Lorem ipsum" }],
        ["Connor", { voted: kara, reason: "Lorem ipsum" }],
    ]);

    return {
        chatting: { humanPlayer, state },
        botSpeaking: { humanPlayer, state: { ...state, turn: connor } },
        voting: { humanPlayer, state: { ...state, phase: "vote", votes: emptyVotes(players) } },
        humanVoteCompleted: { humanPlayer, state: { ...state, phase: "vote", votes: humanVote } },
        defeat: { humanPlayer, state: { ...state, phase: "finished", votes: markusExecuted } },
        victory: { humanPlayer, state: { ...state, phase: "finished", votes: karaExecuted } },
    } satisfies Record<string, { humanPlayer: HumanPlayer, state: GameState }>
}
