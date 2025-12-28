import OpenAI from "openai";

export const openai = new OpenAI({
    baseURL: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });

    return response.data[0].embedding;
}
