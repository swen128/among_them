import dedent from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../api/language_model";
import { BotPlayer, Player, VotingState, allPlayers, playerWord } from "./state";
import { jsonStringSchema } from "../utils";

function buildVotingPrompt(state: VotingState, player: BotPlayer): Prompt[] {

    const numVillagers = state.botPlayers.length;
    const playerNames = allPlayers(state).map(p => p.name).join(", ");
    const chatLog = JSON.stringify(state.chatLog.map(message => ({
        name: message.sender.name,
        text: message.text,
    })))

    const instructions = dedent`
        You are playing a game of "Word Werewolf".

        There are ${numVillagers} villagers and 1 werewolf in the game.
        In the beginning, the players are unaware of their own roles.

        Each player is assigned a secret word.
        While the villagers share the common word, the werewolf has a different one.

        Your word: "${playerWord(state, player)}"

        Players engage in conversation to figure out their own roles and identify the werewolf.
        Although different, the two words have some similarities, such as "dog" and "cat",
        so that the werewolf would not immediately be apparent.

        After the conversation, players vote to execute someone.
        If the werewolf is executed, the villagers win; if a villager is executed, the werewolf wins.

        Here are some tips:
        - Never say your secret word directly.
        - At first, give brief and vague description of the word. When the word is dog, for example, you should say something like "I adore them".
        - Ask questions about the word to find out the werewolf.
        - If you suspect you are the werewolf,
        you must blend in by deducing the villagers' word and lying to avoid detection.
        - If you think you are a villager, give others hints that you know the common word,
        while keeping the werewolf from guessing it.

        Players: ${playerNames}

        You act as ${player.name}, whose character is as described below:
        ${player.characterDescription}

        Chat log: ${chatLog}

        Now it is the voting phase. You must respond in the following JSON format:
        {
            "thoughts": "Who do you think is the werewolf? Why?",
            "votedPlayerName": "One of the player names"
        }
    `;

    return [{ role: "user", content: instructions }];
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
