/* 物遇应用配置：不要在静态前端写入 API 密钥或私密凭证。 */
window.WUYU_CONFIG = Object.freeze({
  API_BASE_URL: "", // 后端上线后填写 HTTPS API 根地址，例如 https://api.example.com
  API_MODE: "not_connected",
  APP_ENTRY_URL: "",
  ENDPOINTS: Object.freeze({
    goldPrice: "/api/v1/market/gold-price",
    quotePreview: "/api/v1/quotes/preview",
    styleSearch: "/api/v1/catalog/search",
    merchantSearch: "/api/v1/merchants/search",
    inquiryCreate: "/api/v1/inquiries"
  })
});
