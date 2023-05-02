import { dedent } from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../../api";
import { jsonStringSchema } from "../../utils";
import { BotPlayer, Player, VotingState, playerWord } from "../state";

function buildVotingPrompt(state: VotingState, player: BotPlayer): Prompt[] {
    const playerNames = state.players.map(p => p.name).join(", ");
    const chatLog: Prompt[] = state.chatLog.map(message => ({
        role: message.sender === player ? "assistant" : "user",
        name: message.sender.name,
        content: message.text,
    }))

    const instructions = dedent`
        # Game rules
        You are playing a game of "Word Werewolf".

        There is one werewolf among the players.
        Each player is given a secret word--the majority (villagers) shares a common word, while the werewolf has a different one.
        No one (even the werewolf himself) knows who is the werewolf, so you have to talk about your secret words to find out.
        
        The players then vote to execute someone. The villagers win if the werewolf is executed; otherwise the werewolf wins.

        Giving away too much information would help the werewolf to blend in, or expose yourself if you are the werewolf.
        On the other hand, you cannot make correct guess if you don't talk enough.

        # Players
        ${playerNames}

        # Your character
        You act as ${player.name}, whose character is as described below:
        ${player.characterDescription}

        # Your secret word
        ${playerWord(state, player)}
    `;

    const postInstrucions = dedent`
        # What you should do
        1. Summarize each other player's comments so far.
        2. Guess who is most likely the minority (werewolf), explaining your logic step by step.
        3. Vote for the player to execute.
            - If you suspect you are the werewolf, vote for someone else.
            - If not, vote for the would-be werewolf.
        
        # Response format
        {"thoughts": "string", "votedPlayerName": "string"}
    `;

    return [
        { role: "system", content: instructions },
        ...chatLog,
        { role: "system", content: postInstrucions },
    ];
}

const responseSchema = z.object({
    thoughts: z.string(),
    votedPlayerName: z.string(),
})

function parseVotingResponse(response: string) {
    return jsonStringSchema.pipe(responseSchema).safeParse(response);
}

async function promptVoteUnsafe(lm: LanguageModel, state: VotingState, voter: BotPlayer): Promise<Player> {
    const rawResponse = await lm.ask(buildVotingPrompt(state, voter));
    const response = parseVotingResponse(rawResponse);
    if (!response.success) {
        throw new Error(`Invalid response format: ${response.error}`);
    }

    console.log(`${voter.name}' thoughts: ${response.data.thoughts}`);

    const votedName = response.data.votedPlayerName;
    const voted = state.players.find(p => p.name === votedName);
    if (!voted) {
        throw new Error(`Invalid player name: ${votedName}`);
    }

    return voted;
}

function randomVote(state: VotingState, voter: BotPlayer): Player {
    const players = state.players;
    const voterIndex = players.indexOf(voter);

    const i = Math.floor(Math.random() * players.length - 1);
    const votedIndex = i < voterIndex ? i : i + 1;

    return state.players[votedIndex];
}

export const promptVote = (lm: LanguageModel, maxRetries: number, state: VotingState) =>
    async (voter: BotPlayer): Promise<Player> => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await promptVoteUnsafe(lm, state, voter);
            } catch (e) {
                console.error(e);
            }
        }
        return randomVote(state, voter);
    }
