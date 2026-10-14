# 商家工作台 API 接入草案

当前网页仅本机保存数据。下列为推荐后端接口的草案，尚未连接或承诺已可用。

| 方法 | 端点 | 目的 |
|---|---|---|
| GET | /api/v1/merchant/profile | 获取已登录商家资料 |
| PATCH | /api/v1/merchant/profile | 更新商家资料与默认规则 |
| GET/POST/PATCH/DELETE | /api/v1/products | 商品手册增删改查 |
| POST | /api/v1/quotes/preview | 服务端依据价格快照与工费规则核算 |
| POST | /api/v1/quotes | 创建不可变的报价快照 |
| GET | /api/v1/quotes | 搜索报价历史 |
| GET | /api/v1/market/gold-price | 获取已授权数据源的最新金价及时间戳 |
| GET/POST/PATCH/DELETE | /api/v1/inquiries | 客户询价与跟进 |
| POST | /api/v1/data/export | 按权限导出业务数据（可选） |

## 设计要求
- 对所有非公开接口实施登录认证、商家数据隔离、服务端字段校验和限流。
- 金价响应应包含 price、currency、unit、source、observedAt、expiresAt；报价创建时服务端再次核验有效性。
- 报价存储输入参数快照、计算规则版本、明细、操作者与有效期，历史价格不随商品编辑而改变。
- API 密钥仅放服务端密钥管理系统，禁止打包进前端 JavaScript。
- 浏览器端 localStorage 数据不是云端数据库，也不适合多员工并发或关键经营数据的唯一存储。
- 接入融通金前，核实其当前对外数据接口、使用授权、更新频率、价格口径和服务稳定性；未核实之前仅支持手动录入价格。
