import { z } from "zod";
import { Prompt } from "../api/language_model";
import { QuestionState } from "./state";
import { dedent } from 'ts-dedent';
import { jsonStringSchema } from "../utils";


export function qaPhasePrompt(state: QuestionState): Prompt[] {
    if (state.turn.type === "human") {
        throw new Error("Cannot build prompt for player turn");
    }

    const playerNames = [...state.botPlayers, state.humanPlayer].map(p => p.name).join(", ");
    const chatLog = JSON.stringify(state.chatLog.map(message => ({
        name: message.sender.name,
        text: message.text,
    })))

    const instructions = dedent`
        You are playing a game of "Insider".

        Your goal is to find out the secret keyword by asking yes-no questions to the game master.
        There is, however, an insider among the players who knows the keyword and try to steer the conversation towards the keyword.

        ## Q&A phase
        - Players ask questions whose answer is either "yes", "no", or "I don't know".
        - The insider can ask questions trying to guide the players but without being obvious.
        - If a player finds out the keyword, proceed to the discussion phase.
        - If no one finds out the keyword within ${state.maxTurns} turns, all players lose.

        ## Discussion phase
        - Players discuss who is the insider and then vote.
        - If the majority of the players vote for the insider, the insider loses.

        Players: ${playerNames}
        Chat log: ${chatLog}

        You are ${state.turn.name}, a commoner (not the insider).

        It's the Q&A phase now. Ask a yes-no question to figure out the keyword.
        Respond in the following format:
        {
            "thoughts": "blah blah",
            "question": "blah blah"
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
    question: z.string(),
})
