# Kaze

A modern, minimal personal blog theme for [Halo](https://www.halo.run/) — clean, minimal, and beautiful.

**Requires Halo >= 2.22.0**

## Features

- **Homepage** — Hero carousel (up to 10 configurable slides with CTA buttons), grid or list post layout, optional sidebar
- **Blog** — Archives timeline, categories, tags, single post with TOC / likes / comments, author page
- **Custom Pages** — About (profile card + milestone timeline + skill radar chart), Photography (masonry gallery with lightbox), Moments (timeline), Gear (equipment card grid)
- **Search** — Live search with API-powered instant results
- **Dark Mode** — Toggle with system preference detection, comprehensive dark color overrides
- **SEO / GEO** — Open Graph, Twitter Cards, JSON-LD structured data (WebSite, BlogPosting, Person, BreadcrumbList), configurable meta descriptions, `llms.txt` for AI crawlers
- **Responsive** — Mobile-first breakpoints (480px / 768px / 1024px), touch-friendly navigation
- **Social Links** — 10 platforms: GitHub, Email, Twitter/X, Bilibili, Weibo, Zhihu, WeChat QR, YouTube, Xiaohongshu, personal website
- **Footer** — Copyright, site runtime counter, visit statistics, sponsor section, ICP / police registration (China compliance)

## Pages

| Template | Description |
|----------|-------------|
| `index` | Homepage with hero carousel and post grid |
| `post` | Single post with TOC, code copy, likes |
| `page` | Default standalone page |
| `page_about` | About page — profile, milestones, radar chart, gear, changelog |
| `page_photography` | Photography — masonry album grid |
| `page_moments` | Moments — timeline feed with comments |
| `page_gear` | Gear showcase — equipment card grid |
| `archives` | Post archives by date |
| `categories` | Category listing |
| `tags` | Tag cloud |
| `author` | Author profile with Person schema |
| `gallery_detail` | Album detail with lightbox |
| `moments` | Standalone moments listing |
| `search` | Search results |
| `404 / 4xx / 5xx` | Error pages |

## Theme Settings

All settings are configurable from the Halo admin console:

| Group | Key Settings |
|-------|-------------|
| **Homepage** | Post layout (grid/list), sidebar visibility, meta description |
| **Hero** | Title, subtitle, badge, background image, carousel slides (image/badge/title/subtitle/CTA) |
| **Footer** | Copyright text, site launch date, sponsor info, ICP/police registration |
| **Profile** | Avatar, display name, bio, about text, interest tags, milestone timeline, skill radar, changelog |
| **Social** | GitHub, Email, Twitter/X, Bilibili, Weibo, Zhihu, WeChat QR, YouTube, Xiaohongshu, website |
| **Gear** | Equipment list with name/brand/image/specs/review/status |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Templates | Thymeleaf + Vite build-time `<include>` / `<slot>` |
| Style | CSS custom properties, dark mode via `html.dark` class |
| Script | TypeScript |
| Build | Vite + [`@halo-dev/vite-plugin-halo-theme`](https://github.com/halo-sigs/vite-plugin-halo-theme) |
| Package | [`@halo-dev/theme-package-cli`](https://github.com/halo-dev/theme-package-cli) |
| Package Manager | pnpm |

## Directory Structure

```
src/
├── css/
│   └── main.css          # All styles (light + dark + responsive)
├── js/
│   ├── layout.ts         # Dark mode, search, nav, runtime counter
│   ├── index.ts          # Hero carousel
│   ├── post.ts           # TOC, code copy, likes
│   ├── about.ts          # Radar chart
│   ├── photography.ts    # Masonry + lightbox
│   ├── moments.ts        # Moments timeline interactions
│   ├── moments-inline.ts # Inline moments widget
│   └── gallery-detail.ts # Gallery lightbox
├── partials/
│   ├── layout.html       # Base layout (head, nav, footer)
│   ├── sidebar.html      # Sidebar widget
│   ├── post-card.html    # Post card component
│   └── pagination.html   # Ellipsis pagination
├── error/
│   ├── 404.html
│   ├── 4xx.html
│   ├── 5xx.html
│   └── error.html
├── index.html            # Homepage
├── post.html             # Single post
├── page.html             # Default page
├── page_about.html       # About page
├── page_photography.html # Photography page
├── page_moments.html     # Moments page
├── page_gear.html        # Gear page
├── archives.html         # Archives
├── categories.html       # Categories
├── category.html         # Single category
├── tags.html             # Tags
├── tag.html              # Single tag
├── author.html           # Author
├── gallery_detail.html   # Album detail
├── moments.html          # Moments listing
└── search.html           # Search
```

## Development

```bash
# Clone
git clone https://github.com/webrong/halo-theme-kaze.git
cd halo-theme-kaze

# Install dependencies
pnpm install

# Watch mode — rebuilds templates/ on file changes
pnpm dev

# Production build + ZIP package
pnpm build
```

Link or copy the theme directory to Halo's `themes/theme-kaze/`, then install and enable it from the admin console.

Tip: Disable Thymeleaf cache during development (`spring.thymeleaf.cache: false`).

## Build & Package

```bash
# Full build (type check + build + ZIP)
pnpm build

# Build only (no ZIP)
pnpm build-only

# Format and lint
pnpm check
```

The distributable ZIP is output to `dist/theme-kaze-<version>.zip`.

## License

[GPL-3.0](https://opensource.org/licenses/GPL-3.0)
