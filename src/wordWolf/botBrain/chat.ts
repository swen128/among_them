import { dedent } from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../../api";
import { jsonStringSchema } from "../../utils";
import { ChattingState } from "../domain";
import { chatLog, genericInstructions } from "./common";

export function buildPrompt(state: ChattingState): Prompt[] {
    const player = state.turn;

    if (player.type === "human") {
        throw new Error("Cannot build prompt for player turn");
    }

    const responseExample: ChatResponse = {
        thoughts: "string",
        likelyWerewolf: "one of the player names",
        say: "string"
    }

    const instructions = dedent`
        ${genericInstructions(state, player)}
        
        # What you should do
        1. Summarize each other player's comments so far.
        2. Guess who is most likely the minority (werewolf), explaining your logic step by step.
        3. Decide what to say next.

        # Response format
        ${JSON.stringify(responseExample)}
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
