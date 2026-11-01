import { authorEntity, articleSeoSchema } from "@gitblogapp/core/seo";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { App } from "../../theme/App";
import type { PageData } from "./page";

export const serialize = (value: unknown) =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
export function renderPage(
  data: PageData,
  assets: { script: string; styles: string[] },
  custom?: ReactNode,
) {
  const { post, site } = data;
  const image = post?.cover
    ? new URL(post.cover, data.canonical).href
    : site.image;
  const structured = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: data.description,
        datePublished: new Date(post.date).toISOString(),
        dateModified: post.lastModified,
        ...articleSeoSchema(post.seo),
        author: authorEntity(site.author, site.authorSiteUrl, site.authorUrl),
        mainEntityOfPage: data.canonical,
        url: data.canonical,
        inLanguage: site.language,
        ...(image ? { image } : {}),
        ...(post.access === "membership"
          ? {
              isAccessibleForFree: false,
              hasPart: {
                "@type": "WebPageElement",
                isAccessibleForFree: false,
                cssSelector: ".membership-embed",
              },
            }
          : {}),
      }
    : null;
  const head = renderToStaticMarkup(
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      <link rel="canonical" href={data.canonical} />
      <link rel="icon" type="image/svg+xml" href={`${data.base}/favicon.svg`} />
      <link rel="manifest" href={`${data.base}/site.webmanifest`} />
      <meta name="theme-color" content="#ffffff" />
      {data.page === "404" ? (
        <meta name="robots" content="noindex" />
      ) : (
        data.alternates.map((a) => (
          <link
            key={a.hreflang}
            rel="alternate"
            hrefLang={a.hreflang}
            href={a.href}
          />
        ))
      )}
      {post && data.markdown && (
        <link
          rel="alternate"
          type="text/markdown"
          href={`${data.canonical}index.md`}
        />
      )}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${site.title} RSS`}
        href={data.rss}
      />
      <meta property="og:title" content={post?.title ?? site.title} />
      <meta property="og:description" content={data.description} />
      <meta property="og:url" content={data.canonical} />
      <meta property="og:type" content={post ? "article" : "website"} />
      <meta property="og:site_name" content={site.title} />
      <meta property="og:locale" content={site.language.replace("-", "_")} />
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta property="og:image:alt" content={post?.title ?? site.title} />
        </>
      )}
      {post && (
        <>
          <meta
            property="article:published_time"
            content={new Date(post.date).toISOString()}
          />
          <meta property="article:modified_time" content={post.lastModified} />
        </>
      )}
      <meta
        name="twitter:card"
        content={image ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={post?.title ?? site.title} />
      <meta name="twitter:description" content={data.description} />
      {image && (
        <>
          <meta name="twitter:image" content={image} />
          <meta name="twitter:image:alt" content={post?.title ?? site.title} />
        </>
      )}
      {site.verification && (
        <meta name="google-site-verification" content={site.verification} />
      )}
      {site.bingVerification && (
        <meta name="msvalidate.01" content={site.bingVerification} />
      )}
      {structured && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(structured) }}
        />
      )}
      {assets.styles.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
    </>,
  );
  if (custom) data.customHtml = renderToStaticMarkup(custom);
  const html = renderToString(<App data={data} />);
  const theme = `try{const t=localStorage.getItem('gitblog-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}catch{document.documentElement.dataset.theme='light'}`;
  // Custom pages are static React, with their own optional browser enhancement.
  return `<!doctype html><html lang="${site.language}"><head>${head}<script>${theme}</script></head><body${post ? "" : ' data-pagefind-ignore="all"'}><div id="app">${html}</div><script id="page-data" type="application/json">${serialize(data)}</script><script type="module" src="${assets.script}"></script></body></html>`;
}
