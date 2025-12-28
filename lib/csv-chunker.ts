import Papa from 'papaparse'

/**
 * CSV Chunking Strategy optimized for semantic search
 * 
 * This strategy creates semantically meaningful chunks from CSV data by:
 * 1. Preserving column headers in each chunk for context
 * 2. Grouping rows into chunks with overlap for better retrieval
 * 3. Creating text representations that are optimized for embedding models
 * 4. Maintaining data relationships within chunks
 */

export interface CSVChunkOptions {
    rowsPerChunk?: number // Number of rows per chunk (default: 10)
    overlapRows?: number  // Number of overlapping rows between chunks (default: 2)
    includeHeaders?: boolean // Include headers in each chunk (default: true)
}

export interface CSVChunk {
    content: string
    metadata: {
        chunkIndex: number
        totalChunks: number
        rowStart: number
        rowEnd: number
        columnCount: number
        headers: string[]
    }
}

/**
 * Parse and chunk CSV data for optimal semantic search
 */
export function chunkCSV(
    csvContent: string,
    options: CSVChunkOptions = {}
): CSVChunk[] {
    const {
        rowsPerChunk = 10,
        overlapRows = 2,
        includeHeaders = true
    } = options

    // Parse CSV
    const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim()
    })

    if (parseResult.errors.length > 0) {
        console.error('CSV parsing errors:', parseResult.errors)
        throw new Error('Failed to parse CSV file')
    }

    const data = parseResult.data as Record<string, any>[]
    const headers = parseResult.meta.fields || []

    if (data.length === 0) {
        throw new Error('CSV file is empty')
    }

    const chunks: CSVChunk[] = []
    const totalRows = data.length
    let chunkIndex = 0

    // Calculate total number of chunks
    const totalChunks = Math.ceil(totalRows / (rowsPerChunk - overlapRows)) || 1

    for (let i = 0; i < totalRows; i += (rowsPerChunk - overlapRows)) {
        const endRow = Math.min(i + rowsPerChunk, totalRows)
        const chunkRows = data.slice(i, endRow)

        // Create semantic text representation
        const content = createSemanticChunkContent(headers, chunkRows, includeHeaders)

        chunks.push({
            content,
            metadata: {
                chunkIndex,
                totalChunks,
                rowStart: i,
                rowEnd: endRow - 1,
                columnCount: headers.length,
                headers
            }
        })

        chunkIndex++

        // Break if we've processed all rows
        if (endRow >= totalRows) break
    }

    return chunks
}

/**
 * Create a semantic text representation of CSV chunk
 * This format is optimized for embedding models to understand the data
 */
function createSemanticChunkContent(
    headers: string[],
    rows: Record<string, any>[],
    includeHeaders: boolean
): string {
    const lines: string[] = []

    // Add header context if enabled
    if (includeHeaders && headers.length > 0) {
        lines.push(`Data columns: ${headers.join(', ')}`)
        lines.push('---')
    }

    // Convert each row to a natural language representation
    rows.forEach((row, index) => {
        const rowParts: string[] = []

        headers.forEach(header => {
            const value = row[header]
            if (value !== null && value !== undefined && value !== '') {
                // Create key-value pairs in natural language
                rowParts.push(`${header}: ${value}`)
            }
        })

        if (rowParts.length > 0) {
            lines.push(`Row ${index + 1}: ${rowParts.join(', ')}`)
        }
    })

    return lines.join('\n')
}

/**
 * Alternative chunking strategy: Column-based chunking
 * Useful for wide CSV files with many columns
 */
export function chunkCSVByColumns(
    csvContent: string,
    columnsPerChunk: number = 5
): CSVChunk[] {
    const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim()
    })

    if (parseResult.errors.length > 0) {
        throw new Error('Failed to parse CSV file')
    }

    const data = parseResult.data as Record<string, any>[]
    const headers = parseResult.meta.fields || []
    const chunks: CSVChunk[] = []

    // Split columns into groups
    for (let i = 0; i < headers.length; i += columnsPerChunk) {
        const columnGroup = headers.slice(i, i + columnsPerChunk)

        const lines: string[] = []
        lines.push(`Columns: ${columnGroup.join(', ')}`)
        lines.push('---')

        data.forEach((row, rowIndex) => {
            const rowParts: string[] = []
            columnGroup.forEach(header => {
                const value = row[header]
                if (value !== null && value !== undefined && value !== '') {
                    rowParts.push(`${header}: ${value}`)
                }
            })

            if (rowParts.length > 0) {
                lines.push(`Row ${rowIndex + 1}: ${rowParts.join(', ')}`)
            }
        })

        chunks.push({
            content: lines.join('\n'),
            metadata: {
                chunkIndex: Math.floor(i / columnsPerChunk),
                totalChunks: Math.ceil(headers.length / columnsPerChunk),
                rowStart: 0,
                rowEnd: data.length - 1,
                columnCount: columnGroup.length,
                headers: columnGroup
            }
        })
    }

    return chunks
}

/**
 * Hybrid chunking strategy: Combines row and column chunking
 * Best for large CSV files with many rows and columns
 */
export function chunkCSVHybrid(
    csvContent: string,
    rowsPerChunk: number = 10,
    columnsPerChunk: number = 10
): CSVChunk[] {
    const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim()
    })

    if (parseResult.errors.length > 0) {
        throw new Error('Failed to parse CSV file')
    }

    const data = parseResult.data as Record<string, any>[]
    const headers = parseResult.meta.fields || []
    const chunks: CSVChunk[] = []
    let chunkIndex = 0

    // Split by columns first, then by rows
    for (let colStart = 0; colStart < headers.length; colStart += columnsPerChunk) {
        const columnGroup = headers.slice(colStart, colStart + columnsPerChunk)

        for (let rowStart = 0; rowStart < data.length; rowStart += rowsPerChunk) {
            const rowEnd = Math.min(rowStart + rowsPerChunk, data.length)
            const chunkRows = data.slice(rowStart, rowEnd)

            const lines: string[] = []
            lines.push(`Columns: ${columnGroup.join(', ')}`)
            lines.push('---')

            chunkRows.forEach((row, index) => {
                const rowParts: string[] = []
                columnGroup.forEach(header => {
                    const value = row[header]
                    if (value !== null && value !== undefined && value !== '') {
                        rowParts.push(`${header}: ${value}`)
                    }
                })

                if (rowParts.length > 0) {
                    lines.push(`Row ${rowStart + index + 1}: ${rowParts.join(', ')}`)
                }
            })

            chunks.push({
                content: lines.join('\n'),
                metadata: {
                    chunkIndex,
                    totalChunks: 0, // Will be set after all chunks are created
                    rowStart,
                    rowEnd: rowEnd - 1,
                    columnCount: columnGroup.length,
                    headers: columnGroup
                }
            })

            chunkIndex++
        }
    }

    // Update total chunks
    chunks.forEach(chunk => {
        chunk.metadata.totalChunks = chunks.length
    })

    return chunks
}
