"use client";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarketingOpportunityCard } from "@/components/MarketingOpportunityCard";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ShieldCheck, Download, Search, AlertCircle } from "lucide-react";
import { ResearchForm, initialInput, defaultDiscovery, type Discovery } from "@/components/ResearchForm";
import { ResearchProgress } from "@/components/ResearchProgress";
import { OpportunityCard } from "@/components/OpportunityCard";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";
import { PaperCard } from "@/components/PaperCard";
import { newestPapersFirst } from "@/lib/papers";
import { inputSchema } from "@/lib/schemas";
import { copyText, csv, marketingCsv } from "@/lib/export";
import type { ResearchInput, ResearchResult, Opportunity, ProgressEvent } from "@/types/research";
type Context={registerTool:(tool:{name:string;description:string;inputSchema:object;annotations:object;execute:(v:unknown)=>unknown},options:{signal:AbortSignal})=>void|Promise<void>};
export default function Page(){
 const [input,setInput]=useState<ResearchInput>(initialInput),[result,setResult]=useState<ResearchResult|null>(null);
 const [viewMode,setViewMode]=useState("overview");
 const [discovery,setDiscovery]=useState<Discovery[]>(defaultDiscovery),[requested,setRequested]=useState<Discovery[]>(defaultDiscovery);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [progress,setProgress]=useState<ProgressEvent>({stage:0,message:"Understanding my topic…"});
 const [selected,setSelected]=useState<Opportunity|null>(null),[filter,setFilter]=useState("All themes");
 const controller=useRef<AbortController|null>(null),locked=useRef(false),resultRef=useRef<ResearchResult|null>(null);
 const run=useCallback(async(value:unknown)=>{
  if(locked.current)throw new Error("A search is already running.");
  const parsed=inputSchema.safeParse(value);if(!parsed.success){setError(parsed.error.issues[0].message);throw new Error(parsed.error.issues[0].message);}
  locked.current=true;setInput(parsed.data);setBusy(true);setError("");setNotice("");setSelected(null);setResult(null);resultRef.current=null;setFilter("All themes");setViewMode("overview");setProgress({stage:0,message:"Understanding my topic…"});
  const abort=new AbortController();controller.current=abort;
  try{
   const response=await fetch("/api/research-content",{method:"POST",headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(parsed.data),signal:abort.signal});
   if(!response.ok){const data=await response.json() as {error?:string};throw new Error(data.error||"The research search failed.");}
   if(!response.body)throw new Error("No research response received.");
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer="",found:ResearchResult|null=null;
   while(true){const chunk=await reader.read();buffer+=decoder.decode(chunk.value,{stream:!chunk.done});const frames=buffer.split("\n\n");buffer=frames.pop()||"";
    for(const frame of frames){const kind=frame.split("\n").find(l=>l.startsWith("event: "))?.slice(7);
     const data=JSON.parse(frame.split("\n").find(l=>l.startsWith("data: "))?.slice(6)||"{}");
     if(kind==="progress")setProgress(data);else if(kind==="error")throw new Error(data.error);else if(kind==="result"){found=data;setResult(data);resultRef.current=data;}
    }if(chunk.done)break;
   }
   if(!found)throw new Error("The research stream ended before results arrived.");
   return {opportunities:found.opportunities.length,marketingOpportunities:found.marketingOpportunities.length,papers:found.metadata.uniquePapers,themes:found.themes};
  }catch(e){const message=abort.signal.aborted?"Search cancelled. My brief is ready to try again.":e instanceof Error?e.message:"The search failed.";setError(message);throw new Error(message);}
  finally{setBusy(false);locked.current=false;controller.current=null;}
 },[]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 useEffect(()=>{
  const ctx=(document as Document&{modelContext?:Context}).modelContext;if(!ctx?.registerTool)return;
  const lifecycle=new AbortController();
  const register=async()=>{try{
   await ctx.registerTool({name:"research_content_opportunities",description:"Run real OpenAlex research and update the visible content opportunity results. Returns sample counts after research completes.",inputSchema:{type:"object",properties:{brief:{type:"string",minLength:3,maxLength:2000},industry:{type:"string",enum:["auto","health","sustainability","education","finance","b2b","technology","other"]},audience:{type:"string",maxLength:300},ideaCount:{type:"integer",enum:[5,10,20]},yearRange:{type:"integer",enum:[0,5,10]}},required:["brief"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:run},{signal:lifecycle.signal});
   await ctx.registerTool({name:"read_research_opportunities",description:"Read the currently displayed research ideas and their real supporting source IDs.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:(v)=>{if(!v||typeof v!=="object"||Object.keys(v).length)throw new Error("Expected an empty object.");return resultRef.current?.opportunities.map(o=>({headline:o.headline,question:o.question,paperIds:o.papers.map(p=>p.id)}))||[];}},{signal:lifecycle.signal});
  }catch{ /* Browser capability is optional; the visible UI remains available. */ }};void register();return()=>lifecycle.abort();
 },[run]);
 async function copy(o:Opportunity,citations:boolean){try{await navigator.clipboard.writeText(copyText(o,citations));setNotice(citations?"Idea and citations copied.":"Idea copied.");}catch{setNotice("Clipboard access is unavailable. Use Export CSV to save the ideas and citations.");}}
 function download(){if(!result)return;const exportMarketing=viewMode==="marketing"||!requested.includes("contentIdeas");const url=URL.createObjectURL(new Blob([exportMarketing?marketingCsv(result):csv(result)],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=exportMarketing?"claudia-marketing-opportunities.csv":"claudia-content-opportunities.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice("CSV exported with source citations.");}
 const visible=result?.opportunities.filter(o=>filter==="All themes"||o.theme===filter)||[];
 return <div className="workspace"><header><Link className="brand" href="/">Claudia&apos;s research studio</Link><span className="source-label"><BookOpen size={16}/> Powered by OpenAlex</span></header>
 <main><div className="title-row"><div><h1>Research-backed<br/>marketing ideas</h1><p className="intro">Turning academic evidence into content ideas, audience insights and marketing opportunities.</p></div><div className="research-seal"><ShieldCheck size={28}/><strong>Grounded in real research</strong><span>Every recommendation links back to its evidence.</span></div></div>
 <ResearchForm input={input} setInput={setInput} busy={busy} discovery={discovery} setDiscovery={setDiscovery} onSubmit={()=>{setRequested([...discovery]);void run(input).catch(()=>{});}} onCancel={()=>controller.current?.abort()}/>
 {busy&&<ResearchProgress event={progress} discovery={requested}/>}
 {error&&<div className="error" role="alert"><AlertCircle size={18}/><div><strong>Research could not be completed</strong><p>{error}</p></div></div>}
 <div className="notification" role="status" aria-live="polite">{notice}</div>
 {result?<section className="results" aria-label="Research opportunities"><div className="results-heading"><div><div className="section-label"><span className="number">03</span> My research opportunities</div><p className="muted small">{result.opportunities.length} distinct ideas · {result.metadata.uniquePapers} unique papers · {result.metadata.queriesSucceeded} successful searches</p></div><button className="secondary" onClick={download} disabled={!result.opportunities.length}><Download size={16}/> Export CSV</button></div>
 <div className="coverage-note"><ShieldCheck size={18}/><p>{result.metadata.coverage}</p></div>
 {result.warnings.length>0&&<details className="warnings"><summary>Search notes ({result.warnings.length})</summary>{result.warnings.map(w=><p key={w}>{w}</p>)}</details>}
 {result.opportunities.length>0?<><div className="theme-filters" aria-label="Filter by theme">{["All themes",...result.opportunities.map(o=>o.theme)].map(t=><button key={t} aria-pressed={filter===t} className={filter===t?"active":""} onClick={()=>setFilter(t)}>{t}</button>)}</div><Tabs value={viewMode} onValueChange={setViewMode} className="results-tabs"><TabsList className="opportunity-tabs" aria-label="Opportunity type"><TabsTrigger value="overview">Overview</TabsTrigger>{requested.includes("contentIdeas")&&<TabsTrigger value="content">Content ideas</TabsTrigger>}{requested.includes("marketingOpportunities")&&result.marketingOpportunities.length>0&&<TabsTrigger value="marketing">Marketing opportunities</TabsTrigger>}<TabsTrigger value="research">Research</TabsTrigger></TabsList><TabsContent value="overview"><div className="overview-metrics"><div><strong>{result.metadata.uniquePapers}</strong><span>Unique retrieved papers</span></div><div><strong>{result.opportunities.length}</strong><span>Supported themes</span></div>{requested.includes("contentIdeas")&&<div><strong>{result.opportunities.length}</strong><span>Content ideas</span></div>}{requested.includes("marketingOpportunities")&&<div><strong>{result.marketingOpportunities.length}</strong><span>Marketing opportunities</span></div>}</div><p className="muted small">Research, translated for marketing. Explore the selected results or read the supporting papers.</p>{requested.includes("researchSignals")&&<div className="sample-signals"><h3>Research signals</h3><p className="small muted">These counts describe the retrieved sample. Changes in research attention and growing themes cannot be established from these relevance-selected papers.</p>{visible.map(o=><div className="signal-row" key={o.id}><strong>{o.theme}</strong><span>{o.paperCount} supporting works</span><span>Research momentum: unclear</span></div>)}</div>}</TabsContent><TabsContent value="research"><p className="small muted">Supporting papers, newest first. Shared papers appear once.</p>{newestPapersFirst(Array.from(new Map(visible.flatMap(o=>o.papers).map(p=>[p.id,p])).values())).map(p=><PaperCard key={p.id} paper={p}/>)}</TabsContent><TabsContent value="content"><div className="opportunity-grid">{visible.map((o,i)=><OpportunityCard key={o.id} opportunity={o} index={i+1} onEvidence={setSelected} onCopy={(o,c)=>{void copy(o,c);}}/>)}</div></TabsContent><TabsContent value="marketing"><p className="marketing-intro">My marketing opportunities use the same papers as my content ideas. Audience implications and activations are proposals, not verified research findings or performance predictions.</p><div className="opportunity-grid">{(result.marketingOpportunities||[]).filter(o=>filter==="All themes"||o.theme===filter).map(o=><MarketingOpportunityCard key={o.id} opportunity={o} onPapers={m=>{const source=result.opportunities.find(c=>c.id===m.sourceOpportunityId);if(source)setSelected({...source,headline:m.title});}}/>)}</div></TabsContent></Tabs></>:<div className="empty"><Search size={28}/><h3>Limited research found for this question.</h3><p>Try a broader research topic or an adjacent search. No unsupported ideas were added.</p></div>}
 {result.adjacentSearches.length>0&&<div className="adjacent"><strong>Explore a broader question</strong><p className="small muted">These are suggested searches, not evidence-backed recommendations.</p>{result.adjacentSearches.map(q=><button className="preset" key={q} onClick={()=>setInput({...input,brief:q})}>{q}</button>)}</div>}
 <p className="small muted result-time">Retrieved {new Date(result.metadata.completedAt).toLocaleString()} · {result.metadata.method}</p>
 </section>:null}
 {!result&&!busy&&<section className="value-preview" aria-labelledby="preview-title"><h2 id="preview-title">See what I’ll discover</h2><article className="example-result"><span className="example-label">Example · illustrative only</span><h3>Sleep consistency could be an underused education theme</h3><div className="example-columns"><div><h4>What the research could explore</h4><p>Sleep regularity and timing alongside total sleep duration.</p></div><div><h4>My marketing opportunity</h4><p>Help my audience explore why sleep timing may matter alongside duration.</p></div></div><details><summary>View example evidence</summary><p>This is a demonstration of the result format. No papers, counts or findings are claimed here. Select Sleep &amp; recovery above to retrieve real research.</p></details></article></section>}
 <aside className="trust"><ShieldCheck/><div><strong>Research first. Every idea traceable.</strong><p>Paper titles are not findings. Research coverage is not scientific certainty. Read the sources before making a claim.</p></div></aside>
 </main><footer>Claudia&apos;s research studio <span>Built on questions. Grounded in research.</span></footer>
 <EvidenceDrawer opportunity={selected} onClose={()=>setSelected(null)} onCopy={(o,c)=>{void copy(o,c);}}/>
 </div>;
}

