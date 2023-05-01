import { dedent } from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../../api";
import { jsonStringSchema } from "../../utils";
import { ChattingState, playerWord } from "../state";

export function buildPrompt(state: ChattingState): Prompt[] {
    if (state.turn.type === "human") {
        throw new Error("Cannot build prompt for player turn");
    }

    const playerNames = state.players.map(p => p.name).join(", ");
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
        1. Summarize each other player's comments so far.
        2. Guess who among the players (including you) is most likely the minority, explaining your logic step by step.
        3. Think what you should say next.
            - At the very beginning, give brief and vague description of the word. When the word is dog, for example, say something like "I adore them".
            - If you might be the minority, you must blend in by deducing the villagers' word and lying to avoid detection.
            - When you lack information, ask questions about the word to find out the werewolf.

        # Response format
        {
            "thoughts": "string",
            "suspectedWerewolf": "string",
            "expectedWolfWord": "string",
            "expectedCommonWord": "string",
            "say": "string"
        }
    `

    return [
        { role: "system", content: instructions },
        ...chatLog,
        { role: "system", content: postInstrucions },
    ];
}

export type ChatResponse = z.infer<typeof responseSchema>;

export function parseResponse(response: string) {
    return jsonStringSchema.pipe(responseSchema).safeParse(response);
}

const responseSchema = z.object({
    thoughts: z.string(),
    suspectedWerewolf: z.string(),
    expectedWolfWord: z.string(),
    expectedCommonWord: z.string(),
    say: z.string(),
})

export async function promptChat(languageModel: LanguageModel, state: ChattingState): Promise<ChatResponse> {
    const response = await languageModel.ask(buildPrompt(state));
    const result = parseResponse(response);
    
    if (!result.success) {
        throw Error(`Failed to parse response: ${result.error.message}`);
    }
    return result.data;
}
