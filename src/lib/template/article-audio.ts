import { audioCopy, audioTime } from "./audio-copy";
let audioInstance = 0;

/** Progressive enhancement: native controls remain usable without JavaScript. */
export function mountArticleAudio(host: HTMLElement) {
  const audio = host.querySelector("audio")!;
  const controls = host.querySelector<HTMLElement>(".audio-controls")!;
  const play = host.querySelector<HTMLButtonElement>(".audio-play")!;
  const position = host.querySelector<HTMLInputElement>("input[type=range]")!;
  const elapsed = host.querySelector<HTMLElement>("[data-elapsed]")!;
  const duration = host.querySelector<HTMLElement>("[data-duration]")!;
  const feedback = host.querySelector<HTMLElement>("[role=status]")!;
  const speed = host.querySelector<HTMLElement>(".audio-speed")!;
  const trigger = host.querySelector<HTMLButtonElement>(".speed-trigger")!;
  const menu = host.querySelector<HTMLElement>(".speed-menu")!;
  const options = [...menu.querySelectorAll<HTMLButtonElement>("[data-rate]")];
  const copy = audioCopy(host.dataset.locale || "en");
  const events = new AbortController();
  let playbackRate = 1;
  let loading = false,
    failed = false,
    attempt = 0;
  menu.id = `audio-speed-${++audioInstance}`;
  trigger.setAttribute("aria-controls", menu.id);
  const on = (target: EventTarget, name: string, fn: (event: Event) => void) =>
    target.addEventListener(name, fn, { signal: events.signal });
  function render() {
    const active = !audio.paused || loading;
    play.setAttribute("aria-label", active ? copy.pause : copy.play);
    play.setAttribute("aria-busy", String(loading));
    host
      .querySelector("[data-play-icon]")!
      .toggleAttribute("data-hidden", active);
    host
      .querySelector("[data-pause-icon]")!
      .toggleAttribute("data-hidden", !active);
    const valid = Number.isFinite(audio.duration) && audio.duration > 0;
    position.disabled = !valid;
    position.max = valid ? String(audio.duration) : "1";
    position.value = String(audio.currentTime);
    position.style.setProperty(
      "--progress",
      `${valid ? Math.min(100, (audio.currentTime / audio.duration) * 100) : 0}%`,
    );
    const time = `${audioTime(audio.currentTime)} / ${audioTime(audio.duration)}`;
    position.setAttribute("aria-valuetext", time);
    elapsed.textContent = audioTime(audio.currentTime);
    duration.textContent = audioTime(audio.duration);
    feedback.textContent = failed ? copy.error : loading ? copy.loading : "";
    feedback.classList.toggle("sr-only", !failed);
  }
  function closeMenu(restore = false) {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restore) trigger.focus();
  }
  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    options
      .find((button) => button.getAttribute("aria-checked") === "true")
      ?.focus();
  }
  on(play, "click", async () => {
    const current = ++attempt;
    if (!audio.paused || loading) {
      audio.pause();
      loading = false;
      render();
      return;
    }
    failed = false;
    loading = true;
    render();
    if (audio.error) audio.load();
    audio.playbackRate = playbackRate;
    try {
      await audio.play();
    } catch {
      if (current === attempt) {
        loading = false;
        failed = true;
        render();
      }
    }
  });
  for (const event of ["playing", "pause", "ended"])
    on(audio, event, () => {
      loading = false;
      if (event === "playing") failed = false;
      render();
    });
  on(audio, "waiting", () => {
    loading = !audio.paused;
    render();
  });
  on(audio, "error", () => {
    if (audio.error) {
      loading = false;
      failed = true;
      render();
    }
  });
  for (const event of ["timeupdate", "durationchange", "loadedmetadata"])
    on(audio, event, render);
  on(position, "input", () => {
    if (!position.disabled) {
      audio.currentTime = Number(position.value);
      render();
    }
  });
  on(trigger, "click", () => (menu.hidden ? openMenu() : closeMenu()));
  on(trigger, "keydown", (event) => {
    if (["ArrowDown", "ArrowUp"].includes((event as KeyboardEvent).key)) {
      event.preventDefault();
      openMenu();
    }
  });
  options.forEach((button) =>
    on(button, "click", () => {
      playbackRate = Number(button.dataset.rate);
      audio.playbackRate = playbackRate;
      options.forEach((option) => {
        const selected = option === button;
        option.setAttribute("aria-checked", String(selected));
        option.tabIndex = selected ? 0 : -1;
      });
      host.querySelector("[data-speed-label]")!.textContent =
        `${audio.playbackRate}×`;
      trigger.setAttribute(
        "aria-label",
        `${copy.speed}: ${audio.playbackRate}×`,
      );
      closeMenu(true);
    }),
  );
  on(menu, "keydown", (event) => {
    const key = (event as KeyboardEvent).key;
    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu(true);
    } else if (key === "Tab") closeMenu();
    else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) {
      event.preventDefault();
      const index = options.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      const next =
        key === "Home"
          ? 0
          : key === "End"
            ? options.length - 1
            : (index + (key === "ArrowDown" ? 1 : -1) + options.length) %
              options.length;
      options[next]?.focus();
    }
  });
  for (const event of ["pointerdown", "focusin"])
    on(document, event, (e) => {
      if (e.target instanceof Node && !speed.contains(e.target)) closeMenu();
    });
  // Pause on navigation, retaining the source and handlers when restored from bfcache.
  on(window, "pagehide", () => {
    attempt++;
    loading = false;
    audio.pause();
    closeMenu();
    render();
  });
  on(window, "pageshow", render);
  audio.hidden = true;
  audio.controls = false;
  controls.hidden = false;
  render();
  return () => {
    attempt++;
    events.abort();
    audio.pause();
    audio.hidden = false;
    audio.controls = true;
    controls.hidden = true;
  };
}
