import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createElement } from "react";
import { build as viteBuild } from "vite";
import { loadBlog } from "../src/lib/template/content";
import {
  manifest,
  rss,
  sitemap,
  searchIndex,
} from "../src/lib/template/outputs";
import {
  discoveryManifest,
  llmsText,
  publicMarkdown,
} from "../src/lib/template/discovery";
import { robotsText } from "../src/lib/template/ai-policy";
import { speechManifest } from "../src/lib/template/speech";
import { pageData } from "../src/lib/template/page-data";
import { renderPage } from "../src/lib/template/document";

const blog = loadBlog(),
  { config } = blog;
await viteBuild();
const output = path.resolve("build");
const write = async (file: string, body: string) => {
  const target = path.resolve(output, file);
  if (!target.startsWith(output + path.sep))
    throw new Error(`Invalid output path: ${file}`);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, body);
};
const json = (file: string, value: unknown) =>
  write(file, JSON.stringify(value));
const assets = JSON.parse(
  await fs.readFile(path.join(output, ".vite/manifest.json"), "utf8"),
)["src/entry-client.tsx"];
const bundle = {
  script: `${config.base}/${assets.file}`,
  styles: (assets.css || []).map((file: string) => `${config.base}/${file}`),
};
for (const locale of config.locales) {
  const prefix = locale === config.sourceLocale ? "" : `${locale}/`;
  for (const page of ["home", "search"] as const) {
    const data = pageData(blog, locale, page);
    await write(
      `${prefix}${page === "home" ? "" : "search/"}index.html`,
      renderPage(data, bundle),
    );
  }
  // A static archive alias preserves links to /blog/ on both hosting providers.
  const archive = pageData(blog, locale, "home");
  await write(`${prefix}blog/index.html`, renderPage(archive, bundle));
  for (const post of blog.forLocale(locale)) {
    const directory = `${prefix}blog/${post.slug}/`;
    await write(
      `${directory}index.html`,
      renderPage(pageData(blog, locale, "post", post), bundle),
    );
    if (config.policy.markdown)
      await write(`${directory}index.md`, publicMarkdown(blog, post));
  }
  await write(`${prefix}rss.xml`, rss(blog, locale));
  await json(`${prefix}search.json`, searchIndex(blog, locale));
}
await write(
  "404.html",
  renderPage(pageData(blog, config.sourceLocale, "404"), bundle),
);
await write("sitemap.xml", sitemap(blog));
await write("robots.txt", robotsText(config.policy, config.siteUrl));
await write("llms.txt", llmsText(blog));
await json(".well-known/blog-hub.json", manifest(config));
await json(".well-known/ai-discovery.json", discoveryManifest(blog));
await json(".well-known/tts-input.json", speechManifest(true));
await json(".well-known/tts.json", speechManifest());
await json("site.webmanifest", {
  name: config.site.title,
  short_name: config.site.title,
  lang: config.sourceLocale,
  start_url: `${config.base}/`,
  scope: `${config.base}/`,
  display: "standalone",
  theme_color: "#ffffff",
  background_color: "#ffffff",
  icons: [
    {
      src: `${config.base}/favicon.svg`,
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
  ],
});
// Custom pages are optional; Git does not preserve an empty directory.
const customPages = await fs.readdir("src/pages").catch((error) => {
  if (error.code === "ENOENT") return [];
  throw error;
});
for (const file of customPages) {
  if (!/^[a-z0-9][a-z0-9-]*\.tsx$/.test(file)) continue;
  const route = file.replace(/\.tsx$/, "");
  if (["blog", "search", "index", ...config.locales].includes(route))
    throw new Error(`Reserved custom page: ${route}`);
  const component = (
    await import(pathToFileURL(path.resolve("src/pages", file)).href)
  ).default;
  const data = pageData(blog, config.sourceLocale, "custom");
  data.pathname = `${config.base}/${route}/`;
  data.canonical = new URL(data.pathname, config.siteUrl).href;
  await write(
    `${route}/index.html`,
    renderPage(
      data,
      bundle,
      createElement(component, { site: data.site, locale: data.locale }),
    ),
  );
}
await fs.rm(path.join(output, ".vite"), { recursive: true, force: true });
console.log(
  `React SSG: ${blog.posts.length} articles, ${config.locales.length} locales → build/`,
);
