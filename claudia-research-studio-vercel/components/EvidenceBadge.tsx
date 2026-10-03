import type { Strength } from "@/types/research";
export function EvidenceBadge({strength}:{strength:Strength}){return <span className={"evidence-badge "+(strength==="Strong research base"?"strong":strength==="Moderate research base"?"moderate":"emerging")}>{strength}</span>}
