import type { Paper } from "../types/research";
export function deduplicate(papers:Paper[]):Paper[] {
  const groups:Paper[]=[];const ids=new Map<string,Paper>();const dois=new Map<string,Paper>();
  for(const p of papers){const doi=p.doi?.toLowerCase();const byId=ids.get(p.id),byDoi=doi?dois.get(doi):undefined;let existing=byId||byDoi;
    if(byId&&byDoi&&byId!==byDoi){byId.discoveredBy=[...new Set([...byId.discoveredBy,...byDoi.discoveredBy])];
      for(const [id,value]of ids)if(value===byDoi)ids.set(id,byId);for(const [d,value]of dois)if(value===byDoi)dois.set(d,byId);
      groups.splice(groups.indexOf(byDoi),1);existing=byId;}
    if(existing){existing.discoveredBy=[...new Set([...existing.discoveredBy,...p.discoveredBy])];
      if(!existing.abstract&&p.abstract)existing.abstract=p.abstract;existing.relevanceScore=Math.max(existing.relevanceScore,p.relevanceScore);
      existing.doi ||= p.doi;ids.set(p.id,existing);if(doi)dois.set(doi,existing);
    }else{const clone={...p,discoveredBy:[...p.discoveredBy]};groups.push(clone);ids.set(p.id,clone);if(doi)dois.set(doi,clone);}}
  return groups;
}
