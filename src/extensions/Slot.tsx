import type { PageData } from "../lib/template/page";
export interface SlotProps {
  name: "article-before-body" | "article-after-body" | "site-footer";
  site: PageData["site"];
  locale: string;
  pathname: string;
  post?: PageData["post"];
}
/** Owner extension point. Keep private data out of public page components. */
export default function Slot(_props: SlotProps) {
  return null;
}
