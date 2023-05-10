import { dedent } from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../../api";
import { jsonStringSchema } from "../../utils";
import { ChattingState, playerWord } from "../domain";
import { chatLog, genericInstructions } from "./common";

export function buildPrompt(state: ChattingState): Prompt[] {
    const player = state.turn;

    if (player.type === "human") {
        throw new Error("Cannot build prompt for player turn");
    }

    const responseExamples: ChatResponse[] = [
        {
            thoughts: "Markus said it 'walks silently', which sounds more like 'cat' than my word 'dog'. Conner's description 'independent animal' also suggests 'cat'. The majority word is thus most likely 'cat', which makes me the werewolf. I should pretend to talk about cat.",
            likelyWerewolf: "Kara",
            say: "They love high places, right?"
        },
    ];

    const instructions = dedent`
        ${genericInstructions(state, player)}
        
        # What you should do
        1. Summarize each other player's comments so far.
        2. Think if each of their topic align with yours (${playerWord(state, player)}).
        3. Guess who is most likely the werewolf.
            - When multiple people are talking about different topic from yours, you should be the werewolf.
            - When someone agrees with your topic, you (and that person) are probably not the werewolf.
        4. Think what you should say next.
            - At the very beginning, give brief and vague description of the word. When the word is dog, for example, say something like "I adore them".
            - If you might be the minority, you must blend in by deducing the villagers' word and lying to avoid detection.
            - When you lack information, ask questions about the word to find out the werewolf.

        # Response format
        You must respond with a single valid JSON.
        Your inner thoughts should always be in English, while you speak with the language and tone specified in the character description.
        Here is an example:
        ${responseExamples.map(example => JSON.stringify(example)).join("\n")}
    `;

    return [
        { role: "system", content: instructions },
        ...chatLog(state, player),
    ];
}

type ChatResponse = z.infer<typeof responseSchema>;

function parseResponse(response: string) {
    return jsonStringSchema.pipe(responseSchema).safeParse(response);
}

const responseSchema = z.object({
    thoughts: z.string(),
    likelyWerewolf: z.string(),
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
