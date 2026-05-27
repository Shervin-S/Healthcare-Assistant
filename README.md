# 🏥 Healthcare RAG Assistant

A Retrieval-Augmented Generation (RAG) system for healthcare information, powered by n8n, Google Gemini, and Supabase vector storage.

![Healthcare RAG](https://img.shields.io/badge/AI-RAG%20Powered-00A67E?style=for-the-badge)
![n8n](https://img.shields.io/badge/Automation-n8n-EA4B71?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge)
![Gemini](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4?style=for-the-badge)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [n8n Workflow Configuration](#n8n-workflow-configuration)
- [Supabase Setup](#supabase-setup)
- [Chat UI](#chat-ui)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This project implements a RAG-based healthcare assistant that:

1. **Ingests Documents**: Automatically processes PDF files uploaded to Google Drive
2. **Creates Embeddings**: Converts documents into vector embeddings using Google Gemini
3. **Stores in Vector DB**: Saves embeddings in Supabase for efficient similarity search
4. **Answers Questions**: Uses RAG to provide accurate, context-aware responses from your knowledge base

### Key Features

- ✅ **Automated Document Processing** - Upload PDFs to Google Drive, they're automatically embedded
- ✅ **Vector Search** - Fast similarity search using Supabase pgvector
- ✅ **AI-Powered Responses** - Google Gemini generates accurate healthcare information
- ✅ **Modern Chat UI** - Beautiful, responsive interface for asking questions
- ✅ **Real-time Webhooks** - Instant communication between UI and n8n

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            HEALTHCARE RAG SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────── DOCUMENT INGESTION FLOW ────────────────────────┐ │
│  │                                                                          │ │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │ │
│  │   │   Google     │───▶│   Download   │───▶│  Supabase Vector Store   │  │ │
│  │   │   Drive      │    │    File      │    │       (Storing)          │  │ │
│  │   │   Trigger    │    │              │    │                          │  │ │
│  │   └──────────────┘    └──────────────┘    └────────────┬─────────────┘  │ │
│  │         │                                               │               │ │
│  │         │ (Every minute)                                │               │ │
│  │         ▼                                               ▼               │ │
│  │   Watches folder:                           ┌──────────────────────┐    │ │
│  │   "RAG" for new files                       │  Default Data Loader │    │ │
│  │                                             │      (PDF Loader)    │    │ │
│  │                                             └──────────┬───────────┘    │ │
│  │                                                        │               │ │
│  │                                             ┌──────────▼───────────┐    │ │
│  │                                             │ Recursive Character  │    │ │
│  │                                             │   Text Splitter      │    │ │
│  │                                             │  (chunk: 1000,       │    │ │
│  │                                             │   overlap: 100)      │    │ │
│  │                                             └──────────┬───────────┘    │ │
│  │                                                        │               │ │
│  │                                             ┌──────────▼───────────┐    │ │
│  │                                             │ Embeddings Google    │    │ │
│  │                                             │      Gemini          │    │ │
│  │                                             └──────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────── CHAT FLOW ───────────────────────────────────┐ │
│  │                                                                          │ │
│  │   ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │ │
│  │   │ Chat UI  │───▶│   Webhook    │───▶│  AI Agent    │───▶│  Respond  │ │ │
│  │   │          │    │ POST/messages│    │  (Gemini)    │    │ to Webhook│ │ │
│  │   └──────────┘    └──────────────┘    └──────┬───────┘    └─────┬─────┘ │ │
│  │        ▲                                      │                  │      │ │
│  │        │                                      ▼                  │      │ │
│  │        │                           ┌──────────────────┐          │      │ │
│  │        │                           │ Supabase Vector  │          │      │ │
│  │        │                           │ Store (Retrieve) │          │      │ │
│  │        │                           │    + Gemini      │          │      │ │
│  │        │                           │   Embeddings     │          │      │ │
│  │        │                           └──────────────────┘          │      │ │
│  │        │                                                         │      │ │
│  │        └─────────────────────────────────────────────────────────┘      │ │
│  │                              (JSON Response)                            │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before setting up, ensure you have:

| Service | Purpose | Required |
|---------|---------|----------|
| [n8n](https://n8n.io/) | Workflow automation | ✅ Yes |
| [Supabase](https://supabase.com/) | Vector database | ✅ Yes |
| [Google Cloud](https://console.cloud.google.com/) | Gemini API + Drive | ✅ Yes |
| Web Browser | Run Chat UI | ✅ Yes |

---

## ⚙️ n8n Workflow Configuration

### Importing the Workflow

1. Open n8n (default: `http://localhost:5678`)
2. Go to **Workflows** → **Import from file**
3. Select `RAG Model.json`
4. Configure the required credentials (see below)

---

### 🔐 Required Credentials

#### 1. Google Drive OAuth2

| Setting | Value |
|---------|-------|
| **Credential Name** | Google Drive account |
| **Type** | OAuth2 |
| **Scopes** | `https://www.googleapis.com/auth/drive.readonly` |

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`
7. Copy **Client ID** and **Client Secret** to n8n

---

#### 2. Google Gemini (PaLM) API

| Setting | Value |
|---------|-------|
| **Credential Name** | Google Gemini(PaLM) Api account |
| **Type** | API Key |

**Setup Steps:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the API key to n8n

---

#### 3. Supabase API

| Setting | Value |
|---------|-------|
| **Credential Name** | Supabase account |
| **Host** | `https://your-project-id.supabase.co` |
| **Service Role Key** | Your service role key (from Supabase dashboard) |

**Setup Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Host
   - **service_role** key → Service Role Key (not anon key!)

---

### 📋 Workflow Nodes Explained

#### Document Ingestion Flow

| Node | Type | Purpose | Configuration |
|------|------|---------|---------------|
| **Google Drive Trigger** | Trigger | Watches for new files | Folder: `RAG`, Event: File Created, Poll: Every minute |
| **Download file** | Action | Downloads the PDF | Uses file ID from trigger |
| **Default Data Loader** | AI | Parses PDF content | Type: Binary, Loader: PDF |
| **Recursive Character Text Splitter** | AI | Chunks the text | Chunk size: 1000, Overlap: 100 |
| **Embeddings Google Gemini** | AI | Creates embeddings | Uses Gemini embedding model |
| **Supabase Vector Store (Storing)** | AI | Stores vectors | Table: `documents`, Mode: Insert |

#### Chat Flow

| Node | Type | Purpose | Configuration |
|------|------|---------|---------------|
| **Webhook** | Trigger | Receives chat messages | Method: POST, Path: `/messages` |
| **AI Agent** | AI | Processes questions with RAG | Model: Gemini, System prompt: Healthcare assistant |
| **Supabase Vector Store (Retrieve)** | AI | Retrieves relevant documents | Table: `documents`, Top K: 3 |
| **Embeddings Google Gemini** | AI | Creates query embeddings | Same config as ingestion |
| **Respond to Webhook** | Action | Sends response back | Returns all incoming items |

---

### 🤖 AI Agent Configuration

The AI Agent is configured with a healthcare-focused system prompt:

```
You are a healthcare assistant that uses retrieval-augmented generation (RAG) 
to answer medical questions. First, retrieve relevant information from the 
provided medical document database. Then, generate an accurate, context-aware 
response based ONLY on the retrieved medical content and the user's query.

Rules:
• Provide clear answers supported by retrieved documents from the knowledge base.
• Do NOT hallucinate or guess medical facts that are not supported by the retrieved texts.
• If the information is not available in the documents, respectfully say you don't 
  have enough data to answer but suggest what kind of reliable source we should add.
• Always use formal, professional language appropriate for clinical and medical contexts.
```

---

## 🗄️ Supabase Setup

### Creating the Vector Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table for storing embeddings
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(768)  -- Gemini embeddings are 768 dimensions
);

-- Create an index for faster similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create the similarity search function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(768),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE documents.metadata @> filter
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Verifying Setup

Check that your table exists:

```sql
SELECT COUNT(*) FROM documents;
```

---

## 💬 Chat UI

### File Structure

```
chat-ui/
├── index.html      # Main HTML structure
├── styles.css      # Modern dark theme styling
└── script.js       # Webhook integration & chat logic
```

### Running the Chat UI

1. **Open directly in browser:**
   ```
   file:///c:/Users/SHERVIN/Documents/RAG/chat-ui/index.html
   ```

2. **Or use a local server:**
   ```bash
   cd chat-ui
   npx serve .
   ```

### Configuration

The webhook URL is pre-configured to:

| Environment | URL |
|-------------|-----|
| **Production** | `http://localhost:5678/webhook/messages` |
| **Test** | `http://localhost:5678/webhook-test/messages` |

To change the URL:
1. Click the **Settings** icon (⚙️) in the top-right
2. Enter your webhook URL
3. Click **Save Settings**

### Features

- 🌙 **Dark Mode** - Eye-friendly healthcare theme
- ⚡ **Quick Actions** - Pre-set common questions
- 📝 **Markdown Support** - Formatted responses
- 🔄 **Typing Indicators** - Visual feedback while waiting
- 📱 **Responsive** - Works on mobile and desktop

---

## 📡 API Reference

### Send Message

**Endpoint:** `POST /webhook/messages`

**Request Body:**
```json
{
  "record": {
    "content": "What are the symptoms of diabetes?"
  }
}
```

**Response:**
```json
[
  {
    "output": "Based on the medical documents in our knowledge base, common symptoms of diabetes include:\n\n1. Increased thirst...",
    "text": "..."
  }
]
```

### cURL Example

```bash
curl -X POST http://localhost:5678/webhook/messages \
  -H "Content-Type: application/json" \
  -d '{"record": {"content": "What are common symptoms of diabetes?"}}'
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Webhook Returns 500 Error

**Cause:** n8n workflow error or credentials issue

**Solution:**
- Check if the workflow is **activated** (toggle should be ON)
- For test URL, click **"Listen for Test Event"** in n8n first
- Check n8n **Execution Logs** for detailed error messages
- Verify all credentials are valid and not expired

#### 2. No Documents Retrieved

**Cause:** Empty vector database or embedding mismatch

**Solution:**
- Check Supabase: `SELECT COUNT(*) FROM documents;`
- Re-upload a PDF to the Google Drive "RAG" folder
- Ensure the embedding dimension matches (768 for Gemini)

#### 3. Google Drive Trigger Not Working

**Cause:** OAuth token expired or folder ID incorrect

**Solution:**
- Re-authenticate Google Drive credentials in n8n
- Verify the folder ID in the trigger matches your Drive folder
- Check that the folder has correct sharing permissions

#### 4. CORS Error in Chat UI

**Cause:** Browser blocking cross-origin requests

**Solution:**
- Use the **file://** protocol (open index.html directly)
- Or run a local server: `npx serve .`
- Configure CORS in n8n if needed

#### 5. Slow Response Times

**Cause:** Large documents or cold start

**Solution:**
- Reduce chunk size in Text Splitter
- Increase `topK` for more relevant results
- Ensure Supabase has proper indexes

---

## 📁 Project Structure

```
RAG/
├── RAG Model.json          # n8n workflow definition
├── README.md               # This documentation
└── chat-ui/
    ├── index.html          # Chat interface
    ├── styles.css          # Styling
    └── script.js           # JavaScript logic
```

---

## 🚀 Quick Start Checklist

- [ ] Install and run n8n locally
- [ ] Create Supabase project and run SQL setup
- [ ] Get Google Cloud credentials (Drive OAuth + Gemini API)
- [ ] Import `RAG Model.json` into n8n
- [ ] Configure all three credentials in n8n
- [ ] Create a "RAG" folder in Google Drive
- [ ] Upload a PDF to the RAG folder
- [ ] Activate the workflow
- [ ] Open `chat-ui/index.html` and start chatting!

---

## 🤝 Contributing

Feel free to submit issues and pull requests to improve this project.

---

<p align="center">
  Built with ❤️ using n8n, Supabase, and Google Gemini
</p>
