# SHIGUANG AI poem API

## Production setup

- App: https://chenzhe223-tech.github.io/wuyu-brand-site/shiguang/
- API health: https://shiguang-ai-api.onrender.com/health
- API endpoint: `POST https://shiguang-ai-api.onrender.com/api/poem`
- Node entrypoint: `shiguang/worker/server.cjs`
- Render service: https://dashboard.render.com/web/srv-db8og9ui0phs738eqjeg

The Render backend source has been migrated to the official DeepSeek Chat Completions endpoint. The target model is `deepseek-flash`, with its key read only from the server-side environment variable `DEEPSEEK_API_KEY`. The live Render deployment is not switched yet: configure the new key first, then redeploy and pass the smoke test. Never put the key in browser JavaScript or this repository.

## One required provider setup

Add `DEEPSEEK_API_KEY` as an environment variable in Render:

1. Open the Render service above.
2. Go to **Environment**.
3. Add `DEEPSEEK_API_KEY` with the API key created in the [DeepSeek Platform](https://platform.deepseek.com/).
4. Save changes and let Render redeploy the service.

The previous `BIGMODEL_API_KEY` is not used by the new backend source. It has not been copied into the new setting because it is a different provider's credential. Until DeepSeek is configured and redeployed, the live service may still report the previous provider.

## Model behavior

The backend calls `https://api.deepseek.com/chat/completions`, requests non-thinking mode and JSON output, and converts the structured response into an editable poem title and text. It does not silently fall back to local template poetry. Model requests may incur charges according to DeepSeek's current account pricing and balance.

Official references:
- [DeepSeek Chat Completions API](https://api-docs.deepseek.com/zh-cn/api/create-chat-completion/)
- [DeepSeek Models & Pricing](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)

## Verification

The GitHub Actions workflow `.github/workflows/smoke-test-shiguang-ai.yml` checks that the live health endpoint identifies DeepSeek and then makes a real model call. The latest check correctly failed because the live service has not yet switched and the DeepSeek key is not configured.

## Data and privacy

The frontend sends only the record title, text, mood labels, and chosen style when the user taps to generate a poem. Photo data is not included. Original records and photos remain in browser local storage unless the user exports them.

The endpoint allows browser requests from `https://chenzhe223-tech.github.io` and applies a basic per-instance rate limit. CORS is not authentication; before promoting the app broadly, add stronger abuse controls such as Cloudflare Turnstile and/or an edge rate limit.

## Cloudflare Worker alternative

`index.js` and `wrangler.toml` are retained as an alternative Worker implementation and now also use DeepSeek. They are not the currently active production API; the Render service above is active.
