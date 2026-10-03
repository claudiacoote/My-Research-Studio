import { z } from "zod";
export const inputSchema = z.object({
  brief: z.string().trim().min(3, "Describe your brand in at least 3 characters.").max(2000),
  industry: z.enum(["auto","health","sustainability","education","finance","b2b","technology","other"]).default("auto"),
  audience: z.string().trim().max(300).default(""),
  ideaCount: z.union([z.literal(5),z.literal(10),z.literal(20)]).default(10),
  yearRange: z.union([z.literal(0),z.literal(5),z.literal(10)]).default(10),
  minCitations: z.number().int().min(0).max(10000).default(0),
  openAccessOnly: z.boolean().default(false), includeReviews: z.boolean().default(true),
  includeFoundational: z.boolean().default(false),
}).strict();
export const modelOutputSchema = z.object({ opportunities: z.array(z.object({
  question: z.string().min(3).max(250), headline: z.string().min(3).max(200),
  angle: z.string().max(1000), whyAudienceCares: z.string().max(1000), evidenceSummary: z.string().max(1000),
  evidenceStrength: z.enum(["strong","moderate","emerging","limited"]),
  paperIds: z.array(z.string()).max(30), suggestedKeywords: z.array(z.string().max(80)).max(10),
}).strict()).max(20) }).strict();
// Any future model integration must use this boundary before joining citations to real papers.
export function validateModelCitations(value: unknown, allowedIds: Set<string>) {
  const parsed = modelOutputSchema.parse(value);
  return parsed.opportunities.map(o => ({...o, paperIds: [...new Set(o.paperIds.filter(id=>allowedIds.has(id)))]}))
    .filter(o=>o.paperIds.length>0);
}
