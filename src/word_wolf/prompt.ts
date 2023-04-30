import { z } from "zod";
import { Prompt } from "../api/language_model";
import { ChattingState, allPlayers, playerWord } from "./state";
import dedent from "ts-dedent";

export function buildPrompt(state: ChattingState): Prompt[] {
    if (state.turn.type === "human") {
        throw new Error("Cannot build prompt for player turn");
    }

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

        Your word: "${playerWord(state, state.turn)}"

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

        You act as ${state.turn.name}, whose character is as described below:
        ${state.turn.characterDescription}

        Chat log: ${chatLog}

        Your turn to say something. You must respond in the following JSON format:
        {
            "thoughts": "Who do you think is the werewolf? Why?",
            "say": "blah blah"
        }
    `;

    return [{ role: "user", content: instructions }];
}

export type LanguageModelResponse = z.infer<typeof responseSchema>;

export function parseResponse(response: string) {
    return jsonStringSchema.pipe(responseSchema).safeParse(response);
}

const responseSchema = z.object({
    thoughts: z.string(),
    say: z.string(),
})

/**
 * Zod schema for parsing JSON string
 */
const jsonStringSchema = z.string()
    .transform((str, ctx) => {
        try {
            return JSON.parse(str);
        } catch (e) {
            ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
            return z.NEVER;
        }
    });
