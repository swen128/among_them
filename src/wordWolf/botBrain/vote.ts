import { dedent } from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../../api";
import { jsonStringSchema } from "../../utils";
import { BotPlayer, VotedResult, VotingState, playerWord } from "../domain";
import { chatLog, genericInstructions } from "./common";

function buildVotingPrompt(state: VotingState, player: BotPlayer): Prompt[] {
    const responseExamples: VotingResponse[] = [
        {
            thoughts: "Markus said it 'walks silently', which sounds more like 'cat' than my word 'dog'. Conner's description 'independent animal' also suggests 'cat'. The majority word is thus most likely 'cat', which makes me the werewolf. I should pretend to talk about cat.",
            votedPlayerName: "Kara",
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
        
        # Response format
        You must respond with a single valid JSON. Here is an example:
        ${responseExamples.map(example => JSON.stringify(example)).join("\n")}
    `;

    return [
        { role: "system", content: instructions },
        ...chatLog(state, player),
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
