# SHIGUANG poem API

This Worker keeps the BigModel API key on the server and exposes a poem-generation endpoint for the static SHIGUANG site.

## One-time Cloudflare setup

The GitHub Actions deployment workflow is at `.github/workflows/deploy-shiguang-worker.yml`. To enable it:

1. In Cloudflare Dashboard, create a Worker named `shiguang-ai-api` once if it does not already exist.
2. Create a Cloudflare API token with permission to edit this Worker. Prefer scoping it to this Worker; do not grant account-wide Admin if it is not needed.
3. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret**, and add:
   - `CLOUDFLARE_API_TOKEN`: the token created in Cloudflare.
   - `CLOUDFLARE_ACCOUNT_ID`: the account ID shown in the Cloudflare dashboard.
4. The Worker source in this folder will deploy automatically when files under `shiguang/worker/` change. You can also start it manually from the repository's **Actions** tab.

If you prefer local deployment, run from the repository root:

```bash
npx wrangler login
npx wrangler deploy --config shiguang/worker/wrangler.toml
npx wrangler secret put BIGMODEL_API_KEY --config shiguang/worker/wrangler.toml
```

## Configure the BigModel secret

After the first deploy, add a Worker secret named **`BIGMODEL_API_KEY`** through the Cloudflare Worker **Settings → Variables and Secrets** page, or use the Wrangler command above. Paste the key directly into Cloudflare or your local terminal prompt. Never put the value in source code, this repository, browser JavaScript, or this README. If a key has been shared publicly or in a chat, rotate it when practical.

## Verify

Open:

`https://shiguang-ai-api.chenzhe223.workers.dev/health`

The response should contain `"ok":true` and `"keyConfigured":true`.

The frontend sends only the record title, text, selected mood labels, and poem style to `POST /api/poem`. Photos are not included. Original records and photo data stay in browser local storage unless the user explicitly exports them. The API allows browser requests from `https://chenzhe223-tech.github.io`.

## Before public promotion

CORS limits browser origins but is not authentication. Before inviting broad public traffic, add abuse controls such as Cloudflare rate limiting and usage monitoring to protect the model quota. The Worker uses `glm-4.7-flash`, the current free Flash model listed in the official [BigModel documentation](https://docs.bigmodel.cn/cn/guide/models/free/glm-4.7-flash).
