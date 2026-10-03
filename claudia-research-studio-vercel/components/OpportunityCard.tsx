import { conciseHeadline } from "@/lib/papers";
import { BookOpen, Copy, Info } from "lucide-react";
import type { Opportunity } from "@/types/research";
import { EvidenceBadge } from "./EvidenceBadge";
export function OpportunityCard({opportunity:o,index,onEvidence,onCopy}:{opportunity:Opportunity;index:number;onEvidence:(o:Opportunity)=>void;onCopy:(o:Opportunity,citations:boolean)=>void}){
 const reviews=o.papers.filter(p=>/review|Meta-analysis/i.test(p.studyType)).length;
 return <article className="opportunity"><div className="card-top"><span className="theme-label">{String(index+1).padStart(2,"0")} / {o.theme}</span><EvidenceBadge strength={o.evidenceStrength}/></div>
 <h3>{conciseHeadline(o.headline)}</h3><div className="question">{o.question}</div>
 <div className="card-section"><h4>Why my audience cares</h4><p>{o.whyAudienceCares}</p></div>
 <div className="paper-stats"><BookOpen size={17}/><strong>{o.paperCount} relevant papers</strong><span>{reviews} reviews / meta-analyses</span></div>
 <div className="card-section"><h4>Suggested content angle</h4><p>{o.angle}</p></div>
 <p className="verification-note">Literature identified · findings require verification</p>
 {o.safetyFlags.length>0&&<p className="card-safety">{o.safetyFlags[0]}</p>}
 <div className="card-actions"><button className="evidence-button" onClick={()=>onEvidence(o)}><BookOpen size={15}/> View papers</button><button className="icon-button" aria-label={"Copy idea: "+o.headline} title="Copy idea" onClick={()=>onCopy(o,false)}><Copy size={16}/></button><button className="text-button small" onClick={()=>onCopy(o,true)}>Copy with citations</button></div>
 <button className="why-button" onClick={()=>onEvidence(o)}><Info size={13}/> Why am I seeing this?</button>
 </article>;
}
