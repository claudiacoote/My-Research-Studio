import { BookOpen, Megaphone } from "lucide-react";
import type { MarketingOpportunity } from "@/types/research";
import { EvidenceBadge } from "./EvidenceBadge";
export function MarketingOpportunityCard({opportunity:o,onPapers}:{opportunity:MarketingOpportunity;onPapers:(o:MarketingOpportunity)=>void}){
 return <article className="opportunity marketing-card"><div className="card-top"><span className="card-eyebrow"><Megaphone size={14}/> Research-led proposal</span><EvidenceBadge strength={o.evidenceStrength}/></div>
 <h3>{o.title}</h3>
 <div className="reasoning-step"><span className="number">1</span><div><h4>What the research indicates</h4><p>{o.researchContext}</p><p className="small muted">{o.evidenceSummary}</p></div></div>
 <div className="reasoning-step"><span className="number">2</span><div><h4>My marketing opportunity</h4><p>{o.marketingOpportunity}</p></div></div>
 <div className="reasoning-step"><span className="number">3</span><div><h4>Why my audience may care</h4><p>{o.audienceImplication}</p><span className="interpretation-label">My interpretation · not a measured audience finding</span></div></div>
 <div className="card-section activations"><h4>Ways to activate</h4><ul>{o.suggestedActivations.map(a=><li key={a}>{a}</li>)}</ul></div>
 <div className="marketing-signals"><div><strong>{o.studyCount}</strong><span>Relevant works</span></div><div><strong>{o.yearRange?(o.yearRange.earliest===o.yearRange.latest?o.yearRange.earliest:o.yearRange.earliest+"–"+o.yearRange.latest):"Not supplied"}</strong><span>Publication years</span></div><div><strong>{o.researchMomentum.label}</strong><span>Research momentum</span></div></div>
 <details className="momentum-details"><summary>How these signals are calculated</summary><p>{o.researchMomentum.explanation}</p><p>{o.researchMomentum.yearCounts.length?o.researchMomentum.yearCounts.map(x=>x.year+": "+x.workCount+" retrieved works").join(" · "):"No publication years supplied."}</p><p>{o.totalCitationCount.toLocaleString()} total citations across these works. Citations measure attention, not scientific validity.</p></details>
 <p className="marketing-limit">{o.interpretationNotice}</p>{o.safetyFlags.length>0&&<p className="card-safety">{o.safetyFlags[0]}</p>}
 <div className="card-actions"><button className="evidence-button" onClick={()=>onPapers(o)}><BookOpen size={15}/> View supporting research</button></div>
 </article>;
}
