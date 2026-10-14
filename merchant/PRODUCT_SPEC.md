# 物遇 WUYU 商家工作台 MVP 产品规格

## 1. 产品目标
让金饰定制、盘串、合香珠等小型手作商家更快完成商品整理、价格核算、报价输出与询价跟进。第一版以黄金首饰定制作为报价验证场景，其他非标品类先使用商品档案和询价记录，不强行套用黄金计价公式。

## 2. 第一版范围
- 经营概览：商品数、询价数、待跟进数、当前有效报价数、最近报价。
- 商品手册：创建、编辑、删除和搜索商品；支持品类、材质、尺寸、工费方式（按件/按克）、工费金额、附加费用、标签和说明。
- 报价计算：客户信息、商品、金重、手动输入金价、按件/按克工费、附加费、运费、优惠、有效期；实时展示计算结果。
- 报价单：保存计算时的价格和工费快照；复制文本或下载 TXT；报价生成时可创建/更新客户询价记录。
- 询价管理：新增、编辑、删除、搜索、按状态筛选、跟进状态更新。
- 商家设置：店铺名称、联系方式、默认报价有效期和运费；JSON 数据备份/恢复；重置演示数据或清空业务记录。
- 移动端适配：导航切换为横向滚动，表单和卡片单列显示。

## 3. 页面结构
- merchant/index.html：应用壳、导航、状态提示。
- merchant/styles.css：品牌视觉、桌面端/移动端布局。
- merchant/app.js：页面逻辑、报价公式、本机数据存储。
- merchant/PRODUCT_SPEC.md：产品边界与数据模型。
- merchant/API_CONTRACT.md：后端接入草案。

## 4. 数据模型
### Product
id, name, category, material, size, workmanshipMode(piece|perGram), workmanshipFee, extraFee, tags, description, demo, createdAt, updatedAt

### Quote
id, quoteNo, customerName, contact, productId, productName, category, material, size, weight, goldPrice, goldPriceSource, priceAt, workmanshipMode, workmanshipFee, goldSubtotal, workmanship, extraFee, shippingFee, discount, total, note, validityMinutes, createdAt, validUntil

报价保存商品名称、材质/规格和价格参数快照，之后修改商品资料不应改写历史报价。

### Inquiry
id, customerName, contact, channel, productName, budget, status, notes, demo, createdAt, updatedAt

状态：待沟通、待报价、已报价、跟进中、已成交、已关闭。

### Settings
shopName, contact, validityMinutes, defaultShipping

## 5. 关键公式
- 金料费用 = 金重（克）× 手动录入金价（元/克）。
- 工费 = 按件时采用固定工费；按克时 = 工费单价 × 金重。
- 总价 = 金料费用 + 工费 + 附加费用 + 运费 − 优惠。
- 负数费用按 0 处理，总价最低为 0。
- 每份报价记录金价来源、录入时间、报价有效期。第一版不拉取实时金价，报价需商家复核。

## 6. 当前限制与下一步
当前所有业务数据存储于该浏览器的 localStorage；没有账号、云端数据库、多端同步、自动金价、AI 识款或线上交易。上线正式商用前需增加后端数据库、身份认证/权限、服务端价格校验、访问控制、隐私说明、备份与恢复策略，以及金价数据源许可核验。
