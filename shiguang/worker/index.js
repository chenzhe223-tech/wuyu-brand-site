const ALLOWED_ORIGIN = "https://chenzhe223-tech.github.io";
const MODEL = "glm-4.7-flash";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        ok: true,
        service: "shiguang-ai-api",
        model: MODEL,
        keyConfigured: Boolean(env.BIGMODEL_API_KEY)
      });
    }

    if (request.method !== "POST" || url.pathname !== "/api/poem") {
      return json({ error: "Not found" }, 404);
    }

    if (!env.BIGMODEL_API_KEY) {
      return json({ error: "AI 服务尚未配置密钥。请在 Cloudflare Worker 的 Secrets 中添加 BIGMODEL_API_KEY。" }, 503);
    }

    let rawBody;
    try {
      rawBody = await request.text();
    } catch {
      return json({ error: "无法读取请求内容，请重试。" }, 400);
    }
    if (rawBody.length > 12000) {
      return json({ error: "输入内容过长，请缩短记录后重试。" }, 413);
    }

    let input;
    try {
      input = JSON.parse(rawBody);
    } catch {
      return json({ error: "请求格式无效。" }, 400);
    }

    const title = String(input.title || "").trim().slice(0, 120);
    const record = String(input.text || "").trim().slice(0, 3000);
    const moods = Array.isArray(input.moods)
      ? input.moods.slice(0, 8).map((item) => String(item).slice(0, 30))
      : [];
    const style = ["natural", "classic", "modern"].includes(input.style) ? input.style : "natural";

    if (!record) {
      return json({ error: "请先写下一段真实的生活记录。" }, 400);
    }

    const styleText = {
      natural: "自然、真诚、当代中文，像一个敏感但不矫饰的人在回望生活。",
      classic: "含蓄凝练，有东方古典诗意与留白，但不要引用或仿写现成名句。",
      modern: "现代自由诗，节奏灵动，意象清晰，避免堆砌华丽辞藻。"
    }[style];

    const userPrompt =
      "请把以下真实生活记录写成一首原创中文诗。必须从具体细节出发，保留生活本身的温度；不要编造记录里没有的事件，不要说教，不要解释创作过程。" +
      "\n表达风格：" + styleText +
      "\n记录标题：" + (title || "无") +
      "\n心情标签：" + (moods.join("、") || "未填写") +
      "\n生活记录：\n" + record +
      "\n\n请只输出严格 JSON 对象，不要 Markdown 代码块。格式为 {\"title\":\"不超过16字的诗题\",\"poem\":\"诗歌正文，换行使用标准 JSON 转义符\\n\"}。";

    let upstream;
    try {
      upstream = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.BIGMODEL_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: "你是「拾光 SHIGUANG」的专属诗歌创作者。品牌内核：拾起时光，留住人间。尊重用户真实记忆，温柔、克制、有画面感。"
            },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.85,
          top_p: 0.85,
          thinking: { type: "disabled" },
          max_tokens: 900,
          stream: false
        })
      });
    } catch {
      return json({ error: "暂时无法连接诗歌模型，请稍后重试。" }, 502);
    }

    if (!upstream.ok) {
      if (upstream.status === 401 || upstream.status === 403) {
        return json({ error: "模型密钥无效或没有调用权限，请检查 Cloudflare Secret 配置。" }, 502);
      }
      if (upstream.status === 429) {
        return json({ error: "模型服务繁忙或额度不足，请稍后重试。" }, 429);
      }
      return json({ error: "模型暂时无法生成，请稍后重试。" }, 502);
    }

    let payload;
    try {
      payload = await upstream.json();
    } catch {
      return json({ error: "模型返回内容无法读取，请重试。" }, 502);
    }

    const answer = payload && payload.choices && payload.choices[0] &&
      payload.choices[0].message && payload.choices[0].message.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return json({ error: "模型没有返回诗歌，请重试。" }, 502);
    }

    let poemTitle = title || "拾光";
    let poemText = answer.trim();
    try {
      const cleaned = poemText.replace(/^\u0060{3}(?:json)?\s*/i, "").replace(/\s*\u0060{3}$/, "");
      const parsed = JSON.parse(cleaned);
      poemTitle = String(parsed.title || poemTitle).trim().slice(0, 60);
      poemText = String(parsed.poem || parsed.text || poemText).trim();
    } catch {
      // Keep plain-text output editable if the model does not follow the requested JSON format.
    }

    if (!poemText) {
      return json({ error: "模型没有返回有效诗歌，请重试。" }, 502);
    }

    return json({
      title: poemTitle || "拾光",
      poem: poemText.slice(0, 6000),
      model: payload.model || MODEL
    });
  }
};
