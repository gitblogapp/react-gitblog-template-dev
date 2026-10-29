# React template verification

Verified locally on 2026-10-26. React 19.3.1, Vite 8.3.5 and shared GitBlog packages 0.1.1. The template tracks Svelte 1.14.4; the upstream release commit only updates release metadata after the recorded source revision.

| Check | Result |
| --- | --- |
| `npm run check` | Passed: deployment policy, 38 harness checks, type checking and renderer contracts |
| `npm test` | Passed: 7 content/renderer tests, including private field exclusion and safe JSON serialization |
| `npm run test:integration` | Passed: root/project/custom-domain builds, SEO, feeds, Markdown/discovery, Pagefind, extensions, stale translation rejection, withdrawal and an empty blog |
| `npm run test:browser` | Passed in installed Chrome: Korean/English search, encoded slugs, themes, responsive widths 320/390, audio playback/seek/speed menu, mobile dialog focus return, TOC and JavaScript-disabled reading |
| `npm run test:tts` | Passed: DeepL/manual translations, supported language filtering, manifest reuse and Python generation fixtures |
| `npm run update:check` | Passed: full validation/build/SEO and no protected source changes |
| Development server | Passed: initial build, ephemeral-port startup and rebuild after a source asset change |
| npm dependency audit | No known vulnerabilities after compatible YAML dependency overrides |

The browser regression suite blocks external GitBlog calls and provides deterministic audio; it does not establish live comment, membership or account authorization. Visual/manual inspection of the LAN preview was not completed because browser access to that origin was declined.

The shipped content directories contain no posts. A separate disposable preview contains three example articles, thumbnails, actual Supertonic excerpt audio and the existing GitBlog comment/related renderers with local example data. These preview fixtures are not part of this template.

No GitHub repository or production deployment was created in this task. To offer this template in GitBlog's catalog, publish the real template repository and coordinate the registration/update provenance rules described in [platform integration](gitblog/platform-integration.md). Do not mark official integration enabled as a substitute for that service support.
