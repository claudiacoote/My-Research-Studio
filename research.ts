import { buildMarketingOpportunities } from "./marketing";
import type { ResearchInput, ResearchResult, ProgressEvent, Opportunity } from "../types/research";
import { understandBrand } from "./themes";
import { searchWorks, OpenAlexError } from "./openalex";
import { deduplicate } from "./clustering";
import { classifyEvidence, relevance } from "./scoring";
import { safetyFlags } from "./safety";
export async function research(input:ResearchInput,key?:string,progress:(e:ProgressEvent)=>void=()=>{},signal?:AbortSignal):Promise<ResearchResult> {
  progress({stage:0,message:"Understanding my topic…"});const strategy=understandBrand(input);
  progress({stage:1,message:`Generating research questions across ${strategy.themes.length} themes…`});
  const queries=strategy.themes.flatMap(t=>t.queries);let completed=0;const warnings:string[]=[];
  const batches=[];let queriesSucceeded=0;
  // Three concurrent requests bound load and preserve progress from real completions.
  for(let start=0;start<queries.length;start+=3){signal?.throwIfAborted();
    const results=await Promise.allSettled(queries.slice(start,start+3).map(async q=>{
      try{return await searchWorks(q,input,key,signal);}finally{completed++;progress({stage:2,message:`Searching academic literature… ${completed} of ${queries.length} searches`,completed,total:queries.length});}}));
    for(const r of results)if(r.status==="fulfilled"){queriesSucceeded++;batches.push(...r.value);}else{
      if(signal?.aborted)throw r.reason;warnings.push(r.reason instanceof OpenAlexError?r.reason.message:"A literature search failed.");
      if(r.reason instanceof OpenAlexError&&[401,403,429].includes(r.reason.status)&&queriesSucceeded===0)throw r.reason;}
  }
  if(queriesSucceeded===0)throw new OpenAlexError(502,"No searches could be completed. Please try again later.");
  progress({stage:3,message:`Reviewing ${batches.length} retrieved paper records…`});const papers=deduplicate(batches);
  progress({stage:4,message:"Grouping research themes…"});const opportunities:Opportunity[]=[];const seen=new Set<string>();
  for(const [index,t]of strategy.themes.entries()){
    const considered=papers.filter(p=>p.discoveredBy.some(q=>t.queries.includes(q)));
    const relevant=considered.filter(p=>input.includeReviews||!(/review|Meta-analysis/i.test(p.studyType)))
      .map(p=>({paper:p,score:relevance(p,t)})).filter(x=>x.score>=35).sort((a,b)=>b.score-a.score).map(x=>x.paper);
    if(!relevant.length)continue;const signature=relevant.map(p=>p.id).sort().join("|");if(seen.has(signature))continue;seen.add(signature);
    const classification=classifyEvidence(relevant);
    opportunities.push({id:`theme-${index}`,theme:t.name,question:t.question,headline:t.headline,
      angle:`Build an explanatory article around ${t.name.toLowerCase()} and ${t.anchor}. Read the supplied sources before stating findings; discuss study populations, methods, and limitations.`,
      whyAudienceCares:`This offers ${input.audience||"my audience"} a focused question about ${t.name.toLowerCase()} in the context of ${t.anchor}, rather than a generic advice article.`,
      evidenceSummary:`${relevant.length} relevant academic works were identified in this retrieved sample. Relevant research exists, but the study findings were not verified from the available OpenAlex metadata.`,
      evidenceStrength:classification.strength,evidenceReason:classification.reason,paperCount:relevant.length,papers:relevant,
      suggestedKeywords:[t.anchor,...t.terms],safetyFlags:safetyFlags(input.brief+" "+t.name,strategy.industry),
      queries:t.queries,considered:considered.length,
      generationMethod:"Rule-based theme expansion followed by two OpenAlex searches per theme. Papers are screened for theme and topic overlap in their title, abstract, or topics. One question is proposed per distinct evidence cluster. Findings are not inferred from titles. No language model was used."});
  }
  opportunities.sort((a,b)=>b.paperCount-a.paperCount);
  const marketingOpportunities=buildMarketingOpportunities(opportunities,papers,input);
  progress({stage:5,message:`Creating ${opportunities.length} content and ${marketingOpportunities.length} marketing opportunities…`});
  if(opportunities.length<input.ideaCount)warnings.push(`Found ${opportunities.length} distinct supported opportunities; results were not padded to ${input.ideaCount}.`);
  return {themes:strategy.themes.map(t=>t.name),opportunities,marketingOpportunities,warnings:[...new Set(warnings)],
    adjacentSearches:strategy.themes.filter(t=>!opportunities.some(o=>o.theme===t.name)).map(t=>`${t.anchor} ${t.terms[0]}`).slice(0,4),
    metadata:{papersSearched:batches.length,uniquePapers:papers.length,queriesRun:completed,queriesSucceeded,
      completedAt:new Date().toISOString(),method:"OpenAlex + deterministic evidence-first engine",requestedIdeas:input.ideaCount,
      coverage:"A bounded discovery sample of up to 48 records. Counts refer to retrieved works, not all available literature. This is not a systematic review."}};
}
