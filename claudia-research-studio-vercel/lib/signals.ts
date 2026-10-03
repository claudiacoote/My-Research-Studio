import { z } from "zod";
import { signalTypes } from "../types/research";
import type { Opportunity, Paper, ResearchSignal, SignalType } from "../types/research";

// These rules extract explicit result statements, never themes or title keywords.
// Full-text verification is unavailable: automatically generated strength is capped at Moderate.
const factors: [string,RegExp][] = [
 ["Price",/\b(price|cost|affordability)\b/i], ["Convenience",/\b(convenience|convenient|time constraints)\b/i],
 ["Credibility",/\b(credibility|credible|transparency|greenwashing)\b/i], ["Accessibility",/\b(accessibility|accessible|access barriers)\b/i],
 ["Personalisation",/\b(personali[sz]ation|personali[sz]ed)\b/i], ["Social norms",/\b(social norms|peer influence)\b/i],
 ["Information",/\b(information|awareness|knowledge)\b/i], ["Sleep regularity",/\b(sleep regularity|sleep consistency|regular sleep)\b/i],
 ["Sustainability intentions",/\b(?:sustainab\w*|environmental) (?:attitudes?|intentions?)\b/i], ["Customer support",/\b(customer support|support services)\b/i],
 ];
const outcomes: [string,RegExp][] = [["adoption",/\b(adoption|adopt\w*|uptake)\b/i],["purchasing",/\b(purchas\w*|buying|sales)\b/i],["trust",/\b(trust|distrust|scepticism|skepticism)\b/i],["engagement",/\b(engagement|engag\w*|participation)\b/i],["sleep outcomes",/\b(sleep quality|sleep duration|sleep outcomes|wellbeing)\b/i],["learning",/\b(learning|retention|achievement)\b/i]];
interface Rule {type: SignalType; cue: RegExp; opposite?: RegExp; interpretation: string; temporal?: boolean}
const rules: Rule[] = [
 {type:"Growing importance",cue:/\b(increas(?:ed|ing) importance|became more important|increasingly important)\b/i,temporal:true,interpretation:"Consider whether the documented change warrants updating my customer education or research priorities."},
 {type:"Declining effectiveness",cue:/\b(declin(?:ed|ing) effectiveness|became less effective|decreased effectiveness)\b/i,temporal:true,interpretation:"Review the established approach in comparable contexts before changing my marketing activity."},
 {type:"Key barrier",cue:/\b(barrier(?:s)?|prevent(?:s|ed)?|hinder(?:s|ed)?|imped(?:e|es|ed))\b/i,opposite:/\b(not (?:a |an |a significant )?barrier|did not (?:prevent|hinder|impede)|no (?:significant )?barrier)\b/i,interpretation:"Investigate this practical barrier in my audience before relying on messaging alone."},
 {type:"Strong driver",cue:/\b(associated with|predict(?:s|ed|or)?|significant driver|positively related|influenc(?:es|ed))\b/i,opposite:/\b(no (?:significant )?(?:association|relationship|effect)|not associated|did not predict|not a (?:significant )?driver)\b/i,interpretation:"Explore whether this factor is relevant to my audience. Association does not establish that changing it will cause a marketing outcome."},
 {type:"Audience difference",cue:/\b(differed between|differences between|varied (?:across|between)|higher among|lower among)\b/i,interpretation:"Consider segment-specific education and validate the differences in my own audience."},
 {type:"Behaviour gap",cue:/\b(intention[–-]behavio[u]?r gap|attitude[–-]behavio[u]?r gap|intentions? did not translate|attitudes? did not translate|gap between.*(?:behavio[u]?r|purchases))\b/i,interpretation:"Explore practical barriers between stated preferences and behaviour rather than assuming values-based messaging will translate into action."},
 {type:"Trust risk",cue:/\b(reduced trust|increased (?:distrust|scepticism|skepticism)|undermined (?:trust|credibility)|perceived manipulation)\b/i,interpretation:"Review claim clarity and credibility; test how my audience interprets the message."},
 {type:"Unmet need",cue:/\b(unmet needs?|needs? (?:were|was) not met|expectations? (?:were|was) not met)\b/i,interpretation:"Investigate whether my audience shares this need before adapting positioning or customer support."},
 {type:"Emerging opportunity",cue:/\b(new (?:market |marketing )?opportunit(?:y|ies)|newly adopted|new demand)\b/i,interpretation:"Treat this as a hypothesis for audience research or a small campaign test, not a forecast."},
 {type:"Mixed evidence",cue:/\b(conflicting findings|inconsistent findings|mixed evidence|contradictory results)\b/i,interpretation:"Communicate uncertainty and inspect the differences in methods and populations before selecting a claim."},
 {type:"Context dependent",cue:/\b(depended on|only (?:effective|associated|observed)|moderated by|conditional on)\b/i,interpretation:"Check whether the reported conditions match my audience and market before applying the finding."},
 {type:"Under-researched",cue:/\b(limited evidence|further research is needed|under[ -]researched|evidence gap)\b/i,interpretation:"Treat this question as a research priority, not as an established marketing recommendation."},
];
const reported=/\b(results?|findings?|found|observed|showed|reported|identified|demonstrated|concluded|analysis|analyses|evidence)\b/i;
const speculative=/\b(hypothes(?:is|es|i[sz]ed)|we (?:aim|will|propose)|this study (?:aims|will)|may|might|could|whether|we investigated|we examined|we assessed)\b/i;
const temporal=/\b(over time|longitudinal|compared (?:with|to)|between \d{4} and \d{4}|since \d{4}|from \d{4} to \d{4})\b/i;
const schema=z.object({id:z.string(),type:z.enum(signalTypes),title:z.string(),finding:z.string(),marketingImplication:z.string(),evidenceStrength:z.enum(["Strong","Moderate","Limited","Mixed"]),evidenceReason:z.string(),supportingPaperCount:z.number().int().positive(),relevantPaperCount:z.number().int().positive(),paperIds:z.array(z.string()).nonempty(),themes:z.array(z.string()),excerpts:z.array(z.object({paperId:z.string(),text:z.string().min(10),stance:z.enum(["supporting","contradictory"])})).nonempty(),limitation:z.string()}).strict();
export function validateResearchSignals(value:unknown,papers:Paper[]):ResearchSignal[]{
 const registry=new Map(papers.map(p=>[p.id,p]));
 return z.array(schema).parse(value).map(s=>{
  const ids=[...new Set(s.paperIds)];
  if(ids.some(id=>!registry.has(id))||s.excerpts.some(e=>!ids.includes(e.paperId)||!registry.get(e.paperId)?.abstract?.includes(e.text)))throw new Error("Signal evidence is outside the retrieved abstracts.");
  const supporting=new Set(s.excerpts.map(e=>e.paperId));
  if(ids.length!==s.supportingPaperCount||ids.length!==supporting.size||s.relevantPaperCount<ids.length)throw new Error("Invalid signal evidence counts.");
  if(s.evidenceStrength==="Strong")throw new Error("Abstract-only analysis cannot establish Strong evidence.");
  if(s.excerpts.some(e=>e.stance==="contradictory")&&s.evidenceStrength!=="Mixed")throw new Error("Contradictory evidence must remain Mixed.");
  return {...s,paperIds:ids};
 });
}
export function filterResearchSignals(signals:ResearchSignal[],theme:string,type:string):ResearchSignal[]{return signals.filter(s=>(theme==="All themes"||s.themes.includes(theme))&&(type==="All signals"||s.type===type));}
export function buildResearchSignals(groups:Opportunity[],retrieved:Paper[]):ResearchSignal[]{
 const registry=new Map(retrieved.map(p=>[p.id,p]));
 const papers=[...new Map(groups.flatMap(g=>g.papers).map(p=>[p.id,registry.get(p.id)])).values()].filter((p):p is Paper=>!!p);
 const candidates=new Map<string,{rule:Rule;factor:string;outcome:string;excerpts:ResearchSignal["excerpts"]}>();
 for(const p of papers){
  if(!p.abstract)continue;
  for(const sentence of p.abstract.split(/(?<=[.!?])\s+/).map(s=>s.trim())){
   if(!reported.test(sentence)||speculative.test(sentence))continue;
   const factor=factors.find(([,re])=>re.test(sentence)),outcome=outcomes.find(([,re])=>re.test(sentence));
   if(!factor||!outcome)continue;
   // A negated driver/barrier statement is retained as contrary evidence, not support.
   for(const rule of rules){
    const contrary=!!rule.opposite?.test(sentence);
    if(!contrary&&!rule.cue.test(sentence))continue;
    if(!contrary&&/\b(no evidence|not found|failed to (?:find|identify|show)|no support|did not show)\b/i.test(sentence))continue;
    if(rule.temporal&&(!temporal.test(sentence)||!p.year))continue;
    const key=rule.type+"|"+factor[0]+"|"+outcome[0];
    const entry=candidates.get(key)||{rule,factor:factor[0],outcome:outcome[0],excerpts:[]};
    if(!entry.excerpts.some(e=>e.paperId===p.id&&e.text===sentence))entry.excerpts.push({paperId:p.id,text:sentence,stance:contrary?"contradictory":"supporting"});
    candidates.set(key,entry);
   }
  }
 }
 const signals:ResearchSignal[]=[];const seen=new Set<string>();
 // Contradictions are evaluated before any consistent synthesis of the same relationship.
 const entries=[...candidates.values()].sort((a,b)=>Number(b.excerpts.some(e=>e.stance==="contradictory"))-Number(a.excerpts.some(e=>e.stance==="contradictory")));
 const mixedRelations=new Set<string>();
 for(const c of entries){
  const support=c.excerpts.filter(e=>e.stance==="supporting");if(!support.length)continue;
  const ids=[...new Set(c.excerpts.map(e=>e.paperId))];if(ids.length<2)continue;
  const relation=c.factor+"|"+c.outcome;const mixed=c.rule.type==="Mixed evidence"||c.excerpts.some(e=>e.stance==="contradictory");
  if(!mixed&&mixedRelations.has(relation))continue;if(mixed)mixedRelations.add(relation);
  const type=mixed?"Mixed evidence":c.rule.type;const signature=relation;if(seen.has(signature))continue;seen.add(signature);
  const relevant=papers.filter(p=>p.abstract&&factors.find(([name])=>name===c.factor)![1].test(p.abstract)&&outcomes.find(([name])=>name===c.outcome)![1].test(p.abstract));
  const themes=[...new Set(groups.filter(g=>g.papers.some(p=>ids.includes(p.id))).map(g=>g.theme))];
  const gap=type==="Under-researched";
  signals.push({id:"signal-"+signals.length,type,title:mixed?`Reported findings differ on ${c.factor.toLowerCase()} and ${c.outcome}`:type==="Key barrier"?`${c.factor} is a reported barrier to ${c.outcome}`:type==="Strong driver"?`${c.factor} is associated with ${c.outcome} in reported findings`:type==="Behaviour gap"?`${c.factor} do not consistently translate into ${c.outcome}`:`${c.factor} and ${c.outcome}: ${type.toLowerCase()}`,
   finding:mixed?`Across ${ids.length} retrieved abstracts, reported findings about ${c.factor.toLowerCase()} and ${c.outcome} are inconsistent. Read the supporting and contradictory excerpts before drawing a conclusion.`:gap?`In this retrieved sample, ${ids.length} abstracts explicitly describe an evidence gap concerning ${c.factor.toLowerCase()} and ${c.outcome}. This does not establish a gap in the entire literature.`:`Across ${ids.length} retrieved abstracts, explicit result statements identify ${type.toLowerCase()} concerning ${c.factor.toLowerCase()} and ${c.outcome}. The exact source excerpts are available below.`,
   marketingImplication:mixed?"Inspect conflicting results and their populations before choosing a claim; validate any proposed application with my audience.":c.rule.interpretation,
   evidenceStrength:mixed?"Mixed":"Moderate",evidenceReason:mixed?"Reported findings disagree in the retrieved abstracts. Methods and populations have not been independently compared.":"Multiple abstracts contain direct result statements. Full texts, study quality and independence have not been verified, so evidence strength is capped at Moderate.",
   supportingPaperCount:ids.length,relevantPaperCount:relevant.length,paperIds:ids,themes,excerpts:c.excerpts,
   limitation:"Bounded discovery sample, not a systematic review. Automated rules analyse supplied abstracts, not full papers. Marketing implications are interpretations; no causal or performance claim is established."});
 }
 return validateResearchSignals(signals,papers);
}
