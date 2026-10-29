import { load } from "js-yaml";
/** Parse without serializing: user fields and original source bytes remain untouched. */
export default function matter(source: string): {
  data: Record<string, any>;
  content: string;
} {
  const match = source.match(
    /^\uFEFF?---[^\S\r\n]*\r?\n([\s\S]*?)\r?\n---[^\S\r\n]*(?:\r?\n|$)/,
  );
  if (!match) throw new Error("YAML frontmatter delimited by --- is required");
  const data = load(match[1]);
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Frontmatter must be a YAML object");
  return {
    data: data as Record<string, any>,
    content: source.slice(match[0].length),
  };
}
