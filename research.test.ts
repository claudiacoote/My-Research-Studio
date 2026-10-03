import test from "node:test";
import assert from "node:assert/strict";
import { reconstructAbstract, normaliseWork, requestJson, OpenAlexError, buildSearchQuery, studyType } from "../lib/openalex";
import { deduplicate } from "../lib/clustering";
import { classifyEvidence, relevance } from "../lib/scoring";
import { safetyFlags } from "../lib/safety";
import { inputSchema, validateModelCitations } from "../lib/schemas";
import { research } from "../lib/research";
const raw=(id="https://openalex.org/W123",doi:string|null="https://doi.org/10.1234/test")=>({id,title:"Caffeine and sleep: a systematic review",doi,publication_year:2024,type:"review",authorships:[{author:{id:"https://openalex.org/A1",display_name:"Test Author"}}],primary_location:{source:{display_name:"Test Journal"}},abstract_inverted_index:{Caffeine:[0],and:[1],sleep:[2]},cited_by_count:2});
const paper=(id?:string,doi?:string|null)=>normaliseWork(raw(id,doi))!;
test("reconstructs inverted abstract positions, repeated words, and empty abstract",()=>{
 assert.equal(reconstructAbstract({sleep:[2,4],improves:[1],Regular:[0],quality:[3]}),"Regular improves sleep quality sleep");
 assert.equal(reconstructAbstract(null),null);assert.equal(reconstructAbstract({}),null);
 assert.equal(reconstructAbstract({word:[9999999,-1]}),null);
});
test("normalises real metadata and preserves missing fields without inventing them",()=>{
 const p=paper();assert.equal(p.title,raw().title);assert.equal(p.abstract,"Caffeine and sleep");assert.deepEqual(p.authors,["Test Author"]);
 const missing=normaliseWork({id:"https://openalex.org/W9",title:"A paper"},"query")!;
 assert.equal(missing.doi,null);assert.equal(missing.abstract,null);assert.equal(missing.journal,null);assert.deepEqual(missing.authors,[]);
 assert.equal(missing.year,null);assert.equal(missing.studyType,"Unknown");assert.deepEqual(missing.discoveredBy,["query"]);
 assert.equal(normaliseWork({id:"https://evil.example/W9",title:"A paper"}),null);
 assert.equal(normaliseWork({id:"https://openalex.org/W9"}),null);
});
test("deduplicates ID and DOI and preserves query provenance",()=>{
 const a={...paper(),discoveredBy:["a"]},b={...paper(),discoveredBy:["b"]};
 assert.equal(deduplicate([a,b]).length,1);assert.deepEqual(deduplicate([a,b])[0].discoveredBy,["a","b"]);
 assert.equal(deduplicate([a,paper("https://openalex.org/W456")]).length,1);
 assert.equal(deduplicate([paper("https://openalex.org/W1",null),paper("https://openalex.org/W2",null)]).length,2);
});
test("merges transitive ID/DOI groups",()=>{
 const a=paper("https://openalex.org/W1","https://doi.org/10.1234/a"),b=paper("https://openalex.org/W2","https://doi.org/10.1234/b");
 assert.equal(deduplicate([a,b,{...a,doi:b.doi}]).length,1);
});
test("classifies coverage without treating citations as scientific quality",()=>{
 assert.equal(classifyEvidence([]).strength,"Limited evidence");
 assert.equal(classifyEvidence([paper()]).strength,"Emerging research");
 const p=[1,2,3,4].map(i=>({...paper("https://openalex.org/W"+i,null),authorIds:["https://openalex.org/A"+i]}));
 assert.equal(classifyEvidence(p).strength,"Strong research base");
 assert.equal(classifyEvidence(p.map(x=>({...x,citedByCount:100000}))).strength,"Strong research base");
 assert.equal(classifyEvidence(p.map(x=>({...x,abstract:null}))).strength,"Moderate research base");
});
test("direct relevance outranks highly cited irrelevant research",()=>{
 const theme={name:"Caffeine",anchor:"sleep",terms:["caffeine"],question:"",headline:"",queries:[]};
 assert.equal(relevance({...paper(),title:"Quantum optics",abstract:null,topics:[],citedByCount:100000},theme),0);
 assert.ok(relevance(paper(),theme)>50);
});
test("does not infer design from a journal or generic article title",()=>{
 assert.equal(studyType("Sleep outcomes","article").label,"Unknown");
 assert.equal(studyType("A randomized controlled trial of sleep","article").label,"Randomised controlled trial");
 assert.equal(studyType("A meta-analysis of sleep","article").label,"Meta-analysis");
});
test("flags health, pregnancy, and financial topics",()=>{
 assert.ok(safetyFlags("sleep brand","auto").includes("Research assistant, not professional advice."));
 assert.ok(safetyFlags("pregnancy supplements","other").length>0);
 assert.ok(safetyFlags("retirement investing","finance").length>0);
 assert.equal(safetyFlags("recycled packaging","sustainability").length,0);
});
test("rejects unknown model citations and removes unsupported opportunities",()=>{
 const o={question:"Question?",headline:"Headline",angle:"angle",whyAudienceCares:"reason",evidenceSummary:"summary",evidenceStrength:"moderate",paperIds:["https://openalex.org/W123","invented"],suggestedKeywords:[]};
 assert.deepEqual(validateModelCitations({opportunities:[o]},new Set(["https://openalex.org/W123"]))[0].paperIds,["https://openalex.org/W123"]);
 assert.equal(validateModelCitations({opportunities:[o]},new Set()).length,0);
 assert.throws(()=>validateModelCitations({opportunities:[{...o,paperIds:"bad"}]},new Set()));
});
test("validates input and encodes fixed-host searches",()=>{
 assert.equal(inputSchema.safeParse({brief:"x"}).success,false);
 assert.equal(inputSchema.safeParse({brief:"sleep brand",endpoint:"evil"}).success,false);
 const u=buildSearchQuery('sleep AND "caffeine"',inputSchema.parse({brief:"sleep brand"}));
 assert.equal(u.host,"api.openalex.org");assert.equal(u.searchParams.get("search.title_abstract_keywords"),'sleep AND "caffeine"');
 assert.ok(u.searchParams.get("filter")!.includes("is_retracted:false"));
});
test("retries 429 with backoff and sends API key only in Authorization",async()=>{
 let calls=0;const waits:number[]=[];
 const f=(async(_url:unknown,opts:RequestInit)=>{assert.equal((opts.headers as Record<string,string>).Authorization,"Bearer secret");return ++calls===1?new Response("{}",{status:429,headers:{"Retry-After":"1"}}):Response.json({results:[]});}) as typeof fetch;
 await requestJson(new URL("https://api.openalex.org/works"),"secret",f,undefined,async ms=>{waits.push(ms);});
 assert.equal(calls,2);assert.deepEqual(waits,[1000]);
});
test("handles persistent 429, 5xx, malformed JSON and non-retriable failures",async()=>{
 for(const status of [429,503,401]){
 let calls=0;await assert.rejects(requestJson(new URL("https://api.openalex.org/works"),undefined,(async()=>{calls++;return new Response("{}",{status});}) as typeof fetch,undefined,async()=>{}),OpenAlexError);
 assert.equal(calls,status===401?1:3);
 }
 await assert.rejects(requestJson(new URL("https://api.openalex.org/works"),undefined,(async()=>new Response("{bad")) as typeof fetch,undefined,async()=>{}),OpenAlexError);
});
test("every opportunity references only fetched works; zero papers yields zero ideas",async()=>{
 const original=globalThis.fetch;let calls=0;
 try{
 globalThis.fetch=(async()=>{calls++;return Response.json({results:[raw("https://openalex.org/W987")]});}) as typeof fetch;
 const output=await research(inputSchema.parse({brief:"sleep brand",ideaCount:5,yearRange:0}));
 assert.ok(output.opportunities.length>0);assert.ok(output.opportunities.every(o=>o.papers.every(p=>p.id==="https://openalex.org/W987")));
 assert.equal(output.opportunities.length,1);assert.equal(output.marketingOpportunities.length,1);assert.deepEqual(output.marketingOpportunities[0].supportingWorkIds,["https://openalex.org/W987"]);assert.equal(output.marketingOpportunities[0].studyCount,1);assert.equal(calls,10);
 globalThis.fetch=(async()=>Response.json({results:[]})) as typeof fetch;
 const empty=await research(inputSchema.parse({brief:"sustainability brand",ideaCount:5,yearRange:5}));
 assert.equal(empty.opportunities.length,0);assert.equal(empty.marketingOpportunities.length,0);assert.ok(empty.adjacentSearches.length>0);
 }finally{globalThis.fetch=original;}
});


import { newestPapersFirst, conciseHeadline } from "../lib/papers";
test("papers appear newest first using dates, then years, with undated last",()=>{
 const entries=[{...paper(),title:"Undated",year:null,publicationDate:null},{...paper(),title:"Year only",year:2025,publicationDate:null},{...paper(),title:"Older",year:2024,publicationDate:"2024-12-30"},{...paper(),title:"Newest",year:2025,publicationDate:"2025-11-15"}];
 assert.deepEqual(newestPapersFirst(entries).map(p=>p.title),["Newest","Year only","Older","Undated"]);
 assert.equal(entries[0].title,"Undated");
 assert.equal(conciseHeadline("Improving collagen and wellbeing: Questions from the Research"),"Collagen and wellbeing");
});

import { buildMarketingOpportunities, researchSignals } from "../lib/marketing";
test("marketing signals come only from retrieved papers, with no invented momentum",()=>{
 const signal=researchSignals([{...paper(),year:2022,citedByCount:7},{...paper("https://openalex.org/W2",null),year:2025,citedByCount:2},{...paper("https://openalex.org/W3",null),year:null,citedByCount:0}]);
 assert.equal(signal.studyCount,3);assert.equal(signal.totalCitationCount,9);assert.deepEqual(signal.yearRange,{earliest:2022,latest:2025});assert.deepEqual(signal.researchMomentum.yearCounts,[{year:2022,workCount:1},{year:2025,workCount:1}]);assert.equal(signal.researchMomentum.label,"Unclear");
 assert.equal(researchSignals([]).yearRange,null);
});
test("marketing opportunities reject source IDs outside the retrieved registry",()=>{
 const content: import("../types/research").Opportunity={id:"x",theme:"Caffeine",question:"How does caffeine relate to sleep?",headline:"Caffeine and sleep",angle:"Educational",whyAudienceCares:"Sleep habits",evidenceSummary:"Retrieved research",evidenceStrength:"Emerging research",evidenceReason:"Small discovery sample",paperCount:1,suggestedKeywords:["sleep"],papers:[paper()],safetyFlags:[],queries:[],considered:1,generationMethod:"test"};
 assert.throws(()=>buildMarketingOpportunities([content],[],inputSchema.parse({brief:"sleep brand"})),/outside the retrieved/);
 const output=buildMarketingOpportunities([content],[paper()],inputSchema.parse({brief:"sleep brand"}));assert.equal(output.length,1);assert.ok(output[0].suggestedActivations[0].includes("Coffee"));assert.ok(output[0].interpretationNotice.includes("does not prove"));
});
