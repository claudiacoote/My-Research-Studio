import { Check, LoaderCircle } from "lucide-react";
import type { ProgressEvent } from "@/types/research";
import type { Discovery } from "./ResearchForm";
export function ResearchProgress({event,discovery}:{event:ProgressEvent;discovery:Discovery[]}){
 const steps=[{stage:0,label:"Understanding my brief"},{stage:1,label:"Planning research questions"},{stage:2,label:"Searching academic research"},{stage:3,label:"Comparing retrieved papers"},{stage:4,label:"Grouping relevant themes"},...(discovery.includes("contentIdeas")?[{stage:5,label:"Finding content ideas"}]:[]),...(discovery.includes("marketingOpportunities")?[{stage:5,label:"Finding marketing opportunities"}]:[]),...(discovery.includes("researchSignals")?[{stage:5,label:"Preparing research signals"}]:[])];
 const message=event.stage===5?"Preparing my selected results…":event.message;
 return <section className="research-progress" role="status" aria-live="polite" aria-busy="true"><div className="progress-message"><LoaderCircle className="spin" size={18} aria-hidden="true"/><strong>{message}</strong></div><ol className="stages">{steps.map(s=><li className={s.stage===event.stage?"current":s.stage<event.stage?"complete":""} key={s.label}>{s.stage<event.stage?<Check size={14} aria-hidden="true"/>:<span aria-hidden="true">{s.stage===event.stage?"●":"○"}</span>}<span>{s.label}</span><span className="sr-only">{s.stage<event.stage?", completed":s.stage===event.stage?", in progress":", pending"}</span></li>)}</ol></section>;
}
