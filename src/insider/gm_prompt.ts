import { dedent } from 'ts-dedent';
import { Prompt } from "../api/language_model";

export function gameMasterPrompt(keyword: string, question: string): Prompt[] {
    const instructions = dedent`
        They are playing a game to guess the keyword by asking yes-no questions.

        Here is the keyword and the question:
        ${JSON.stringify({ keyword, question })}

        Answer in either "Yes", "No" or "I don't know".
        If the keyword is correctly guessed, say "Spot on".
    `;

    return [{ role: "user", content: instructions }];
}
