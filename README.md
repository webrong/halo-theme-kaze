# Kaze

一款面向 [Halo](https://www.halo.run/) 的现代个人博客主题 —— 简洁、克制、美观。

**要求 Halo >= 2.22.0**

## 功能特性

- **首页** — Hero 轮播（最多 10 张幻灯片，支持 CTA 按钮）、文章网格/列表布局、可选侧边栏
- **博客** — 归档时间线、分类、标签、文章详情（目录 / 点赞 / 评论）、作者页
- **自定义页面** — 关于（个人卡片 + 里程碑时间线 + 技能雷达图）、摄影（瀑布流相册 + 灯箱）、瞬间（时间线）、装备（卡片网格）
- **搜索** — 实时搜索，API 驱动即时结果
- **暗色模式** — 手动切换 + 系统偏好检测，全站暗色适配
- **SEO / GEO** — Open Graph、Twitter Cards、JSON-LD 结构化数据（WebSite、BlogPosting、Person、BreadcrumbList）、可配置 meta description、`llms.txt` 供 AI 爬虫读取
- **响应式** — 480px / 768px / 1024px 多级断点，触屏友好导航
- **社交链接** — 10 个平台：GitHub、Email、Twitter/X、Bilibili、微博、知乎、微信二维码、YouTube、小红书、个人网站
- **页脚** — 版权声明、建站运行时间、访问量统计、赞助信息、ICP 备案 / 公安备案

## 页面模板

| 模板 | 说明 |
|------|------|
| `index` | 首页 — Hero 轮播 + 文章网格 |
| `post` | 文章详情 — 目录、代码复制、点赞 |
| `page` | 默认独立页面 |
| `page_about` | 关于页 — 个人信息、里程碑、雷达图、装备、更新记录 |
| `page_photography` | 摄影页 — 瀑布流相册 |
| `page_moments` | 瞬间页 — 时间线动态 + 评论 |
| `page_gear` | 装备页 — 设备卡片网格 |
| `archives` | 文章归档 |
| `categories` | 分类列表 |
| `tags` | 标签云 |
| `author` | 作者主页（含 Person Schema） |
| `gallery_detail` | 相册详情 + 灯箱 |
| `moments` | 瞬间列表页 |
| `search` | 搜索结果 |
| `404 / 4xx / 5xx` | 错误页 |

## 主题设置

所有设置均可在 Halo 后台「主题设置」中配置：

| 分组 | 主要设置项 |
|------|-----------|
| **首页设置** | 文章列表布局（网格/列表）、侧边栏显示、站点描述（Meta Description） |
| **Hero 轮播** | 标题、副标题、徽章、背景图片、轮播幻灯片（图片/徽章/标题/副标题/CTA） |
| **页脚设置** | 版权文字、建站日期、赞助信息、ICP 备案、公安备案 |
| **个人信息** | 头像、昵称、简介、关于我、兴趣标签、里程碑时间线、技能雷达图、更新记录 |
| **社交链接** | GitHub、Email、Twitter/X、Bilibili、微博、知乎、微信二维码、YouTube、小红书、个人网站 |
| **设备展示** | 设备列表（名称/品牌/图片/规格/评价/状态） |

## 技术栈

| 层级 | 技术 |
|------|------|
| 模板 | Thymeleaf + Vite 构建期 `<include>` / `<slot>` |
| 样式 | CSS 自定义属性，暗色模式通过 `html.dark` 类切换 |
| 脚本 | TypeScript |
| 构建 | Vite + [`@halo-dev/vite-plugin-halo-theme`](https://github.com/halo-sigs/vite-plugin-halo-theme) |
| 打包 | [`@halo-dev/theme-package-cli`](https://github.com/halo-dev/theme-package-cli) |
| 包管理 | pnpm |

## 目录结构

```
src/
├── css/
│   └── main.css          # 全站样式（亮色 + 暗色 + 响应式）
├── js/
│   ├── layout.ts         # 暗色模式、搜索、导航、运行计时
│   ├── index.ts          # Hero 轮播
│   ├── post.ts           # 文章目录、代码复制、点赞
│   ├── about.ts          # 技能雷达图
│   ├── photography.ts    # 瀑布流 + 灯箱
│   ├── moments.ts        # 瞬间时间线交互
│   ├── moments-inline.ts # 内嵌瞬间组件
│   └── gallery-detail.ts # 相册灯箱
├── partials/
│   ├── layout.html       # 基础布局（head、导航、页脚）
│   ├── sidebar.html      # 侧边栏组件
│   ├── post-card.html    # 文章卡片组件
│   └── pagination.html   # 省略号分页组件
├── error/
│   ├── 404.html
│   ├── 4xx.html
│   ├── 5xx.html
│   └── error.html
├── index.html            # 首页
├── post.html             # 文章详情
├── page.html             # 默认独立页面
├── page_about.html       # 关于页
├── page_photography.html # 摄影页
├── page_moments.html     # 瞬间页
├── page_gear.html        # 装备页
├── archives.html         # 归档
├── categories.html       # 分类
├── category.html         # 单个分类
├── tags.html             # 标签
├── tag.html              # 单个标签
├── author.html           # 作者
├── gallery_detail.html   # 相册详情
├── moments.html          # 瞬间列表
└── search.html           # 搜索
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/webrong/halo-theme-kaze.git
cd halo-theme-kaze

# 安装依赖
pnpm install

# 开发模式 — 文件变更时自动重新构建 templates/
pnpm dev

# 生产构建 + 打包 ZIP
pnpm build
```

将主题目录链接或复制到 Halo 的 `themes/theme-kaze/`，然后在后台安装并启用即可。

开发时建议关闭 Thymeleaf 缓存：`spring.thymeleaf.cache: false`

## 构建与打包

```bash
# 完整构建（类型检查 + 构建 + ZIP）
pnpm build

# 仅构建（不打包 ZIP）
pnpm build-only

# 格式化和代码检查
pnpm check
```

打包产物输出到 `dist/theme-kaze-<版本号>.zip`。

## 许可证

[GPL-3.0](https://opensource.org/licenses/GPL-3.0)
