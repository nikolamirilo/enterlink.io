# RAG Web Application

A simple yet powerful RAG (Retrieval Augmented Generation) web application built with Next.js and Supabase. Upload PDF, TXT, or CSV files and search through them using semantic AI-powered search.

## Features

- 📄 **File Upload**: Drag-and-drop interface for PDF, TXT, and CSV files
- 📊 **Smart CSV Processing**: Optimized chunking strategies for CSV data with semantic search
- 🤖 **AI-Powered Search**: Semantic search using OpenAI embeddings
- 🔍 **Vector Similarity**: Fast and accurate search using pgvector
- 💾 **Supabase Backend**: Scalable database with vector support
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase with pgvector extension
- **AI**: OpenAI Embeddings (text-embedding-3-small)
- **File Processing**: pdf-parse for PDF extraction, papaparse for CSV parsing
- **UI Components**: react-dropzone, lucide-react

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- An OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd rag-poc
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `supabase-schema.sql` to:
   - Enable the pgvector extension
   - Create the documents table
   - Create the similarity search function

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=your-openai-api-key
   ```

   **Where to find these values:**
   - Supabase URL and keys: Project Settings → API in Supabase dashboard
   - OpenAI API key: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Uploading Documents

1. Navigate to the home page
2. Drag and drop a PDF, TXT, or CSV file into the dropzone (or click to browse)
3. Click "Submit Document"
4. Wait for the processing to complete (the file will be chunked and embedded)

**CSV Files**: CSV files are processed using intelligent chunking strategies optimized for semantic search. See [CSV_CHUNKING_GUIDE.md](./CSV_CHUNKING_GUIDE.md) for detailed information.

### Searching Documents

1. Click "Search Documents" or navigate to `/search`
2. Enter your search query in natural language
3. View results ranked by semantic similarity
4. Each result shows:
   - The matching text chunk
   - Source filename
   - Chunk position
   - Similarity score

## How It Works

1. **Upload**: When you upload a file, it's processed on the server:
   - Text is extracted (from PDF or TXT)
   - Text is split into ~800 character chunks with overlap
   - Each chunk is converted to a 1536-dimension vector using OpenAI
   - Chunks and embeddings are stored in Supabase

2. **Search**: When you search:
   - Your query is converted to an embedding
   - Vector similarity search finds the most relevant chunks
   - Results are ranked by cosine similarity
   - Top matches are displayed with context

## Project Structure

```
rag-poc/
├── app/
│   ├── api/
│   │   ├── upload/route.ts      # Text/paste upload endpoint
│   │   ├── upload-csv/route.ts  # CSV upload endpoint
│   │   └── search/route.ts      # Search endpoint
│   ├── search/
│   │   └── page.tsx             # Search page
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   └── FileDropzone.tsx         # File upload component
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── openai.ts                # OpenAI client
│   ├── text-chunker.ts          # Text chunking utility
│   ├── csv-chunker.ts           # CSV chunking utility
│   └── pdf-parser.ts            # PDF parsing utility
├── supabase-schema.sql          # Database schema
├── CSV_CHUNKING_GUIDE.md        # CSV chunking strategies guide
└── env.example                  # Environment variables template
```

## Customization

### Adjust Chunk Size

Edit `lib/text-chunker.ts`:
```typescript
chunkText(text, chunkSize: 800, overlap: 200)
```

### Change Search Threshold

Edit `app/api/search/route.ts`:
```typescript
match_threshold: 0.5  // Lower = more results, higher = more precise
match_count: 10       // Maximum number of results
```

### Modify Embedding Model

Edit `lib/openai.ts`:
```typescript
model: 'text-embedding-3-small'  // or 'text-embedding-3-large'
```

## Troubleshooting

### "Failed to create embedding"
- Check your OpenAI API key is valid
- Ensure you have credits in your OpenAI account

### "Failed to store documents"
- Verify Supabase credentials are correct
- Check that the pgvector extension is enabled
- Ensure the documents table exists

### PDF parsing errors
- Some PDFs may be image-based (scanned documents)
- Consider adding OCR support for scanned PDFs

## Future Enhancements

- [ ] Support for more file types (DOCX, HTML, etc.)
- [ ] OCR for scanned PDFs
- [ ] Document management (view, delete uploaded docs)
- [ ] Advanced filters (by date, file type, etc.)
- [ ] Export search results
- [ ] User authentication
- [ ] Rate limiting

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
