import { useEffect, useRef, useState } from "react";
import type { PageData, ArticleSummary } from "../lib/template/page";
import { Icon } from "./icons";
import { copy } from "./copy";
import { Search } from "./Search";
import { ArticleView } from "./Article";
import Slot from "../extensions/Slot";
import { useAnalytics } from "../lib/template/Integrations";

export const dateText = (date: string, language: string) =>
  new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));

function Navigation({
  data,
  onNavigate,
}: {
  data: PageData;
  onNavigate?: () => void;
}) {
  const ui = copy(data.locale);
  const categories = [...new Set(data.posts.map((p) => p.category))];
  return (
    <nav
      className="side-nav"
      aria-label={ui.journal}
      onClick={(e) => {
        if ((e.target as Element).closest("a")) onNavigate?.();
      }}
    >
      <a
        className="nav-item"
        href={data.home}
        aria-current={data.page === "home" ? "page" : undefined}
      >
        <Icon name="book" />
        <span>{ui.overview}</span>
      </a>
      <a
        className="nav-item"
        href={data.search}
        aria-current={data.page === "search" ? "page" : undefined}
      >
        <Icon name="search" />
        <span>{ui.journal}</span>
        <span className="count">{data.posts.length}</span>
      </a>
      {categories.length > 0 && (
        <details className="nav-collection" open>
          <summary className="nav-caption">
            <span>{ui.library}</span>
            <Icon name="chevron" />
          </summary>
          {categories.map((category) => (
            <details
              className="nav-group"
              key={category}
              open={!data.post || data.post.category === category}
            >
              <summary className="nav-item category-link">
                <Icon name="folder" />
                <span>{category}</span>
                <Icon name="chevron" className="nav-chevron" />
              </summary>
              <ul>
                <li>
                  <a
                    className="nav-post category-all"
                    href={`${data.search}?category=${encodeURIComponent(category)}`}
                  >
                    <span>{ui.journal}</span>
                    <span className="count">
                      {data.posts.filter((p) => p.category === category).length}
                    </span>
                  </a>
                </li>
                {data.posts
                  .filter((p) => p.category === category)
                  .slice(0, 6)
                  .map((p) => (
                    <li key={p.id}>
                      <a
                        className="nav-post"
                        href={p.url}
                        aria-current={
                          data.post?.id === p.id ? "page" : undefined
                        }
                      >
                        <span>{p.title}</span>
                        {p.access === "membership" && <Icon name="lock" />}
                      </a>
                    </li>
                  ))}
              </ul>
            </details>
          ))}
        </details>
      )}
      <div className="nav-bottom">
        <a href={data.rss}>
          <Icon name="rss" />
          RSS
        </a>
        {data.site.socials.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="me noreferrer">
            {s.label}
            <Icon name="external" />
          </a>
        ))}
      </div>
    </nav>
  );
}
function Header({ data }: { data: PageData }) {
  const ui = copy(data.locale),
    dialog = useRef<HTMLDialogElement>(null),
    language = useRef<HTMLDetailsElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => {
    dialog.current?.close();
    setMenuOpen(false);
  };
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        location.assign(data.search);
      }
      if (event.key === "Escape" && language.current)
        language.current.open = false;
    };
    const outside = (event: PointerEvent) => {
      if (language.current && !language.current.contains(event.target as Node))
        language.current.open = false;
    };
    document.addEventListener("keydown", keyboard);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("pointerdown", outside);
    };
  }, [data.search]);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);
  const toggleTheme = () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("gitblog-theme", theme);
    } catch {
      /* optional storage */
    }
  };
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="icon-button mobile-menu"
            aria-label={ui.menu}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => {
              dialog.current?.showModal();
              setMenuOpen(true);
            }}
          >
            <Icon name="menu" />
          </button>
          <a className="brand" href={data.home}>
            <span className="brand-mark">
              <Icon name="book" />
            </span>
            <span>{data.site.title}</span>
          </a>
          <span className="header-label">Blog</span>
          <a className="header-search" href={data.search}>
            <Icon name="search" />
            <span>{ui.placeholder}</span>
            <kbd>⌘ K</kbd>
          </a>
          <div className="header-tools">
            <a
              className="icon-button compact-search"
              aria-label={ui.search}
              href={data.search}
            >
              <Icon name="search" />
            </a>
            {data.languages.length > 1 && (
              <details className="language-menu" ref={language}>
                <summary aria-label={ui.language}>
                  {data.locale.toUpperCase()}
                  <Icon name="chevron" />
                </summary>
                <div className="language-options">
                  {data.languages.map((l) => (
                    <a
                      key={l.locale}
                      href={l.href}
                      lang={l.locale}
                      aria-current={
                        l.locale === data.locale ? "true" : undefined
                      }
                    >
                      {l.label}
                      {l.locale === data.locale && <Icon name="check" />}
                    </a>
                  ))}
                </div>
              </details>
            )}
            <button
              className="icon-button theme-toggle"
              type="button"
              aria-label={ui.theme}
              title={ui.theme}
              onClick={toggleTheme}
            >
              <Icon className="sun" name="sun" />
              <Icon className="moon" name="moon" />
            </button>
          </div>
        </div>
      </header>
      <dialog
        id="mobile-nav"
        className="mobile-drawer"
        ref={dialog}
        onClose={() => setMenuOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="drawer-heading">
          <span className="brand">
            <span className="brand-mark">
              <Icon name="book" />
            </span>
            {data.site.title}
          </span>
          <button className="icon-button" aria-label={ui.close} onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        <Navigation data={data} onNavigate={close} />
      </dialog>
    </>
  );
}
function PostCard({ post, data }: { post: ArticleSummary; data: PageData }) {
  const ui = copy(data.locale);
  return (
    <a className="post-card" href={post.url}>
      <div className="post-card-copy">
        <div className="post-meta">
          <span>{post.category}</span>
          <span className="meta-dot" />
          <time dateTime={post.date}>
            {dateText(post.date, data.site.language)}
          </time>
          {post.access === "membership" && <Icon name="lock" />}
        </div>
        <h3>{post.title}</h3>
        <p>{post.description}</p>
        <span className="read-link">
          {ui.read}
          <Icon name="arrow" />
        </span>
      </div>
      {post.cover && (
        <img src={post.cover} alt="" width="144" height="104" loading="lazy" />
      )}
    </a>
  );
}
function Home({ data }: { data: PageData }) {
  const ui = copy(data.locale),
    categories = [...new Set(data.posts.map((p) => p.category))];
  return (
    <>
      <div className="breadcrumb">
        <Icon name="book" />
        <span>{ui.overview}</span>
      </div>
      <header className="page-heading">
        <span className="eyebrow">{data.site.title}</span>
        <h1>{data.site.tagline || data.site.title}</h1>
        <p>{data.site.description}</p>
      </header>
      {data.posts.length ? (
        <>
          <section id="topics" className="topics-section">
            <h2>{ui.explore}</h2>
            <div className="topic-grid">
              {categories.map((category) => (
                <a
                  className="topic-card"
                  key={category}
                  href={`${data.search}?category=${encodeURIComponent(category)}`}
                >
                  <Icon name="folder" />
                  <strong>{category}</strong>
                  <span className="count">
                    {data.posts.filter((p) => p.category === category).length}
                  </span>
                  <Icon name="arrow" />
                </a>
              ))}
            </div>
          </section>
          <section id="latest" className="latest-section">
            <div className="section-heading">
              <h2>{ui.latest}</h2>
              <a href={data.search}>
                {ui.journal}
                <Icon name="arrow" />
              </a>
            </div>
            <div className="post-list">
              {data.posts.map((post) => (
                <PostCard key={post.id} post={post} data={data} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="empty-state">
          <span className="empty-icon">
            <Icon name="file" />
          </span>
          <h2>{ui.noPosts}</h2>
          <p>{ui.emptyIntro}</p>
          <a className="subtle-link" href={data.rss}>
            <Icon name="rss" />
            {ui.rss}
          </a>
        </section>
      )}
      <a className="subscribe-card" href={data.rss}>
        <span className="subscribe-icon">
          <Icon name="rss" />
        </span>
        <span>
          <strong>{ui.rss}</strong>
          <span>{ui.rssDescription}</span>
        </span>
        <Icon name="arrow" />
      </a>
    </>
  );
}
function RightRail({ data }: { data: PageData }) {
  const ui = copy(data.locale),
    [active, setActive] = useState("");
  useEffect(() => {
    if (!data.post || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const heading = entries.find((e) => e.isIntersecting);
        if (heading) setActive(heading.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    document
      .querySelectorAll(".article-content h2, .article-content h3")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data.post]);
  return (
    <aside className="right-rail" data-pagefind-ignore>
      {data.post?.toc.length ? (
        <nav aria-label={ui.toc}>
          <p className="rail-caption">{ui.toc}</p>
          <ol className="toc-list">
            {data.post.toc.map((h) => (
              <li className={h.level === 3 ? "nested" : ""} key={h.id}>
                <a
                  href={`#${h.id}`}
                  aria-current={active === h.id ? "location" : undefined}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : (
        data.page === "home" && (
          <nav aria-label={ui.toc}>
            <p className="rail-caption">{ui.toc}</p>
            <ol className="toc-list">
              <li>
                <a href="#main">{ui.overview}</a>
              </li>
              {data.posts.length > 0 && (
                <>
                  <li>
                    <a href="#topics">{ui.topics}</a>
                  </li>
                  <li>
                    <a href="#latest">{ui.latest}</a>
                  </li>
                </>
              )}
            </ol>
          </nav>
        )
      )}
      <div className="rail-about">
        <p className="rail-caption">{ui.about}</p>
        <p>{data.site.description}</p>
        <a href={data.rss}>
          <Icon name="rss" />
          {ui.rss}
        </a>
      </div>
    </aside>
  );
}
export function App({ data }: { data: PageData }) {
  const ui = copy(data.locale);
  useAnalytics(data.integrations.analytics);
  return (
    <>
      <a className="skip-link" href="#main">
        {ui.skip}
      </a>
      <Header data={data} />
      <div className="site-layout">
        <aside className="left-rail" data-pagefind-ignore>
          <Navigation data={data} />
          <p className="powered">
            Powered by{" "}
            <a href="https://gitblog.app" target="_blank" rel="noreferrer">
              GitBlog
            </a>
          </p>
        </aside>
        <main id="main" className="main-content">
          {data.page === "home" && <Home data={data} />}
          {data.page === "search" && <Search data={data} />}
          {data.page === "post" && data.post && (
            <ArticleView data={data} post={data.post} />
          )}
          {data.page === "404" && (
            <section className="empty-state">
              <span className="eyebrow">404</span>
              <h1>{ui.notFound}</h1>
              <a className="subtle-link" href={data.home}>
                <Icon name="back" />
                {ui.back}
              </a>
            </section>
          )}
          {data.customHtml && (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: data.customHtml }}
            />
          )}
          <footer className="site-footer">
            <span>
              © {data.year} {data.site.author}
            </span>
            <span>{data.site.footer}</span>
          </footer>
          <Slot
            name="site-footer"
            site={data.site}
            locale={data.locale}
            pathname={data.pathname}
            post={data.post}
          />
        </main>
        <RightRail data={data} />
      </div>
      <span
        hidden
        data-gitblog-analytics={JSON.stringify(data.integrations.analytics)}
      />
    </>
  );
}
