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
    const chatLog: Prompt[] = state.chatLog.map(message => ({
        role: message.sender === state.turn ? "assistant" : "user",
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

        You act as ${state.turn.name}, whose character is as described below:
        ${state.turn.characterDescription}
    `;

    const postInstrucions = dedent`
        Your secret word: "${playerWord(state, state.turn)}"

        1. Summarize each other's comments so far and guess their secret words.
        2. Who seems to be the werewolf, the person given the different secret word?
        3. Think what you should say next.
            - At the very beginning, give brief and vague description of the word. When the word is dog, for example, say something like "I adore them".
            - When you lack information, ask questions about the word to find out the werewolf.
            - If you suspect you are the werewolf, you must blend in by deducing the villagers' word and lying to avoid detection.

        Respond in the following JSON format:
        {
            "thoughts": "string",
            "say": "string"
        }
    `

    return [
        { role: "system", content: instructions },
        ...chatLog,
        { role: "system", content: postInstrucions },
    ];
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
