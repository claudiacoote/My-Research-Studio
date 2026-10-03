import type { Paper } from "@/types/research";
import { ExternalLink } from "lucide-react";
export function PaperCard({paper:p}:{paper:Paper}){return <article className="paper-card">
 <div className="paper-type">{p.studyType} {p.isOpenAccess&&<span>Open access</span>}</div>
 <h3><a href={p.openAlexUrl} target="_blank" rel="noopener noreferrer">{p.title}</a></h3>
 <p className="paper-meta">{p.authors.length?p.authors.join(", "):"Authors not supplied"}<br/>{p.journal||"Publication not supplied"} · {p.year||"Year not supplied"}</p>
 <p className="small muted">{p.citedByCount.toLocaleString()} citations · {p.studyTypeBasis}</p>
 {p.abstract?<div className="abstract"><h4>Abstract excerpt · source text</h4><blockquote>{p.abstract.slice(0,900)}{p.abstract.length>900?"…":""}</blockquote>{p.abstract.length>900&&<details><summary>Read complete available abstract</summary><p>{p.abstract}</p></details>}</div>:<p className="missing">No abstract supplied. Relevant research exists, but the study findings were not verified from the available OpenAlex metadata.</p>}
 <p className="small muted">This source text has not been independently verified against the full paper. Read the original before publishing a finding.</p>
 <div className="paper-links">{p.doi?<a href={p.doi} target="_blank" rel="noopener noreferrer">View DOI <ExternalLink size={13}/></a>:<span className="small muted">DOI not supplied</span>}<a href={p.openAlexUrl} target="_blank" rel="noopener noreferrer">View on OpenAlex <ExternalLink size={13}/></a></div>
 <details className="provenance"><summary>Discovery queries and source ID</summary><code>{p.id}</code>{p.discoveredBy.map(q=><div key={q}>{q}</div>)}</details>
 </article>;}
