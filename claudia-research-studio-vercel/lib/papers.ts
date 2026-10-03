import type { Paper } from "../types/research";
export function newestPapersFirst(papers: Paper[]): Paper[] {
  const timestamp = (paper: Paper) => {
    const exact = paper.publicationDate ? Date.parse(paper.publicationDate) : NaN;
    if (Number.isFinite(exact)) return exact;
    return paper.year ? Date.UTC(paper.year, 0, 1) : -Infinity;
  };
  return [...papers].sort((a, b) => timestamp(b) - timestamp(a) || a.title.localeCompare(b.title));
}
export function conciseHeadline(headline: string): string {
  if (!headline.includes(": Questions from the Research")) return headline;
  const text = headline.replace(/: Questions from the Research$/i, "").replace(/^Improving\s+/i, "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
