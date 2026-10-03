import { z } from "zod";
import type { Paper, ResearchInput } from "../types/research";
const workSchema=z.object({id:z.string().regex(/^https:\/\/openalex\.org\/W\d+$/), title:z.string().nullable().optional(),
  display_name:z.string().nullable().optional(), doi:z.string().nullable().optional(), publication_year:z.number().nullable().optional(),
  publication_date:z.string().nullable().optional(), cited_by_count:z.number().optional(), type:z.string().optional(),
  authorships:z.array(z.object({author:z.object({id:z.string().nullable().optional(),display_name:z.string().nullable().optional()}).nullable().optional()})).optional(),
  primary_location:z.object({source:z.object({display_name:z.string().nullable().optional()}).nullable().optional()}).nullable().optional(),
  abstract_inverted_index:z.record(z.array(z.number().int().nonnegative())).nullable().optional(),
  topics:z.array(z.object({display_name:z.string().optional()})).optional(),
  open_access:z.object({is_oa:z.boolean().optional()}).optional(), relevance_score:z.number().nullable().optional(),
}).passthrough();
export function reconstructAbstract(index: Record<string,number[]> | null | undefined): string | null {
  if(!index || Object.keys(index).length===0)return null;
  const words=new Map<number,string>();
  for(const [word,positions] of Object.entries(index))for(const p of positions)if(Number.isInteger(p)&&p>=0&&p<10000)words.set(p,word);
  return [...words.entries()].sort((a,b)=>a[0]-b[0]).map(x=>x[1]).join(" ") || null;
}
export function studyType(title:string,type:string): {label:string;basis:string} {
  const checks: [RegExp,string][]=[[/\bmeta[- ]analys(?:is|es)\b/i,"Meta-analysis"],[/\bsystematic review\b/i,"Systematic review"],
    [/\brandomi[sz]ed controlled trial\b/i,"Randomised controlled trial"],[/\bobservational study\b/i,"Observational study"],
    [/\bclinical trial\b/i,"Clinical trial"],[/\breview\b/i,"Review"]];
  for(const [re,label] of checks)if(re.test(title))return {label,basis:"Study type explicitly named in the paper title; not independently appraised."};
  if(type==="review")return {label:"Review",basis:"OpenAlex work type is review; not independently appraised."};
  return {label:"Unknown",basis:"Available metadata does not explicitly establish the study design."};
}
export function normaliseWork(raw:unknown,query=""):Paper|null {
  const r=workSchema.safeParse(raw);if(!r.success)return null;const w=r.data;
  const title=w.title||w.display_name;if(!title)return null;const design=studyType(title,w.type||"unknown");
  const doi=w.doi?.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i,"");
  return {id:w.id,title,authors:(w.authorships||[]).flatMap(a=>a.author?.display_name?[a.author.display_name]:[]),
    authorIds:(w.authorships||[]).flatMap(a=>a.author?.id?[a.author.id]:[]),year:w.publication_year??null,
    publicationDate:w.publication_date??null,journal:w.primary_location?.source?.display_name??null,
    doi:doi && /^10\.\d{4,9}\/\S+$/i.test(doi)?`https://doi.org/${doi}`:null,openAlexUrl:w.id,
    citedByCount:Math.max(0,w.cited_by_count??0),abstract:reconstructAbstract(w.abstract_inverted_index),
    workType:w.type||"unknown",studyType:design.label,studyTypeBasis:design.basis,
    topics:(w.topics||[]).flatMap(t=>t.display_name?[t.display_name]:[]),relevanceScore:w.relevance_score??0,
    isOpenAccess:w.open_access?.is_oa??false,discoveredBy:query?[query]:[]};
}
export class OpenAlexError extends Error { constructor(public status:number,message:string){super(message);this.name="OpenAlexError";} }
export function handleRateLimits(response:Response,attempt:number):number {
  const raw=response.headers.get("retry-after"); const numeric=raw?Number(raw):NaN;
  const wait=raw?(Number.isFinite(numeric)?numeric*1000:Date.parse(raw)-Date.now()):0;
  return Math.min(8000,Math.max(0,wait||500*2**attempt));
}
export async function requestJson(url:URL,key:string|undefined,fetcher:typeof fetch=fetch,signal?:AbortSignal,
  sleep:(ms:number)=>Promise<void> = ms=>new Promise(r=>setTimeout(r,ms))):Promise<unknown> {
  for(let attempt=0;attempt<3;attempt++){
    signal?.throwIfAborted();
    try {
      const response=await fetcher(url,{headers:key?{Authorization:`Bearer ${key}`}:{},signal:AbortSignal.any([AbortSignal.timeout(12000),...(signal?[signal]:[])])});
      if(!response.ok){
        if((response.status===429||response.status>=500)&&attempt<2){await sleep(handleRateLimits(response,attempt));continue;}
        throw new OpenAlexError(response.status,response.status===429?"OpenAlex is rate-limiting requests. Please try again later.":response.status===401||response.status===403?"OpenAlex authentication failed. Check the server API key.":"OpenAlex could not complete this search.");
      }
      return await response.json();
    }catch(error){if(error instanceof OpenAlexError||signal?.aborted)throw error;
      if(attempt===2)throw new OpenAlexError(502,"OpenAlex could not be reached or returned an invalid response. Please try again.");await sleep(500*2**attempt);}
  }throw new OpenAlexError(502,"OpenAlex search failed.");
}
const select="id,doi,title,publication_year,publication_date,type,cited_by_count,authorships,primary_location,open_access,topics,abstract_inverted_index,relevance_score";
export function buildSearchQuery(query:string,input:ResearchInput,page=1):URL {
  const url=new URL("https://api.openalex.org/works");url.searchParams.set("search.title_abstract_keywords",query.slice(0,400));
  url.searchParams.set("per_page","2");url.searchParams.set("page",String(page));url.searchParams.set("select",select);
  const filters=["is_retracted:false"];
  if(input.yearRange&&!input.includeFoundational)filters.push(`from_publication_date:${new Date().getUTCFullYear()-input.yearRange}-01-01`);
  if(input.openAccessOnly)filters.push("open_access.is_oa:true");
  if(input.minCitations)filters.push(`cited_by_count:>${input.minCitations-1}`);
  if(!input.includeReviews)filters.push("type:!review");
  url.searchParams.set("filter",filters.join(","));return url;
}
const cache=new Map<string,{expires:number;papers:Paper[]}>();
const inFlight=new Map<string,Promise<Paper[]>>();
export async function searchWorks(query:string,input:ResearchInput,key?:string,signal?:AbortSignal):Promise<Paper[]> {
  const url=buildSearchQuery(query,input);const cacheKey=url.toString()+"|"+(key?"authenticated":"anonymous");
  const hit=cache.get(cacheKey);if(hit&&hit.expires>Date.now())return hit.papers.map(p=>({...p,discoveredBy:[query]}));
  const pending=inFlight.get(cacheKey);if(pending)return (await pending).map(p=>({...p,discoveredBy:[query]}));
  const job=(async()=>{const data=await requestJson(url,key,fetch,signal);const r=z.object({results:z.array(z.unknown()).max(100)}).safeParse(data);
    if(!r.success)throw new OpenAlexError(502,"OpenAlex returned an unexpected response.");
    const papers=r.data.results.map(w=>normaliseWork(w,query)).filter((p):p is Paper=>!!p);
    if(cache.size>=128)cache.delete(cache.keys().next().value!);cache.set(cacheKey,{expires:Date.now()+15*60*1000,papers});return papers;})();
  inFlight.set(cacheKey,job);try{return await job;}finally{inFlight.delete(cacheKey);}
}
export async function getWork(id:string,key?:string):Promise<Paper|null>{
  if(!/^https:\/\/openalex\.org\/W\d+$/.test(id))throw new Error("Invalid OpenAlex work ID.");
  return normaliseWork(await requestJson(new URL(`https://api.openalex.org/works/${id.split("/").pop()}?select=${select.replace(",relevance_score","")}`),key));
}
export function handlePagination(page:number):number {if(!Number.isInteger(page)||page<1||page>2)throw new Error("Candidate searches are limited to two pages.");return page;}
