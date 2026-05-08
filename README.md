# Decision Risk React App

React + TypeScript version of the Decision Risk Scoring Tool.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in your terminal, usually:

```text
http://localhost:5173
```

## LLM options

The app includes three modes:

1. **Mock / Local** — no API key required. Useful for testing UI and workflow.
2. **Anthropic Claude** — calls `https://api.anthropic.com/v1/messages` directly from the browser.
3. **OpenAI-compatible** — calls a chat-completions endpoint such as `https://api.openai.com/v1/chat/completions`.

## Important production note

Do not expose real API keys in a browser app for production. Create a backend endpoint such as `/api/analyze-risk`, store the key in server environment variables, and call the LLM from the backend.

## Main files

- `src/App.tsx` — main page and state management
- `src/components/IndicatorCard.tsx` — scoring card component
- `src/components/ResultPanel.tsx` — result display
- `src/components/HistoryList.tsx` — prior evaluations
- `src/services/llmService.ts` — LLM integration layer
- `src/data/rubrics.ts` — indicators, rubrics, scoring bands
- `src/types/risk.ts` — TypeScript interfaces
