import { searchVectorize } from "@/lib/vectorize";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
    convertToModelMessages,
    generateText,
    streamText,
    type ModelMessage,
} from "ai";

// Ensure the API key is available
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

export const maxDuration = 60;

// Helper function to extract text from message content
function extractTextContent(message: ModelMessage): string {
    if (message.role !== "user" && message.role !== "assistant") {
        return "";
    }

    const content = message.content;

    // Handle string content (legacy or simple messages)
    if (typeof content === "string") {
        return content;
    }

    // Handle array content (structured messages with parts)
    if (Array.isArray(content)) {
        const textParts = content
            .filter(
                (part): part is { type: "text"; text: string } => part.type === "text"
            )
            .map((part) => part.text)
            .join(" ");
        return textParts;
    }

    return "";
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // AI SDK 5.0: Convert UI messages to model messages
        const modelMessages = await convertToModelMessages(messages);

        // Get the last user message for search query generation
        const lastMessage = modelMessages[modelMessages.length - 1];
        const content = extractTextContent(lastMessage);

        if (!content) {
            return new Response(
                JSON.stringify({ error: "No text content found in message" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Step 1: Generate search query
        const { text: searchQuery } = await generateText({
            model: google("gemini-2.5-pro"),
            prompt: `Given the user's message, generate a concise search query to find relevant documents in a vector database. Since data is only numbers and dates, use those to generate the query (e.g. "2022"). Output ONLY the query, nothing else.
            Query should be keyword that will be found inside following data structures:
            Incidents with Times Data:
            {
              "Unit Arrival Time": "2024-03-02 17:31:06.000",
              "Unit Enroute DateTime": "2024-03-02 17:26:25.000",
              "Unit Cleared Scene DateTime": "2024-03-02 17:49:16.000",
              "Unit Dispatched DateTime": "2024-03-02 17:25:06.000",
              "Unit Name": "SQ19",
              "Dispatch Run Number": null,
              "Incident Number": "F24-00373",
              "Fire Incident Apparatus ID": "36bf144a-0690-4f7b-9a5b-b1390080d2e2"
            } 
            Incident Detail Data:
            {
              "Incident Number": "F25-00914",
              "Incident Date": "2025-05-25",
              "Alarm DateTime": "2025-05-25 06:44:56.000",
              "Arrival DateTime": "2025-05-25 06:48:29.000",
              "Incident Type": "EMS call, excluding vehicle accident with injury",
              "Incident Type NFIRS Code": "322",
              "Incident Type Group": "300 - Rescue & EMS",
              "Property Use": "1 or 2 family dwelling",
              "Property Use NFIRS Code": "419",
              "Property Use Code": "419",
              "Location Street Number or Mile Post": "1705",
              "Location Street or Highway Name": "BUTTERFIELD",
              "Location Street Type": "Lane",
              "Location Street Type NFIRS Code": "115",
              "Location City": "Flossmoor",
              "Location State Code": "IL",
              "Location ZIP": "60422",
              "Location Street Prefix": "",
              "Location Street Suffix": "",
              "Shift": "Red",
              "District": "19-2",
              "Aid Given Or Received": "None",
              "Aid Given Or Received Code": "N",
              "Basic Action Taken 1": "Provide advanced life support (ALS)",
              "Basic Action Taken 1 Code": "33",
              "Basic Action Taken 1 NFIRS Code": "33",
              "Basic Action Taken 2": "",
              "Basic Action Taken 2 Code": "",
              "Basic Action Taken 3": "",
              "Basic Action Taken 3 Code": "",
              "First Arriving Travel Time": "354",
              "PSAP Received DateTime": "2025-05-25 06:30:00.000",
              "PSAP Sent DateTime": "2025-05-25 06:32:00.000",
              "Alarm Processing Time": "99",
              "Response Time Alarm To Arrival": "227",
              "Total Time Alarm to Last Unit Cleared": "1480",
              "Total Time PSAP Received to Last Unit Cleared": "1381",
              "PSAP Total Response Time": "326",
              "CAD Notes": "07:54:40 05/25/2025 - Je Johnson 78 yom chest pain since last night 07:55:12 05/25/2025 - Je Johnson conscious breathing normally 07:55:45 05/25/2025 - Je Johnson rates pain 7/10 07:56:22 05/25/2025 - Je Johnson hx hypertension and cad 07:57:03 05/25/2025 - A Postma HAVE FD ADVISE 08:12:18 05/25/2025 - S Estrada Patient transported to Franciscan Health Olympia Fields by FLFD ALS",
              "Incident Narrative": "Bracken, Daniel 5/27/2025 9:45:22 AM -05:00: Ambulance 19 responded for chest pain. Patient alert and oriented, complaining of substernal chest pressure radiating to left arm. 12-lead ECG showed ST elevation in inferior leads. Crew initiated ALS protocol, administered aspirin and nitroglycerin per medical control. Patient transported priority 1 to Franciscan Health Olympia Fields. See EHR PCR #25-00914 for full details.",
              "IncidentID": "bf81a92b-cd7f-4a96-ac5c-b2e800c264ee"
            }
            User Message: "${content}"`,
        });

        console.log("Generated Search Query:", searchQuery);

        // Step 2: Search for relevant documents
        let relevantContent = "";

        try {
            const searchResults = await searchVectorize(searchQuery);

            if (searchResults.documents && searchResults.documents.length > 0) {
                console.log(searchResults);
                relevantContent = searchResults.documents
                    .map((doc, index) => {
                        const filename =
                            decodeURIComponent(doc.source_display_name.split("/")[2]) ||
                            `Document ${index + 1}`;
                        return `[Source: ${filename}]\n${doc.text}`;
                    })
                    .join("\n\n");
            }
        } catch (searchError) {
            console.error("Vector search failed:", searchError);
        }

        // Step 3: Stream response
        const result = streamText({
            model: google("gemini-2.5-pro"),
            messages: modelMessages,
            system: `You are a helpful AI assistant with access to a knowledge base.
            
            Relevant Context from Knowledge Base:
            ${relevantContent ? relevantContent : "No relevant documents found."
                }
            Instructions:
            1. Use the provided context to answer the user's question.
            2. If the answer is found in the context, cite the source (e.g., "[Source: filename]").
            3. If the answer is NOT in the context, use your general knowledge but mention that the info didn't come from the knowledge base.
            4. Be concise and helpful.
            5. If user ask for total number use data `,
        });

        // AI SDK 5.0: Return UI message stream response
        return result.toUIMessageStreamResponse({
            originalMessages: messages,
            // Optional: Add message persistence
            // generateMessageId: () => generateId(),
            // onFinish: async ({ messages, responseMessage }) => {
            //     await saveMessages(messages);
            // },
        });
    } catch (error: any) {
        console.error("Chat error:", error);
        return new Response(
            JSON.stringify({
                error:
                    error.message || "An error occurred while processing your request.",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}