import { conciseHeadline, newestPapersFirst } from "./papers";
import type { Opportunity, ResearchResult, Paper } from "@/types/research";
export function citation(p:Paper):string {return [p.authors.length?p.authors.join(", "):"Authors not supplied",p.year?"("+p.year+").":null,p.title+".",p.journal?p.journal+".":null,p.doi||p.openAlexUrl].filter(Boolean).join(" ");}
export function copyText(o:Opportunity,withCitations:boolean):string {
 const text=["Article idea: "+conciseHeadline(o.headline),"Research question: "+o.question,"Content angle: "+o.angle,"Evidence base: "+o.paperCount+" relevant academic works identified through OpenAlex in a bounded discovery sample.",o.evidenceSummary,...o.safetyFlags];
 if(withCitations)text.push("Sources:",...newestPapersFirst(o.papers).map((p,i)=>(i+1)+". "+citation(p)));return text.join("\n\n");
}
export function csv(result:ResearchResult):string {
 const rows=[["Headline","Question","Content angle","Audience relevance","Research coverage","Coverage explanation","Evidence note","Paper count","Searches","Source IDs","Citations","Safety flags"],...result.opportunities.map(o=>[conciseHeadline(o.headline),o.question,o.angle,o.whyAudienceCares,o.evidenceStrength,o.evidenceReason,o.evidenceSummary,String(o.paperCount),o.queries.join("; "),newestPapersFirst(o.papers).map(p=>p.id).join("; "),newestPapersFirst(o.papers).map(citation).join("\n"),o.safetyFlags.join(" ")])];
 return "\uFEFF"+rows.map(row=>row.map(v=>'"'+(/^[=+\-@\t\r]/.test(v)?"'":"")+v.replaceAll('"','""')+'"').join(",")).join("\r\n");
}

export function marketingCsv(result:ResearchResult):string {
 const sources=new Map(result.opportunities.flatMap(o=>o.papers).map(p=>[p.id,p]));
 const rows=[["Title","Research theme","Evidence summary","Audience interpretation","Marketing opportunity","Activations","Study count","Publication years","Research coverage","Research momentum","Momentum limitation","Source IDs","Citations","Limitations"],...(result.marketingOpportunities||[]).map(o=>[o.title,o.researchTheme,o.evidenceSummary,o.audienceImplication,o.marketingOpportunity,o.suggestedActivations.join("; "),String(o.studyCount),o.yearRange?o.yearRange.earliest+"–"+o.yearRange.latest:"Not supplied",o.evidenceStrength,o.researchMomentum.label,o.researchMomentum.explanation,o.supportingWorkIds.join("; "),newestPapersFirst(o.supportingWorkIds.flatMap(id=>sources.has(id)?[sources.get(id)!]:[])).map(citation).join("\n"),o.interpretationNotice])];
 return "\uFEFF"+rows.map(row=>row.map(v=>'"'+(/^[=+\-@\t\r]/.test(v)?"'":"")+v.replaceAll('"','""')+'"').join(",")).join("\r\n");
}
