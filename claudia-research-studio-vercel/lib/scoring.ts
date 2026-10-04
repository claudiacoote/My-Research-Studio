import type { Paper, ResearchQuestion, Strength } from "../types/research";
export function relevance(p:Paper,t:ResearchQuestion):number {
  const title=p.title.toLowerCase(),text=(p.title+" "+(p.abstract||"")+" "+p.topics.join(" ")).toLowerCase();
  const anchor=t.anchor.split(" ").filter(x=>x.length>2);
  const anchorMatches=anchor.some(x=>text.includes(x));const termMatches=t.terms.filter(x=>text.includes(x.toLowerCase()));
  if(!anchorMatches||!termMatches.length)return 0;
  const direct=termMatches.some(x=>title.includes(x.toLowerCase()))&&anchor.some(x=>title.includes(x));
  const recent=p.year?Math.max(0,1-(new Date().getUTCFullYear()-p.year)/20):0;
  return (direct?60:30)+Math.min(12,termMatches.length*4)+(p.abstract?8:0)+recent*5+
    Math.min(4,Math.log1p(p.citedByCount)/3)+Math.min(3,Math.log1p(p.relevanceScore))+(p.studyType.includes("review")||p.studyType==="Meta-analysis"?3:0);
}
export function classifyEvidence(papers:Paper[]):{strength:Strength;reason:string} {
  const abstracts=papers.filter(p=>p.abstract).length;const groups=new Set(papers.flatMap(p=>p.authorIds[0]?[p.authorIds[0]]:[])).size;
  const strength:Strength=papers.length>=4&&abstracts>=3&&groups>=3?"Strong research base":papers.length>=3?"Moderate research base":papers.length?"Emerging research":"Limited evidence";
  return {strength,reason:`${papers.length} relevant works, ${abstracts} available abstracts, and ${groups} distinct first-author IDs in this retrieved sample. This describes research coverage, not study quality or agreement. Author IDs do not establish independent research teams.`};
}
