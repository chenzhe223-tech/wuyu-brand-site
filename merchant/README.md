# 物遇 WUYU · 商家工作台 MVP

品牌官网和商家工作台当前位于同一个 GitHub Pages 项目中，分别独立于不同路径。

- 品牌官网：/
- 商家工作台：/merchant/
- 产品规格：merchant/PRODUCT_SPEC.md
- API 规划：merchant/API_CONTRACT.md

## 当前可用
商品手册 CRUD、手动黄金报价计算、报价快照保存、报价文本复制/TXT 下载、客户询价增删改、状态筛选、本机 JSON 数据备份与恢复、移动端响应布局。

## 当前限制
这是可交互 MVP，不是完整商用系统。数据保存在当前浏览器 localStorage，清理浏览器数据或换设备不会自动同步。金价需手动录入，未连接实时金价、账号、云端数据库、AI 识款、支付及物流。首次打开会创建明确标识的示例商品和询价，可编辑、删除或重置。

## 发布
GitHub Pages 使用仓库根目录作为静态发布内容。提交到 main 后，.github/workflows/pages.yml 会重新发布。部署成功后访问 https://chenzhe223-tech.github.io/wuyu-brand-site/merchant/。

## 本地验证
直接用浏览器打开 merchant/index.html 可体验界面和本地功能；正式发布建议从 GitHub Pages 地址访问以验证相对路径和存储行为。
