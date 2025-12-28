import { PDFParse } from 'pdf-parse'

/**
 * Extract text content from a PDF buffer using pdf-parse v2 API
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer })

    try {
        const result = await parser.getText()
        return result.text
    } catch (error) {
        console.error('Error parsing PDF:', error)
        throw new Error('Failed to extract text from PDF')
    } finally {
        // Always destroy the parser to free memory
        await parser.destroy()
    }
}
