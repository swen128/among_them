import * as dotenv from 'dotenv';
import fs from "fs";
import yaml from "js-yaml";
import { z } from "zod";
import { OpenAiChat } from "../src/api";
import { promptChat } from "../src/word_wolf/bot_brain";
import { ChattingState, Player } from "../src/word_wolf/state";

dotenv.config({ path: '.env.local' });
const apiKey = process.env.VITE_OPENAI_API_KEY ?? "";
const llm = new OpenAiChat(apiKey);

const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

async function main() {
    const testCases = testCasesSchema.parse(yaml.load(fs.readFileSync("./scripts/data.yml", "utf-8")));

    for (const testCase of testCases) {
        evaluateWerewolfGuess(testCase).then(console.log);
        await delay(1000);
    }
}

const chatMessageSchema = z.string().transform(message => {
    const messageRegex = /^\[([a-zA-Z0-9_]*)\] (.*)$/;
    const [, senderName, text] = message.match(messageRegex) ?? [];
    return { senderName, text };
});
const testCaseSchema = z.object({
    description: z.string(),
    commonWord: z.string(),
    wolfWord: z.string(),
    wolf: z.string(),
    next: z.string(),
    chatLog: z.array(chatMessageSchema),
});
const testCasesSchema = z.array(testCaseSchema);
type TestCase = z.infer<typeof testCaseSchema>;

async function evaluateWerewolfGuess(testCase: TestCase) {
    const player = (name: string): Player => ({ type: "bot", name, characterDescription: "A confident, experienced Word Werewolf player" })

    const chatLog = testCase.chatLog.map(message => {
        return { sender: player(message.senderName), text: message.text };
    })
    const playerNames = [...new Set(chatLog.map(message => message.sender.name))];
    const players = playerNames.map(player);

    const chattingState: ChattingState = {
        phase: "chat",
        players,
        remainingTurns: 5,
        commonWord: testCase.commonWord,
        wolfWord: testCase.wolfWord,
        wolf: player(testCase.wolf),
        chatLog,
        turn: player(testCase.next),
    }

    const response = await promptChat(llm, chattingState);

    // correct guess: 1, incorrect guess: 0, indecisive: 0.3
    const score = response.likelyWerewolf === testCase.wolf ? 1
        : playerNames.includes(response.likelyWerewolf) ? 0
            : 0.3;
    return { testDescription: testCase.description, score, response };
}

main().then();
