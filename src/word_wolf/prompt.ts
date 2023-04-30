import { z } from "zod";
import { Prompt } from "../api/language_model";
import { ChattingState, allPlayers, playerWord } from "./state";
import dedent from "ts-dedent";

export function buildPrompt(state: ChattingState): Prompt[] {
    if (state.turn.type === "human") {
        throw new Error("Cannot build prompt for player turn");
    }

    const playerNames = allPlayers(state).map(p => p.name).join(", ");
    const chatLog: Prompt[] = state.chatLog.map(message => ({
        role: message.sender === state.turn ? "assistant" : "user",
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
        You act as ${state.turn.name}, whose character is as described below:
        ${state.turn.characterDescription}

        # Your secret word
        ${playerWord(state, state.turn)}
    `;

    const postInstrucions = dedent`
        # What you should do
        1. Summarize each other's comments so far and guess their secret words.
        2. Guess who is the minority (werewolf) here. Is it someone else or yourself?
        3. Think what you should say next.
            - At the very beginning, give brief and vague description of the word. When the word is dog, for example, say something like "I adore them".
            - When you lack information, ask questions about the word to find out the werewolf.
            - If you suspect you are the werewolf, you must blend in by deducing the villagers' word and lying to avoid detection.

        # Response format
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
