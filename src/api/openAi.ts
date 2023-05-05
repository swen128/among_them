import { AxiosError } from "axios";
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { z } from "zod";
import { LanguageModel, Prompt } from "./languageModel";

export class OpenAiChat implements LanguageModel {
    private readonly openai: OpenAIApi;

    constructor(
        apiKey: string,
        private readonly timeoutMillis: number = 30 * 1000,
    ) {
        const conf = new Configuration({
            apiKey: apiKey
        });
        this.openai = new OpenAIApi(conf);
    }

    private async request(request: CreateChatCompletionRequest): Promise<string> {
        try {
            const response = await this.openai.createChatCompletion(request, { timeout: this.timeoutMillis });
            const answer = response.data.choices[0].message?.content ?? "";
            return answer;
        } catch (e: unknown) {
            if (isOpenAiError(e) && e.response?.data.error.code === "context_length_exceeded") {
                throw TooManyTokensError.from(e.response.data);
            }
            throw e;
        }
    }

    async ask(messages: Prompt[]): Promise<string> {
        return this.request({
            messages,
            model: "gpt-4",
        });
    }

    async askFast(messages: Prompt[]): Promise<string> {
        return this.request({
            messages,
            model: "gpt-3.5-turbo",
        });
    }
}

/**
 * This error is thrown when the maximum context length of the language model is exceeded.
 */
export class TooManyTokensError extends Error {
    constructor(
        message: string,
        readonly tokens?: number,
        readonly maxTokens?: number,
    ) {
        super(message);
    }

    /**
     * Creates an instance of `TooManyTokensError` from an `OpenAiErrorResponse`.
     */
    static from(e: OpenAiErrorResponse): TooManyTokensError {
        // The message should be in the following format:
        // 'This model's maximum context length is 4097 tokens. However, your messages resulted in 12007 tokens. Please reduce the length of the messages.'
        const message = e.error.message;

        const tokenPattern = new RegExp("maximum context length is (\d)+ tokens");
        const maxTokenPattern = new RegExp("your messages resulted in (\d)+ tokens");

        const tokenStr = message.match(tokenPattern)?.[1];
        const maxTokenStr = message.match(maxTokenPattern)?.[1];

        return new TooManyTokensError(
            e.error.message,
            tokenStr !== undefined ? parseInt(tokenStr) : undefined,
            maxTokenStr !== undefined ? parseInt(maxTokenStr) : undefined,
        );
    }
}

function isAxiosError(error: unknown): error is AxiosError {
    return error instanceof Error
        && "isAxiosError" in error
        && error.isAxiosError === true;
}

function isOpenAiError(error: unknown): error is AxiosError<OpenAiErrorResponse> {
    return isAxiosError(error)
        && openAiErrorResponse.safeParse(error.response?.data).success;
}

const openAiErrorResponse = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
    }),
});

type OpenAiErrorResponse = z.infer<typeof openAiErrorResponse>;
