# React GitBlog Template

A statically generated React blog with a GitBook-inspired reading experience: persistent navigation, a focused article column, and a contextual table of contents. All icons are SVG. The template starts with **no example posts**.

React renders complete HTML at build time; Vite bundles the browser enhancements. A deployed blog needs no application server. Search engines and readers without JavaScript receive the public article text and metadata immediately.

## Start locally

Use Node.js **24.12 or newer**.

```sh
npm ci
npm run site:setup
npm run dev
```

`dev` builds the full static site, watches content and source changes, and serves it at `http://127.0.0.1:4173`. Refresh the browser after the rebuild completes. For a phone on the same Wi-Fi:

```sh
npm run dev -- --host 0.0.0.0 --port 4176
```

Open your computer's LAN IP with that port. This is a local preview, not a public deployment. For an existing build, use `npm run preview -- --host 0.0.0.0 --port 4176`.

## Configure and publish

1. Run `npm run site:setup` to inspect the settings and unresolved launch requirements.
2. Configure `.env.production` with the canonical site URL, your repository, languages, and integrations. `content/site.json` provides fallback site copy.
3. Select `GITBLOG_DEPLOY_PROVIDER=github` or `cloudflare`. Both deploy from **your own GitHub repository**; Cloudflare deploys into **your own Cloudflare account**.
4. Use `npm run site:check`, `npm run author:verify`, and the documented deployment workflow.

Put `DEEPL_API_KEY` and `CLOUDFLARE_API_TOKEN` in GitHub Actions Secrets, never in public configuration. Cloudflare also needs its account ID and Pages project name. Read [deployment](../../docs/gitblog/deployment.md), [setup](../../docs/gitblog/setup.md), and [GitHub authentication](../../docs/gitblog/github-auth.md) for the exact workflow.

GitBlog feed participation and comments are off until a real repository is configured. Do not reuse the source template's repository or discussion IDs. Official GitBlog registration additionally requires the template to be published in the service's supported catalog; see [platform integration](../../docs/gitblog/platform-integration.md).

## Write an article

```sh
npm run author:context
npm run author:new -- my-first-post --title 'My first post' --description 'A short introduction' --date '2026-10-26'
npm run author:status
npm run author:check
npm run author:verify
```

Source Markdown belongs in `content/posts/`; uploads belong in `static/uploads/`. Each article has an immutable UUID/ULID. Keep drafts at `published: false`. Drafts in a public Git repository are not private storage.

DeepL is the default translation mode. Manual translations use the same source-hash review process as the Svelte template. Read [authoring](../../docs/gitblog/authoring.md), [taxonomy](../../docs/gitblog/taxonomy.md), and [LLM guidance](../../docs/gitblog/llm-writing-guidelines.md).

## Included integrations

- Static HTML, canonical URLs, hreflang, BlogPosting metadata, Open Graph, sitemap, localized RSS, Pagefind search, public Markdown, and AI discovery policies.
- The real GitBlog Giscus comment client, GitBlog related-post panel, analytics, and authenticated membership reader.
- Supertonic 3 article audio generated in the blog's GitHub Actions workflow. TTS defaults to enabled with voice `F1`; articles may override `tts` and `ttsVoice`. Unsupported languages are skipped.
- Full audio lives in `content/audio/` in the owner's repository, is read through its repository URL, and is not copied into the Pages site. Platform excerpt generation belongs to the separate `gitblog-tts` service.
- Image optimization in the build output with content-addressed caching. Source images are preserved and already optimized assets are recognized.
- Membership pages publish only approved previews/stubs. Private full text must never be committed to the public blog repository; the membership service authorizes the embedded reader.

See [TTS](../../docs/gitblog/tts.md), [images](../../docs/gitblog/images.md), and [membership](../../docs/gitblog/memberships.md) for configuration details.

## Structure

```text
content/                 Owner posts, translations, taxonomy, audio manifests
static/                  Owner public assets
src/theme/               React layout, navigation, article, search, styles
src/extensions/Slot.tsx  Owner extension slots
src/pages/               Optional static React pages
src/lib/template/        Content adapter, public page data, SEO, integrations
src/entry-client.tsx     Hydration entry point
scripts/build.tsx        Vite bundle + React static generation
scripts/                 Shared CLI adapters and deployment utilities
.github/workflows/       CI, translation, TTS and Pages deployment
docs/gitblog/            Official operating guides
```

The shared packages `@gitblogapp/core`, `@gitblogapp/cli`, and `@gitblogapp/browser` are pinned to `0.1.1`. The compatibility baseline is recorded in `.gitblog/template-standard.json`.

Customize `src/theme/` for design. Use `src/extensions/Slot.tsx` for `article-before-body`, `article-after-body`, and `site-footer` extensions. An optional `src/pages/about.tsx` default React component creates `/about/`. It is static HTML; interactive owner extensions belong in the hydrated Slot component. See [customization](../../docs/gitblog/customization.md).

## Validate changes

```sh
npm run check
npm run test:integration
npm run test:browser
npm run update:check
```

Integration tests create disposable posts and translations in a temporary directory. They check root/project/custom-domain builds, public-only output, translations, SEO, discovery, search and preservation. Browser checks use installed Chrome by default. Alternatively, run `npx playwright install chromium`, then `PLAYWRIGHT_CHANNEL=chromium npm run test:browser`, as CI does. Production comment/authentication integrations also require a live configured blog; local mocks do not establish service authorization.

`README.md` and `.gitblog/user-instructions.md` belong to the blog owner. Official instructions live under `docs/gitblog/`; automated updates preserve owner content, configuration, theme and extensions.
