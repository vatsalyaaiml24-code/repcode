# REPCODE Memory System

A Next.js application for capturing and querying project decisions and reasoning. Store technical decisions with context and let developers ask questions against your project memory.

## Features

- **Log Decisions**: Save technical decisions with context, tags, and AI-generated summaries
- **Ask Questions**: Query stored memories using natural language with AI-powered answers
- **Semantic Search**: Uses Membrain for intelligent memory retrieval
- **Modern UI**: Clean dark theme built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Groq SDK (LLaMA 3.1 8b)
- **Memory Storage**: Membrain API
- **Package Manager**: npm

## Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Access to the following API credentials:
  - Groq API key
  - Membrain API key and base URL
  - Default project ID for Membrain

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd repcode
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   MEMBRAIN_API_KEY=your_membrain_api_key_here
   MEMBRAIN_BASE_URL=your_membrain_base_url_here
   DEFAULT_PROJECT_ID=your_default_project_id_here
   ```

   > **Note**: Never commit `.env.local` to version control. The file is already in `.gitignore`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### POST `/api/log`

Log a new decision memory.

**Request Body:**
```json
{
  "title": "Decision title",
  "decision": "Description of the decision",
  "context": "Optional context and constraints",
  "tags": ["optional", "tags"]
}
```

### POST `/api/ask`

Ask a question against stored memories.

**Request Body:**
```json
{
  "question": "Your question about the project"
}
```

**Response:**
```json
{
  "answer": "AI-generated answer based on memories",
  "memoriesUsed": [
    {
      "id": "memory_id",
      "title": "Memory title",
      "summary": "Brief summary",
      "score": 0.95
    }
  ]
}
```

## Project Structure

```
repcode/
├── app/
│   ├── api/
│   │   ├── ask/
│   │   │   └── route.ts      # Ask question endpoint
│   │   └── log/
│   │       └── route.ts      # Log decision endpoint
│   ├── ask/
│   │   └── page.tsx          # Ask interface page
│   ├── log/
│   │   └── page.tsx          # Log decision page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   ├── AskInterface.tsx      # Ask form component
│   ├── LogForm.tsx           # Log form component
│   └── Navbar.tsx            # Navigation bar
├── lib/
│   ├── ai.ts                 # Groq AI integration
│   └── membrain.ts           # Membrain API client
├── .env.local                # Environment variables (create this)
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Deploy to platforms like Vercel, Railway, or any Node.js hosting provider.

   **Important**: Ensure all environment variables are set in your hosting platform.

### Production readiness checklist

- Ensure the following environment variables are configured in your deployment environment: `GROQ_API_KEY`, `MEMBRAIN_API_KEY`, `MEMBRAIN_BASE_URL`, `DEFAULT_PROJECT_ID`.
- Keep API keys server-side only (do not export them to client bundles).
- Verify `next build` completes successfully in CI and that `npm start` uses a production-ready Node (18+).
- Add health checks or a simple `/api/health` endpoint if your host requires it.
- Use a secrets manager or the platform's environment settings rather than committing `.env.local`.

See `.env.example` at the repository root for an example of required variables.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | API key for Groq AI service | Yes |
| `MEMBRAIN_API_KEY` | API key for Membrain service | Yes |
| `MEMBRAIN_BASE_URL` | Base URL for Membrain API | Yes |
| `DEFAULT_PROJECT_ID` | Default project ID for storing memories | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license information here]

## Support

For issues or questions, please open an issue on the GitHub repository.