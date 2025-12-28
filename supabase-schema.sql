-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table to store document chunks and their embeddings
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on the embedding column for faster similarity search
create index if not exists documents_embedding_idx on documents 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create a simple function to search for documents based on similarity
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float default 0.01,
  match_count int default 10
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.embedding is not null
    and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
