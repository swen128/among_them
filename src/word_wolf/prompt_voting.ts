import dedent from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../api/language_model";
import { BotPlayer, Player, VotingState, allPlayers, playerWord } from "./state";
import { jsonStringSchema } from "../utils";

function buildVotingPrompt(state: VotingState, player: BotPlayer): Prompt[] {

    const numVillagers = state.botPlayers.length;
    const playerNames = allPlayers(state).map(p => p.name).join(", ");
    const chatLog: Prompt[] = state.chatLog.map(message => ({
        role: message.sender === player ? "assistant" : "user",
        name: message.sender.name,
        content: message.text,
    }))

    const instructions = dedent`
        You are playing a game of "Word Werewolf".

        There is 1 werewolf among the players and the rest are the villagers.
        In the beginning, the players are unaware of their own roles.

        Each player is assigned a secret word.
        While the villagers share the common word, the werewolf has a different one.

        Players engage in conversation to figure out their own roles and identify the werewolf.
        Although different, the two words have some similarities, such as "dog" and "cat",
        so that the werewolf would not immediately be apparent.

        After the conversation, players vote to execute someone.
        If the werewolf is executed, the villagers win; if a villager is executed, the werewolf wins.

        Players: ${playerNames}

        You act as ${player.name}, whose character is as described below:
        ${player.characterDescription}
    `;

    const postInstrucions = dedent`
        Your secret word: "${playerWord(state, player)}"

        1. Summarize each other's comments so far and guess their secret words.
        2. Who seems to be the werewolf (it might be you!), the person given the different secret word?
        3. Vote for the player to execute.
            - If you suspect you are the werewolf, vote for someone else.
            - If not, vote for the would-be werewolf.
        
        Respond in the following JSON format:
        {
            "thoughts": "string",
            "votedPlayerName": "string"
        }
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
    const voted = allPlayers(state).find(p => p.name === votedName);
    if (!voted) {
        throw new Error(`Invalid player name: ${votedName}`);
    }

    return voted;
}

function randomVote(state: VotingState, voter: BotPlayer): Player {
    const players = allPlayers(state);
    const voterIndex = players.indexOf(voter);

    const i = Math.floor(Math.random() * players.length - 1);
    const votedIndex = i < voterIndex ? i : i + 1;

    return allPlayers(state)[votedIndex];
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
