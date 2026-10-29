import { useEffect, useRef, type CSSProperties } from "react";
import { audioCopy } from "./audio-copy";
import { mountArticleAudio } from "./article-audio";
export default function ArticleAudio({
  src,
  locale = "en",
}: {
  src: string;
  locale?: string;
}) {
  const copy = audioCopy(locale),
    host = useRef<HTMLElement>(null);
  useEffect(
    () => (host.current ? mountArticleAudio(host.current) : undefined),
    [src, locale],
  );
  return (
    <section
      ref={host}
      className="article-audio"
      data-article-audio
      data-locale={locale}
      data-pagefind-ignore
      aria-label={copy.title}
    >
      <span className="sr-only">{copy.eyebrow}</span>
      <audio src={src} preload="none" controls aria-label={copy.title}></audio>
      <div className="audio-controls" hidden>
        <button
          className="audio-play"
          type="button"
          aria-label={copy.play}
          aria-busy="false"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path data-play-icon d="m9 5 11 7-11 7Z" />
            <path data-pause-icon d="M8 5v14M16 5v14" data-hidden="" />
          </svg>
        </button>
        <div className="audio-timeline">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="0"
            disabled
            aria-label={copy.position}
            aria-valuetext="0:00 / –:––"
            style={{ "--progress": "0%" } as CSSProperties}
          />
          <div className="audio-time" aria-hidden="true">
            <span data-elapsed>0:00</span>
            <span data-duration>–:––</span>
          </div>
        </div>
        <div className="audio-speed">
          <button
            className="speed-trigger"
            type="button"
            aria-label={`${copy.speed}: 1×`}
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <span data-speed-label>1×</span>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </button>
          <div
            className="speed-menu"
            role="menu"
            tabIndex={-1}
            aria-label={copy.speed}
            hidden
          >
            {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                type="button"
                role="menuitemradio"
                aria-checked={rate === 1}
                tabIndex={rate === 1 ? 0 : -1}
                data-rate={rate}
              >
                <span>{rate}×</span>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m3 8 3 3 7-7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
      <span className="audio-feedback sr-only" role="status"></span>
    </section>
  );
}
