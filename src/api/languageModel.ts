export interface LanguageModel {
    ask(message: Prompt[]): Promise<string>;
    
    askFast(message: Prompt[]): Promise<string>;
}

export interface Prompt {
    role: "system" | "user" | "assistant";
    content: string;
    name?: string;
}
