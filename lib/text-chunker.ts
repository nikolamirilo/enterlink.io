/**
 * Split text into chunks with overlap for better context preservation
 */
export function chunkText(
    text: string,
    chunkSize: number = 800,
    overlap: number = 200
): string[] {
    const chunks: string[] = []

    // Clean the text
    const cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

    if (cleanedText.length === 0) {
        return chunks
    }

    // Split by sentences to preserve context
    const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText]

    let currentChunk = ''

    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim()

        // If adding this sentence would exceed chunk size
        if (currentChunk.length + trimmedSentence.length > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim())

            // Start new chunk with overlap from previous chunk
            const words = currentChunk.split(' ')
            const overlapWords = words.slice(-Math.floor(overlap / 5)) // Approximate word count for overlap
            currentChunk = overlapWords.join(' ') + ' ' + trimmedSentence
        } else {
            currentChunk += (currentChunk ? ' ' : '') + trimmedSentence
        }
    }

    // Add the last chunk if it exists
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
    }

    return chunks
}
