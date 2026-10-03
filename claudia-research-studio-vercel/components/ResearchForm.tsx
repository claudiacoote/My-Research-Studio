"use client";
import type { ResearchInput } from "@/types/research";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
export type Discovery = "contentIdeas" | "marketingOpportunities" | "researchSignals";
export const defaultDiscovery:Discovery[]=["contentIdeas","marketingOpportunities"];
const discoveries:[Discovery,string,string][]=[["contentIdeas","Content ideas","Topics, angles and thought-leadership opportunities."],["marketingOpportunities","Marketing opportunities","Campaigns, positioning, customer education and messaging."],["researchSignals","Research signals","Patterns, shifts, opportunities and risks emerging across the research."]];
export const initialInput:ResearchInput={brief:"",industry:"auto",audience:"",ideaCount:10,yearRange:10,minCitations:0,openAccessOnly:false,includeReviews:true,includeFoundational:false};
const presets=[
 {name:"Sleep & recovery",industry:"health",brief:"We sell sleep and recovery products. Our audience wants practical, science-backed advice for improving sleep quality and feeling more rested."},
 {name:"Sustainable living",industry:"sustainability",brief:"We sell sustainable household products. Our audience wants credible explanations of packaging, waste, and everyday environmental choices."},
 {name:"Learning & education",industry:"education",brief:"We help students learn more effectively. Our audience wants research-backed explanations of study habits, feedback, and learning tools."},
 {name:"Workplace & B2B",industry:"b2b",brief:"We help businesses improve workplace collaboration. Our audience is team leaders interested in remote work, wellbeing, and productivity."},
];
function Choice({id,label,value,options,onChange,disabled}:{id:string;label:string;value:string;options:[string,string][];onChange:(s:string)=>void;disabled:boolean}) {
 return <div><label htmlFor={id}>{label}</label><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id} className="choice"><SelectValue/></SelectTrigger><SelectContent>{options.map(([v,t])=><SelectItem key={v} value={v}>{t}</SelectItem>)}</SelectContent></Select></div>;
}
export function ResearchForm({input,setInput,busy,onSubmit,onCancel,discovery,setDiscovery}:{discovery:Discovery[];setDiscovery:(d:Discovery[])=>void;input:ResearchInput;setInput:(i:ResearchInput)=>void;busy:boolean;onSubmit:()=>void;onCancel:()=>void}) {
 const update=<K extends keyof ResearchInput>(k:K,v:ResearchInput[K])=>setInput({...input,[k]:v});
 return <form className="brief-panel" onSubmit={e=>{e.preventDefault();onSubmit();}}>
  <div className="panel-heading"><div className="section-label"><span className="number">01</span> My research brief</div><span className="small muted">My brand. My questions. Real research.</span></div>
  <label htmlFor="brief">What does my brand or audience care about?</label>
  <textarea id="brief" value={input.brief} onChange={e=>update("brief",e.target.value)} maxLength={2000} required minLength={3} disabled={busy} placeholder="Describe what I sell, what my audience cares about, or a question I’d like to investigate…"/>
  <div className="presets"><span>Try an example</span>{presets.map(p=><button type="button" className="preset" key={p.name} aria-pressed={input.brief===p.brief} disabled={busy} onClick={()=>setInput({...input,brief:p.brief,industry:p.industry})}>{p.name}</button>)}</div>
  <div className="controls primary-controls">
   <div className="audience"><label htmlFor="audience">My audience <span className="muted normal">(optional)</span></label><input id="audience" maxLength={300} value={input.audience} onChange={e=>update("audience",e.target.value)} placeholder="Who am I researching for?" disabled={busy}/></div>
   <Choice id="industry" label="My industry" value={input.industry} disabled={busy} onChange={v=>update("industry",v)} options={[["auto","Detect automatically"],["health","Health"],["sustainability","Sustainability"],["education","Education"],["finance","Finance"],["b2b","B2B"],["technology","Technology"],["other","Other"]]}/>
  </div>
  <details className="filters"><summary><SlidersHorizontal size={15}/><span><strong>Research settings</strong><small>{input.includeFoundational||input.yearRange===0?"All time":"Last "+input.yearRange+" years"} · Up to {input.ideaCount} ideas</small></span><span className="settings-edit">Edit</span></summary><div className="settings-controls">
   <Choice id="period" label="Research period" value={String(input.yearRange)} disabled={busy} onChange={v=>update("yearRange",Number(v))} options={[["5","Last 5 years"],["10","Last 10 years"],["0","All time"]]}/>
   <Choice id="count" label="Number of ideas" value={String(input.ideaCount)} disabled={busy} onChange={v=>update("ideaCount",Number(v))} options={[["5","Up to 5"],["10","Up to 10"],["20","Up to 20"]]}/>
  </div><div className="filter-grid">
   <label className="check"><Checkbox id="oa" checked={input.openAccessOnly} onCheckedChange={v=>update("openAccessOnly",v===true)} disabled={busy}/> Open-access only</label>
   <label className="check"><Checkbox id="reviews" checked={input.includeReviews} onCheckedChange={v=>update("includeReviews",v===true)} disabled={busy}/> Include reviews</label>
   <label className="check"><Checkbox id="foundational" checked={input.includeFoundational} onCheckedChange={v=>update("includeFoundational",v===true)} disabled={busy}/> Include older research</label>
   <div><label htmlFor="citations">Minimum citations</label><input id="citations" type="number" min={0} max={10000} value={input.minCitations} disabled={busy} onChange={e=>update("minCitations",Number(e.target.value))}/></div>
  </div><p className="small muted">Older research removes the date restriction. Recent papers are included regardless of citations by default. Citation counts do not measure scientific validity.</p></details>
  <fieldset className="discovery"><legend><span className="number">02</span> What would I like to discover?</legend><div className="discovery-options">{discoveries.map(([key,title,description])=><label key={key} className={discovery.includes(key)?"discovery-option selected":"discovery-option"}><input type="checkbox" checked={discovery.includes(key)} disabled={busy} onChange={e=>setDiscovery(e.target.checked?[...discovery,key]:discovery.filter(d=>d!==key))}/><span><strong>{title}</strong><small>{description}</small></span></label>)}</div>{!discovery.length&&<p className="small" role="status">Select at least one discovery option.</p>}</fieldset>
  <div className="submit-row"><div className="cta-group"><button className="primary" type="submit" disabled={busy||input.brief.trim().length<3||!discovery.length}>{busy?"Research in progress…":"Discover opportunities"}<ArrowRight size={18}/></button><p className="cta-trust">Real academic research · Evidence included</p></div>{busy&&<button type="button" className="text-button" onClick={onCancel}>Cancel search</button>}</div>
 </form>;
}
