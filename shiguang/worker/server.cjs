const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = "https://chenzhe223-tech.github.io";
const ALLOWED_ORIGINS = new Set([ALLOWED_ORIGIN, "https://shiguang-ai-api.onrender.com"]);
const APP_HTML_PATH = path.resolve(__dirname, "../index.html");
const MODEL = "deepseek-flash";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const buckets = new Map();

function headers() {
  return {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { ...headers(), "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}
function rateLimited(ip) {
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) bucket = { startedAt: now, count: 0 };
  bucket.count += 1;
  buckets.set(ip, bucket);
  if (buckets.size > 3000) {
    for (const [key, val] of buckets) if (now - val.startedAt >= WINDOW_MS) buckets.delete(key);
  }
  return bucket.count > MAX_REQUESTS_PER_WINDOW;
}
function readJson(req, limit = 12000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0, failed = false;
    req.on("data", chunk => {
      if (failed) return;
      size += chunk.length;
      if (size > limit) {
        failed = true;
        reject(Object.assign(new Error("输入内容过长，请缩短记录后重试。"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (failed) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(Object.assign(new Error("请求格式无效。"), { statusCode: 400 })); }
    });
    req.on("error", error => { if (!failed) reject(error); });
  });
}
function parsePoem(answer, originalTitle) {
  let title = String(originalTitle || "拾光").slice(0, 60);
  let poem = String(answer || "").trim();
  const cleaned = poem.replace(/^\u0060{3}(?:json)?\s*/i, "").replace(/\s*\u0060{3}$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    title = String(parsed.title || title).trim().slice(0, 60);
    poem = String(parsed.poem || parsed.text || poem).trim();
  } catch {}
  return { title: title || "拾光", poem: poem.slice(0, 6000) };
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const path = new URL(req.url, "http://localhost").pathname;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", origin && ALLOWED_ORIGINS.has(origin) ? origin : ALLOWED_ORIGIN);
  if (req.method === "OPTIONS") { res.writeHead(204, headers()); res.end(); return; }
  if (req.method === "GET" && (path === "/" || path === "/shiguang" || path === "/shiguang/")) {
    try {
      const html = fs.readFileSync(APP_HTML_PATH);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(html);
    } catch (error) {
      console.error("Could not read SHIGUANG app HTML", error.message);
      sendJson(res, 500, { error: "拾光页面暂时无法加载，请稍后重试。" });
    }
    return;
  }
  if (req.method === "GET" && path === "/health") {
    sendJson(res, 200, { ok: true, service: "shiguang-ai-api", provider: "DeepSeek", model: MODEL, keyConfigured: Boolean(process.env.DEEPSEEK_API_KEY) });
    return;
  }
  if (req.method !== "POST" || path !== "/api/poem") { sendJson(res, 404, { error: "Not found" }); return; }
  if (!process.env.DEEPSEEK_API_KEY) {
    sendJson(res, 503, { error: "DeepSeek 服务尚未配置密钥，请在后端环境变量中设置 DEEPSEEK_API_KEY。" });
    return;
  }
  const ip = String(req.headers["x-real-ip"] || req.socket.remoteAddress || "unknown").slice(0, 100);
  if (rateLimited(ip)) { sendJson(res, 429, { error: "请求过于频繁，请稍后再试。" }); return; }

  let input;
  try { input = await readJson(req); }
  catch (error) {
    if (!res.headersSent && !res.destroyed) sendJson(res, error.statusCode || 400, { error: error.message || "请求读取失败，请重试。" });
    return;
  }

  const title = String(input.title || "").trim().slice(0, 120);
  const record = String(input.text || "").trim().slice(0, 3000);
  const moods = Array.isArray(input.moods) ? input.moods.slice(0, 8).map(item => String(item).slice(0, 30)) : [];
  const style = ["natural", "classic", "modern"].includes(input.style) ? input.style : "natural";
  if (!record) { sendJson(res, 400, { error: "请先写下一段真实的生活记录。" }); return; }

  const styleText = {
    natural: "自然、真诚、当代中文，像一个敏感但不矫饰的人在回望生活。",
    classic: "含蓄凝练，有东方古典诗意与留白，但不要引用或仿写现成名句。",
    modern: "现代自由诗，节奏灵动，意象清晰，避免堆砌华丽辞藻。"
  }[style];
  const prompt = "请把以下真实生活记录写成一首原创中文诗。必须从具体细节出发，保留生活本身的温度；不要编造记录里没有的事件，不要说教，不要解释创作过程。" +
    "\n表达风格：" + styleText + "\n记录标题：" + (title || "无") +
    "\n心情标签：" + (moods.join("、") || "未填写") + "\n生活记录：\n" + record +
    "\n\n请只输出严格 JSON 对象，不要 Markdown 代码块。格式为 {\"title\":\"不超过16字的诗题\",\"poem\":\"诗歌正文，换行使用\\\\n\"}。";

  let upstream;
  try {
    upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.DEEPSEEK_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "你是「拾光 SHIGUANG」的专属诗歌创作者。品牌内核：拾起时光，留住人间。尊重用户真实记忆，温柔、克制、有画面感。请用简洁自然的中文创作，避免陈词滥调。"
          },
          { role: "user", content: prompt }
        ],
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        temperature: 0.85,
        top_p: 0.85,
        max_tokens: 900,
        stream: false
      }),
      signal: AbortSignal.timeout(45000)
    });
  } catch {
    sendJson(res, 502, { error: "暂时无法连接 DeepSeek，请稍后重试。" });
    return;
  }

  if (!upstream.ok) {
    let providerMessage = "";
    let providerCode = "";
    try {
      const providerError = await upstream.json();
      const detail = providerError && providerError.error ? providerError.error : providerError;
      providerMessage = String((detail && (detail.message || detail.msg)) || "").slice(0, 220);
      providerCode = String((detail && (detail.code || detail.type)) || "").slice(0, 40);
    } catch {}
    console.warn("DeepSeek API failure", JSON.stringify({ status: upstream.status, code: providerCode, message: providerMessage }));
    if (upstream.status === 401 || upstream.status === 403) {
      sendJson(res, 502, { error: "DeepSeek API Key 无效或没有调用权限，请检查后端密钥配置。" });
    } else if (upstream.status === 429) {
      const detail = providerMessage ? " 模型服务提示：" + providerMessage : "";
      sendJson(res, 429, { error: "DeepSeek 服务繁忙、请求受限或账号可用额度不足，请稍后重试。" + detail });
    } else {
      const detail = providerMessage ? " 模型服务提示：" + providerMessage : "";
      sendJson(res, 502, { error: "DeepSeek 暂时无法生成，请稍后重试。" + detail });
    }
    return;
  }
  let payload;
  try { payload = await upstream.json(); }
  catch { sendJson(res, 502, { error: "模型返回内容无法读取，请重试。" }); return; }
  const answer = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
  if (typeof answer !== "string" || !answer.trim()) { sendJson(res, 502, { error: "模型没有返回诗歌，请重试。" }); return; }
  const result = parsePoem(answer, title);
  if (!result.poem) { sendJson(res, 502, { error: "模型没有返回有效诗歌，请重试。" }); return; }
  sendJson(res, 200, { title: result.title, poem: result.poem, model: payload.model || activeModel });
});
server.listen(PORT, "0.0.0.0", () => console.log("SHIGUANG poem API listening on port " + PORT));
