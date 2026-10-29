# React template adapter

The baseline is recorded in [.gitblog/template-standard.json](../../.gitblog/template-standard.json). Shared packages own authoring, IDs, translation policy, membership stubs, speech validation, crawler policy, deployment preparation, image optimization and browser integration protocols. React owns rendering and presentation.

| Command | Implementation |
| --- | --- |
| `dev` | Full static build, source/content watcher, preview server; refresh after rebuilding |
| `build:site` | Vite browser bundle and React HTML generation in `scripts/build.tsx`; output `build/` |
| `check:site` | TypeScript and renderer contract tests |
| `test:integration` | Root/project/custom-domain builds, translations, stale output cleanup, empty blog and preservation |
| `search:index` | Pagefind over published articles; skip an empty corpus |
| `preview` | Static server with base path, explicit 404 and Markdown MIME |

## Rendering boundary

`src/lib/template/content.ts` reads owner Markdown and applies the shared policies. HTML, feeds, sitemap, search, public Markdown and discovery all use this published corpus. Translation timestamps update SEO lastmod. Membership source files contain only the approved preview or an empty public stub; never private full text.

`page-data.ts` explicitly selects public fields for React. Do not serialize the complete configuration, environment, post metadata, absolute source paths, drafts or private content. `document.tsx` renders complete article HTML with ReactDOM's server renderer. The browser entry calls `hydrateRoot` with the identical public data. Comments, recommendations and membership clients mount after hydration so third-party DOM changes do not invalidate it.

The source locale is at `/`, translations at `/{locale}/`, and articles at `/blog/{slug}/`. The project base from `PUBLIC_SITE_URL` is included exactly once. Build output does not include that base directory. Every build cleans stale generated output. Pagefind indexes only `data-pagefind-body` and locale/category/tag filters.

## Theme and extensions

`src/theme/` contains React presentation and CSS; `src/extensions/Slot.tsx` is owner code. Slots receive sanitized public data. Theme variables expose the aliases required by the existing GitBlog embeds. The audio adapter keeps native controls available without JavaScript and enhances them with a compact accessible player.

Optional `src/pages/about.tsx` default React components generate `/about/`. These components render to static content; use hydrated extension slots for custom interactions. Core routes and locale names are reserved. A custom page receives `site` and `locale` props. Edit its title/canonical handling in the build adapter if it needs specialized metadata.

## Verification and publishing

Run `npm run check`, `npm run test:integration`, `npm run test:browser` and `npm run update:check`. Tests create temporary articles, translations and audio fixtures. `update:check` verifies that builds leave owner files unchanged. Live provider authorization and GitBlog ingestion must be checked independently on a configured deployed blog.

Both hosting workflows are retained, including translation, blog-only TTS, CNAME/origin handling and discovery verification. Official GitBlog registration requires the real template repository and service catalog support; it remains opt-in. See [platform integration](platform-integration.md) and [preservation](customization.md).

## Development and user repositories

Development-only commands (`test:*`) and browser/SEO fixtures live in [the development repository](https://github.com/gitblogapp/react-gitblog-template-dev). User distributions retain framework checks, authoring validation and `update:check` with source preservation, without tests. See the development repository’s `DEVELOPMENT.md` for the verified release pipeline.
