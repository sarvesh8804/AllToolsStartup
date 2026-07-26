export type MarkdownStats = {
  characters: number;
  words: number;
  headings: number;
  links: number;
  codeBlocks: number;
};

/** Lightweight markdown stats for the preview tool (not a full parser). */
export function markdownStats(source: string): MarkdownStats {
  const characters = [...source].length;
  const trimmed = source.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const headings = (source.match(/^#{1,6}\s+.+$/gm) ?? []).length;
  const links = (source.match(/\[[^\]]*\]\([^)]+\)/g) ?? []).length;
  const codeBlocks = (source.match(/^```/gm) ?? []).length / 2;
  return {
    characters,
    words,
    headings,
    links,
    codeBlocks: Math.floor(codeBlocks),
  };
}
