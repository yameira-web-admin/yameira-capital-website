# HTTrack 镜像重构结果报告

> 当前状态（2026-08-31）：为保证首页 mega-menu 的 Why YMC、Products、
> Platforms、Accounts、Pricing、Education、Support 和 About Us 链接可部署、
> 可离线访问，已从原始镜像按原 URL 层级恢复 1,250 个规范 HTML 页面。
> 下方“仅 14 个入口、32 个文件”的内容是初始精简重建记录，不再代表当前目录规模。
> 清理文件前必须运行 `tools/verify-local-links.ps1`。

## 结果摘要

- 输出目录：`C:\Users\Administrator\Desktop\YMC\_fron`
- 原始镜像：保持未修改，继续位于 `C:\Users\Administrator\Desktop\IBKR_RE\ibkr_re`
- 新项目类型：无构建步骤、无包管理依赖的静态多页面网站
- 离线状态：可以离线运行；页面运行时不依赖 YMC 或任何第三方服务
- 本地测试地址：`http://127.0.0.1:4173/`

## 提取及重建的页面

| 页面 | 文件 | 处理方式 |
|---|---|---|
| Home | `index.html` | 保留原站低成本、全球市场和交易平台核心结构 |
| Products | `products.html` | 汇总本地产品导航 |
| Stocks | `stocks.html` | 本地静态产品页 |
| ETFs | `etfs.html` | 本地静态产品页 |
| Options | `options.html` | 本地静态产品页 |
| Futures | `futures.html` | 本地静态产品页 |
| Forex | `forex.html` | 本地静态产品页 |
| Pricing | `pricing.html` | 使用本地静态示例费率表，不查询真实费率 |
| Trading | `trading.html` | 展示 Desktop、Web、Mobile 平台 |
| Education | `education.html` | 本地教育资源入口 |
| About | `about.html` | 公司简介页 |
| Contact | `contact.html` | 所有联系按钮改为本地提示 |
| Login | `login.html` | 本地模拟登录，不传输或存储凭据 |
| Open Account | `open-account.html` | 本地模拟开户流程，不传输或存储资料 |

## 保留的资源

- 官方 YMC 黑色及白色 SVG Logo 各一份。
- Proxima Nova Regular、Semibold、Extrabold WOFF2 字体各一份。
- 首页交易平台主视觉、Pricing Hero、About 图片及三张产品图片。
- 本地 favicon。
- 共享 `assets/css/main.css`、小型视觉修正 `assets/css/fixes.css` 和 `assets/js/app.js`。
- 本地模拟行情文件 `data/market.json`，没有联网更新逻辑。

新项目共 32 个文件，约 1.6 MB；保留资源没有 SHA-256 完全重复项。

## 删除或忽略的资源

- 未复制 1,252 个镜像 HTML 和 6,380 个 `.tmp` 的全集。
- 未复制 Campus 文章、feed、WordPress API 响应、文档站批量页面和第三方站点镜像。
- 未复制 HTTrack `hts-cache`、日志、锁文件、清单、757.81 MiB ZIP、PDF 和未引用下载缓存。
- 未复制镜像中 241 个完全重复文件的额外副本。
- 未复制页面未使用的 CSS、字体、图片、SVG 和 JavaScript。

## TMP 文件处理

分析报告识别的 `.tmp` 包括 5,966 个 HTML、175 个 CSS、83 个 JSON、83 个未知缓存载荷、63 个 SVG、6 个图片及 4 个 JavaScript。

本次重构没有按扩展名直接删除原镜像中的 `.tmp`，也没有批量复制它们。有效页面结构由规范页面重建；视觉资源从扩展名正确、路径清晰的主站资源中选取，因此新项目无需依赖 `.tmp`。未知缓存载荷和未被选中页面引用的 `.tmp` 全部忽略。

## 已移除或隔离的外部请求

- Google Tag Manager、Google Analytics 和其他 analytics/tracking。
- Akamai telemetry 及相关探针页面。
- FullStory、Taboola 和第三方广告/行为追踪。
- 真实 YMC 登录、认证和 Client Portal 请求。
- 真实开户流程及资料提交。
- 真实行情、报价、搜索和交易 API。
- 外部 CDN、第三方字体、视频和社交链接。

静态扫描未发现 `http://`、`https://`、协议相对外部 URL、`fetch`、XHR 或 WebSocket 调用。SVG 中的 XML namespace 只是格式声明，不会产生请求。

## 新项目结构

```text
_fron/
├── index.html
├── products.html
├── stocks.html
├── etfs.html
├── options.html
├── futures.html
├── forex.html
├── pricing.html
├── trading.html
├── education.html
├── about.html
├── contact.html
├── login.html
├── open-account.html
├── assets/
│   ├── css/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── js/
├── data/
│   └── market.json
├── README.md
└── RECONSTRUCTION_REPORT.md
```

## 验证结果

- 14 个 HTML 入口全部可加载，均有正确 title、H1 和 main 内容。
- 所有图片和字体资源从本地成功加载，破损图片为 0。
- 页面 DOM 中外部资源和外部链接为 0。
- Console errors：0；Console warnings：0。
- 桌面端无横向溢出，Hero 文案与主视觉无重叠。
- 390 × 844 移动视口无横向溢出，折叠菜单可正常打开。
- 本地登录表单可提交并清空，显示“未发送数据”提示。
- 所有导航、产品入口、Login 和 Open Account 均为本地页面链接。

## 离线运行结论

当前项目可以离线运行。启动静态服务器后，浏览、导航、移动菜单、本地登录和开户模拟不需要网络连接；不存在真实交易、行情、登录、开户、追踪或第三方服务调用。
