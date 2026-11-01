import type { Article, PageData } from "../lib/template/page";
import { PostIntegrations, Comments } from "../lib/template/Integrations";
import ArticleAudio from "../lib/template/ArticleAudio";
import Slot from "../extensions/Slot";
import { Icon } from "./icons";
import { copy } from "./copy";
import { dateText } from "./App";

export function ArticleView({ data, post }: { data: PageData; post: Article }) {
  const ui = copy(data.locale),
    context = {
      site: data.site,
      locale: data.locale,
      pathname: data.pathname,
      post,
    };
  const index = data.posts.findIndex((p) => p.id === post.id);
  const previous = data.posts[index + 1],
    next = data.posts[index - 1];
  return (
    <>
      <div className="breadcrumb">
        <a href={data.home}>
          <Icon name="book" />
          {ui.journal}
        </a>
        <span>/</span>
        <a
          href={`${data.search}?category=${encodeURIComponent(post.category)}`}
        >
          {post.category}
        </a>
      </div>
      <article
        className="article"
        data-pagefind-body
        data-pagefind-filter={`locale:${data.locale}`}
      >
        <header className="page-heading article-header">
          {post.access === "membership" && (
            <span className="member-label">
              <Icon name="lock" />
              {ui.members}
            </span>
          )}
          <h1 id="post-title" data-pagefind-meta="title">
            {post.title}
          </h1>
          <p className="article-description" data-pagefind-meta="description">
            {post.description}
          </p>
          <div className="article-byline">
            <span className="avatar">{data.site.author.slice(0, 1)}</span>
            {data.site.authorUrl ? <a href={data.site.authorUrl} rel="author">{data.site.author}</a> : <span>{data.site.author}</span>}
            <span className="meta-dot" />
            <time dateTime={post.date}>
              {dateText(post.date, data.site.language)}
            </time>
            <span className="reading-time">
              {post.readingMinutes} {ui.minute}
            </span>
          </div>
          <span className="sr-only" data-pagefind-meta="date">
            {post.date}
          </span>
          <span
            className="sr-only"
            data-pagefind-meta="category"
            data-pagefind-filter="category"
          >
            {post.category}
          </span>
          <span className="sr-only">{post.aliases.join(" ")}</span>
        </header>
        {post.toc.length > 0 && (
          <details className="mobile-toc" data-pagefind-ignore>
            <summary>
              {ui.toc}
              <Icon name="chevron" />
            </summary>
            <nav aria-label={ui.toc}>
              <ol>
                {post.toc.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "nested" : ""}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        )}
        {post.cover && (
          <img
            className="article-cover"
            src={post.cover}
            alt=""
            width="1200"
            height="650"
            fetchPriority="high"
          />
        )}
        <Slot name="article-before-body" {...context} />
        {post.audioUrl && (
          <ArticleAudio src={post.audioUrl} locale={data.locale} />
        )}
        {post.html ? (
          <div
            className="article-content prose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        ) : (
          <div className="article-content prose">
            {post.access === "membership" && (
              <p className="member-message">{ui.memberPrompt}</p>
            )}
          </div>
        )}
        <PostIntegrations data={data} post={post} />
        <Slot name="article-after-body" {...context} />
        <div className="article-bottom" data-pagefind-ignore>
          <div className="tags">
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={`${data.search}?q=${encodeURIComponent(tag)}`}
                data-pagefind-filter={`tag:${tag}`}
              >
                #{tag}
              </a>
            ))}
          </div>
          {data.markdown && (
            <a className="markdown-link" href={`${post.url}index.md`}>
              <Icon name="file" />
              Markdown
            </a>
          )}
        </div>
        {post.updated && (
          <p className="updated-note">
            {ui.updated} {dateText(post.updated, data.site.language)}
          </p>
        )}
        <Comments data={data} post={post} />
      </article>
      <nav className="article-pagination" aria-label={ui.journal}>
        {previous ? (
          <a href={previous.url}>
            <Icon name="back" />
            <span>
              <small>{ui.previous}</small>
              <strong>{previous.title}</strong>
            </span>
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={next.url}>
            <span>
              <small>{ui.next}</small>
              <strong>{next.title}</strong>
            </span>
            <Icon name="arrow" />
          </a>
        )}
      </nav>
    </>
  );
}
