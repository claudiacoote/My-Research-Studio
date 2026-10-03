import { newestPapersFirst, conciseHeadline } from "@/lib/papers";
import type { Opportunity } from "@/types/research";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EvidenceBadge } from "./EvidenceBadge";
import { PaperCard } from "./PaperCard";
export function EvidenceDrawer({opportunity:o,onClose,onCopy}:{opportunity:Opportunity|null;onClose:()=>void;onCopy:(o:Opportunity,c:boolean)=>void}){return <Sheet open={!!o} onOpenChange={v=>{if(!v)onClose();}}><SheetContent className="evidence-drawer" aria-describedby="evidence-description">
 <SheetHeader><span className="eyebrow">THE RESEARCH BEHIND THE IDEA</span><SheetTitle className="drawer-title">{o ? conciseHeadline(o.headline) : "My papers"}</SheetTitle><SheetDescription id="evidence-description">{o?.question}</SheetDescription></SheetHeader>
 {o&&<div className="drawer-body"><EvidenceBadge strength={o.evidenceStrength}/><p>{o.evidenceReason}</p><div className="notice">{o.evidenceSummary}</div>
 {o.safetyFlags.length>0&&<div className="safety">{o.safetyFlags.map(f=><p key={f}>{f}</p>)}</div>}
 <section className="transparency"><h3>Why am I seeing this?</h3><p>{o.generationMethod}</p><p><strong>{o.considered}</strong> unique papers considered for this theme; <strong>{o.paperCount}</strong> included after screening.</p><h4>Search terms used</h4><div className="query-list">{o.queries.map(q=><code key={q}>{q}</code>)}</div><h4>Suggested keywords</h4><p>{o.suggestedKeywords.join(" · ")}</p></section>
 <div className="drawer-source-heading"><h3>My papers ({o.paperCount})</h3><button className="text-button" onClick={()=>onCopy(o,true)}>Copy with citations</button></div>
 <p className="small muted">Newest research first. Papers with no publication date use their year; undated papers appear last. Citation counts reflect attention, not scientific validity. Study type labels come from explicit title wording or OpenAlex’s review type.</p>
 {newestPapersFirst(o.papers).map(p=><PaperCard key={p.id} paper={p}/>)}</div>}
 </SheetContent></Sheet>;}
