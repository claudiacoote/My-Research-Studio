import { conciseHeadline, newestPapersFirst } from "./papers";
import { signalDefinitions, signalStrengthLabels } from "../types/research";
import type { Opportunity, ResearchResult, Paper } from "@/types/research";
export function citation(p:Paper):string {return [p.authors.length?p.authors.join(", "):"Authors not supplied",p.year?"("+p.year+").":null,p.title+".",p.journal?p.journal+".":null,p.doi||p.openAlexUrl].filter(Boolean).join(" ");}
export function copyText(o:Opportunity,withCitations:boolean):string {
 const text=o.signal?["Research signal: "+o.signal.title,"Type: "+signalDefinitions[o.signal.signalType].label,o.signal.evidenceSummary,"Marketing interpretation: "+o.signal.marketingImplication,"Evidence: "+signalStrengthLabels[o.signal.evidenceStrength],o.signal.limitation]:["Article idea: "+conciseHeadline(o.headline),"Research question: "+o.question,"Content angle: "+o.angle,"Evidence base: "+o.paperCount+" relevant academic works identified through OpenAlex in a bounded discovery sample.",o.evidenceSummary,...o.safetyFlags];
 if(withCitations)text.push("Sources:",...newestPapersFirst(o.papers).map((p,i)=>(i+1)+". "+citation(p)));return text.join("\n\n");
}
export function csv(result:ResearchResult):string {
 const rows=[["Headline","Question","Content angle","Audience relevance","Research coverage","Coverage explanation","Evidence note","Paper count","Searches","Source IDs","Citations","Safety flags","Related research signal IDs"],...result.opportunities.map(o=>[conciseHeadline(o.headline),o.question,o.angle,o.whyAudienceCares,o.evidenceStrength,o.evidenceReason,o.evidenceSummary,String(o.paperCount),o.queries.join("; "),newestPapersFirst(o.papers).map(p=>p.id).join("; "),newestPapersFirst(o.papers).map(citation).join("\n"),o.safetyFlags.join(" "),(o.researchSignalIds||[]).join("; ")])];
 return "\uFEFF"+rows.map(row=>row.map(v=>'"'+(/^[=+\-@\t\r]/.test(v)?"'":"")+v.replaceAll('"','""')+'"').join(",")).join("\r\n");
}

export function marketingCsv(result:ResearchResult):string {
 const sources=new Map(result.opportunities.flatMap(o=>o.papers).map(p=>[p.id,p]));
 const rows=[["Title","Research context","Evidence summary","Audience interpretation","Marketing opportunity","Activations","Study count","Publication years","Research coverage","Research momentum","Momentum limitation","Source IDs","Citations","Limitations","Related research signal IDs"],...(result.marketingOpportunities||[]).map(o=>[o.title,o.researchContext||"Retrieved research",o.evidenceSummary,o.audienceImplication,o.marketingOpportunity,o.suggestedActivations.join("; "),String(o.studyCount),o.yearRange?o.yearRange.earliest+"–"+o.yearRange.latest:"Not supplied",o.evidenceStrength,o.researchMomentum.label,o.researchMomentum.explanation,o.supportingWorkIds.join("; "),newestPapersFirst(o.supportingWorkIds.flatMap(id=>sources.has(id)?[sources.get(id)!]:[])).map(citation).join("\n"),o.interpretationNotice,(o.researchSignalIds||[]).join("; ")])];
 return "\uFEFF"+rows.map(row=>row.map(v=>'"'+(/^[=+\-@\t\r]/.test(v)?"'":"")+v.replaceAll('"','""')+'"').join(",")).join("\r\n");
}

export function signalsCsv(result:ResearchResult):string {
 const sources=new Map(result.opportunities.flatMap(o=>o.papers).map(p=>[p.id,p]));
 const rows=[["Signal type","Title","Evidence summary","Marketing implication","Evidence strength","Evidence explanation","Supporting paper count","Relevant paper count","Source IDs","Exact abstract excerpts","Citations","Limitations"],...(result.researchSignals||[]).map(s=>[signalDefinitions[s.signalType].label,s.title,s.evidenceSummary,s.marketingImplication,signalStrengthLabels[s.evidenceStrength],s.evidenceReason,String(s.supportingPaperCount),String(s.relevantPaperCount),s.supportingPaperIds.join("; "),s.excerpts.map(e=>e.stance+" | "+e.paperId+" | "+e.text).join("\n"),newestPapersFirst(s.supportingPaperIds.flatMap(id=>sources.has(id)?[sources.get(id)!]:[])).map(citation).join("\n"),s.limitation])];
 return "\uFEFF"+rows.map(row=>row.map(v=>'"'+(/^[=+\-@\t\r]/.test(v)?"'":"")+v.replaceAll('"','""')+'"').join(",")).join("\r\n");
}
