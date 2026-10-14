# 物遇 WUYU 品牌官网与商家工作台

- 品牌官网： https://chenzhe223-tech.github.io/wuyu-brand-site/
- 商家工作台 MVP： https://chenzhe223-tech.github.io/wuyu-brand-site/merchant/
- 商家工作台产品规格： `merchant/PRODUCT_SPEC.md`
- 商家工作台 API 草案： `merchant/API_CONTRACT.md`
- 官网 API 预留说明： `API.md`

## 商家工作台 MVP 已包含
经营概览、商品手册增删改查、手动黄金报价计算、报价快照、报价文本复制与 TXT 下载、客户询价管理、跟进状态、店铺默认设置、本机 JSON 数据备份/恢复及响应式移动布局。

## 当前限制
这是可交互 MVP，不是完整商用系统。数据保存在当前浏览器 localStorage，清理浏览器数据或换设备不会自动同步。金价需手动录入，未连接实时金价、账号、云端数据库、AI 识款、支付及物流。首次打开商家工作台会创建明确标识的示例商品与询价，可编辑或删除。

## 部署
GitHub Pages 通过 `.github/workflows/pages.yml` 在 main 更新后自动部署。部署完成后访问上方网址。
