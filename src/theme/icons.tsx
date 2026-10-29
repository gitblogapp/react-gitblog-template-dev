export type IconName =
  | "book"
  | "search"
  | "menu"
  | "close"
  | "sun"
  | "moon"
  | "chevron"
  | "arrow"
  | "back"
  | "file"
  | "folder"
  | "rss"
  | "external"
  | "check"
  | "headphones"
  | "link"
  | "lock";
const paths: Record<IconName, string> = {
  book: "M5 3h9a5 5 0 0 1 5 5v13H9a4 4 0 0 1-4-4V3Zm0 13h14M9 7h6m-6 4h6",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z",
  chevron: "m6 9 6 6 6-6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  back: "M20 12H4m6-6-6 6 6 6",
  file: "M14 2H5v20h14V7Zm0 0v6h5M8 12h8m-8 4h6",
  folder: "M3 5h6l2 3h10v12H3V5Z",
  rss: "M5 10a9 9 0 0 1 9 9M5 4a15 15 0 0 1 15 15M6 18v1H5v-1h1",
  external: "M14 3h7v7m0-7L11 13M10 3H3v18h18v-7",
  check: "m5 12 4 4L19 6",
  headphones: "M4 14v-2a8 8 0 0 1 16 0v2M4 13H2v7h5v-7H4Zm16 0h2v7h-5v-7h3Z",
  link: "m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2-1 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0",
  lock: "M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4m-3 5v2",
};
export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
