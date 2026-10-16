# SHIGUANG poem API

This Worker keeps the BigModel API key on the server and exposes a small poem-generation endpoint for the static SHIGUANG site.

## Deploy

Run these commands from the repository root on a machine with Node.js installed:

```bash
npx wrangler login
npx wrangler deploy --config shiguang/worker/wrangler.toml
npx wrangler secret put BIGMODEL_API_KEY --config shiguang/worker/wrangler.toml
```

When prompted, paste your BigModel API key into the terminal prompt. Do not put it in a source file, GitHub secret that is exposed to a client build, or browser JavaScript. If a key has been shared publicly or in a chat, rotate it when practical.

## Verify

Open:

`https://shiguang-ai-api.chenzhe223.workers.dev/health`

The response should contain `"ok":true` and `"keyConfigured":true`.

The frontend sends only the record title, text, selected mood labels, and poem style to `POST /api/poem`. Photos are not included. Original records and photo data stay in browser local storage unless the user explicitly exports them. The API allows requests from `https://chenzhe223-tech.github.io`.

## Before public promotion

CORS limits browser origins but is not authentication. Before inviting broad public traffic, add abuse controls such as Cloudflare rate limiting and usage monitoring to protect the model quota. Confirm the model name and account availability in the BigModel console if API errors indicate that `glm-4.7-flash` is unavailable.
