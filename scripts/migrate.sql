-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for RAG
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(3072)
);

-- Create index for similarity search (IVFFlat for < 1M rows)
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- Enable RLS (optional, but recommended)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the chatbot)
CREATE POLICY "Allow public read" ON documents
  FOR SELECT USING (true);

-- Allow service role to insert/update (for the embed script)
CREATE POLICY "Allow service role insert" ON documents
  FOR INSERT WITH CHECK (true);
