# SHIGUANG AI poem API

## Current production setup

The live app uses a Node API service on Render:

- App: https://chenzhe223-tech.github.io/wuyu-brand-site/shiguang/
- API health: https://shiguang-ai-api.onrender.com/health
- API endpoint: `POST https://shiguang-ai-api.onrender.com/api/poem`
- Node entrypoint: `shiguang/worker/server.cjs`
- Render service: https://dashboard.render.com/web/srv-db8og9ui0phs738eqjeg

The Render service is configured to run `node shiguang/worker/server.cjs`. It uses the `BIGMODEL_API_KEY` environment variable stored in Render's service settings; the secret value is not stored in this repository.

## Model behavior

The API first tries `glm-4.7-flash`. If that model specifically reports temporary overload, it retries once with the free `glm-4-flash-250414` model. Other errors are reported instead of silently generating a template poem. Both models follow the same prompt and return editable poem title/content.

## Verify production

The GitHub Actions workflow `.github/workflows/smoke-test-shiguang-ai.yml` checks the live health endpoint and makes a real test request to the model. See [the workflow runs](https://github.com/chenzhe223-tech/wuyu-brand-site/actions/workflows/smoke-test-shiguang-ai.yml).

## Data and privacy

The frontend sends only the user's record title, text, mood labels, and chosen style to the model API when they tap to generate a poem. Photo data is not included. Original records and photos remain in browser local storage unless the user exports them.

The endpoint allows browser requests from `https://chenzhe223-tech.github.io` and applies a basic per-instance rate limit. CORS is not authentication; before promoting the app broadly, add a stronger abuse control such as Cloudflare Turnstile and/or a shared edge rate limit.

## Cloudflare Worker alternative

`index.js` and `wrangler.toml` are retained as an alternative Worker implementation. They are not the currently active production API. The active API is the Render service above.
