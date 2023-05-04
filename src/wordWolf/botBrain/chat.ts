import { dedent } from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../../api";
import { jsonStringSchema } from "../../utils";
import { ChattingState, playerWord } from "../state";
import { chatLog, genericInstructions } from "./common";

export function buildPrompt(state: ChattingState): Prompt[] {
    const player = state.turn;
    const secretWord = playerWord(state, player);

    if (player.type === "human") {
        throw new Error("Cannot build prompt for player turn");
    }

    const responseExample: ChatResponse = {
        wordsSummary: {
            "Kara (me)": "'dog'",
            "Markus": "He had one as pet. Walks silently.",
            "Connor": "Cute, agile, and independent animal."
        },
        thoughts: "Markus said it 'walks silently', which sounds more like 'cat' than 'dog'. Conner's description 'independent animal' also suggests 'cat'. The majority word is thus most likely 'cat', and I am the werewolf. I should pretend to be a villager by talking about cat.",
        mostLikelyGuess: {
            commonWord: "cat",
            wolfWord: "dog",
            werewolf: "Kara"
        },
        say: "They love high places, don't they?"
    }

    const instrucions = dedent`
        # What you should do
        1. Summarize each other player's comments so far.
        2. Think if each of their topic align with yours (${secretWord}).
        3. Guess whether you are the werewolf or not.
            - When multiple people are talking about different topic from yours, you are most likely the werewolf.
            - When someone agrees with your topic, you (and that person) are probably not the werewolf.
        4. Think what you should say next.
            - At the very beginning, give brief and vague description of the word. When the word is dog, for example, say something like "I adore them".
            - If you might be the minority, you must blend in by deducing the villagers' word and lying to avoid detection.
            - When you lack information, ask questions about the word to find out the werewolf.

        # Response format
        All the JSON fields are required.
        ${JSON.stringify(responseExample)}}
    `

    return [
        genericInstructions(state, player),
        ...chatLog(state, player),
        { role: "system", content: instrucions },
    ];
}

type ChatResponse = z.infer<typeof responseSchema>;

function parseResponse(response: string) {
    return jsonStringSchema.pipe(responseSchema).safeParse(response);
}

const responseSchema = z.object({
    wordsSummary: z.record(z.string()),
    thoughts: z.string(),
    mostLikelyGuess: z.object({
        commonWord: z.string(),
        wolfWord: z.string(),
        werewolf: z.string(),
    }),
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
