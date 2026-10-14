/* 物遇 API 适配层：未配置后端时不会发送任何请求。 */
(function (global) {
  const config = global.WUYU_CONFIG || {};
  const endpoints = config.ENDPOINTS || {};
  const base = String(config.API_BASE_URL || "").replace(/\/$/, "");

  function buildUrl(path, query) {
    const url = new URL(base + path, global.location.href);
    if (query && typeof query === "object") {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
      });
    }
    return url.toString();
  }

  async function request(path, options = {}) {
    if (!base) {
      const error = new Error("物遇 API 尚未配置。请先部署后端，并配置 js/app-config.js 的 API_BASE_URL。");
      error.code = "WUYU_API_NOT_CONFIGURED";
      throw error;
    }
    const method = options.method || "GET";
    const headers = { Accept: "application/json", ...(options.headers || {}) };
    const init = { method, headers };
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
    const response = await fetch(buildUrl(path, options.query), init);
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) {
      const error = new Error((data && data.message) || ("WUYU_API_HTTP_" + response.status));
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  global.WUYUApi = Object.freeze({
    getGoldPrice: (query = {}) => request(endpoints.goldPrice, { query }),
    previewQuote: (payload) => request(endpoints.quotePreview, { method: "POST", body: payload }),
    searchStyles: (query = {}) => request(endpoints.styleSearch, { query }),
    searchMerchants: (query = {}) => request(endpoints.merchantSearch, { query }),
    createInquiry: (payload) => request(endpoints.inquiryCreate, { method: "POST", body: payload })
  });
})(window);
