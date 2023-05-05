import { dedent } from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../../api";
import { jsonStringSchema } from "../../utils";
import { BotPlayer, VotedResult, VotingState } from "../domain";
import { chatLog, genericInstructions } from "./common";

function buildVotingPrompt(state: VotingState, player: BotPlayer): Prompt[] {
    const responseExample: VotingResponse = {
        thoughts: "string",
        votedPlayerName: "string",
    };

    const postInstrucions = dedent`
        # What you should do
        1. Summarize each other player's comments so far.
        2. Guess who is most likely the minority (werewolf), explaining your logic step by step.
        3. Vote for the player to execute.
            - If you suspect you are the werewolf, vote for someone else.
            - If not, vote for the would-be werewolf.
        
        # Response format
        ${JSON.stringify(responseExample)}
    `;

    return [
        genericInstructions(state, player),
        ...chatLog(state, player),
        { role: "system", content: postInstrucions },
    ];
}

type VotingResponse = z.infer<typeof responseSchema>;

const responseSchema = z.object({
    thoughts: z.string(),
    votedPlayerName: z.string(),
})

function parseVotingResponse(response: string) {
    return jsonStringSchema.pipe(responseSchema).safeParse(response);
}

export async function promptVote(lm: LanguageModel, state: VotingState, voter: BotPlayer): Promise<VotedResult> {
    const rawResponse = await lm.ask(buildVotingPrompt(state, voter));
    const response = parseVotingResponse(rawResponse);
    if (!response.success) {
        throw new Error(`Invalid response format: ${response.error}`);
    }

    const votedName = response.data.votedPlayerName;
    const voted = state.players.find(p => p.name === votedName);
    if (!voted) {
        throw new Error(`Invalid player name: ${votedName}`);
    }

    return { voted, reason: response.data.thoughts };
}
