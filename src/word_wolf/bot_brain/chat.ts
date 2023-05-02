import { dedent } from "ts-dedent";
import { z } from "zod";
import { LanguageModel, Prompt } from "../../api";
import { jsonStringSchema } from "../../utils";
import { ChattingState, playerWord } from "../state";

export function buildPrompt(state: ChattingState): Prompt[] {
    if (state.turn.type === "human") {
        throw new Error("Cannot build prompt for player turn");
    }

    const secretWord = playerWord(state, state.turn);
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
        ${secretWord}
    `;

    const postInstrucions = dedent`
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

        # Response format (all the JSON fields are required)
        {
            "wordsSummary": {
                "Kara": "dog",
                "Markus": "He had one as pet. Walks silently.",
                "Connor": "Cute, agile, and independent animal."
            },
            "thoughts": "Markus said it 'walks silently', which sounds more like 'cat' than 'dog'. Conner's description 'independent animal' also suggests 'cat'. The majority word is thus most likely 'cat', and I am the werewolf. I should pretend to be a villager by talking about cat.",
            "mostLikelyGuess": {
                "commonWord": "cat",
                "wolfWord": "dog",
                "werewolf": "Kara"
            },
            "say": "They love high places, don't they?"
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
