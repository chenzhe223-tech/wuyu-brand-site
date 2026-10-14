# 物遇 WUYU 品牌官网

这是一个响应式单页品牌网站，使用原生 HTML/CSS/JavaScript，可直接通过 GitHub Pages 发布。

## 文件结构
- `index.html`：品牌介绍、功能规划、品牌色彩，以及显眼的应用入口。
- `js/app-config.js`：应用入口与 API 基地址配置。
- `js/api-client.js`：统一的 API 请求适配层。
- `API.md`：预留接口清单、契约建议和安全约束。
- `.github/workflows/pages.yml`：推送到 `main` 后自动部署到 GitHub Pages。

## GitHub Pages 发布
1. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
2. 向 `main` 提交代码后，打开 Actions 检查 “Deploy WUYU website to GitHub Pages”。
3. 成功后，可在部署任务的 `github-pages` 环境中打开网站链接。默认预期地址为 `https://chenzhe223-tech.github.io/wuyu-brand-site/`。

## API 当前状态
API 适配层已预留，但后端未部署，`API_BASE_URL` 默认为空。页面不会伪造金价或报价。不要在静态前端放 API Key、数据库密码或其他私密凭证；需要密钥的数据源必须通过后端代理访问。

当前尚未接入实时金价、AI 识款、账号、商家匹配、交易、支付或物流服务。品牌名称为提案，商标与域名可用性尚未核验。
