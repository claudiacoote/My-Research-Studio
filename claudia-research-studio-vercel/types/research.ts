export interface Paper {
  id: string; title: string; authors: string[]; authorIds: string[]; year: number | null;
  publicationDate: string | null; journal: string | null; doi: string | null;
  openAlexUrl: string; citedByCount: number; abstract: string | null; workType: string;
  studyType: string; studyTypeBasis: string; topics: string[]; relevanceScore: number;
  isOpenAccess: boolean; discoveredBy: string[];
}
export interface ResearchQuestion { anchor: string; terms: string[]; question: string; headline: string; queries: string[] }
export type Strength = "Strong research base" | "Moderate research base" | "Emerging research" | "Limited evidence";
export interface Opportunity {
  signal?: ResearchSignal; researchSignalIds?: string[]; id: string; question: string; headline: string; angle: string;
  whyAudienceCares: string; evidenceSummary: string; evidenceStrength: Strength;
  evidenceReason: string; paperCount: number; papers: Paper[]; suggestedKeywords: string[];
  safetyFlags: string[]; queries: string[]; considered: number; generationMethod: string;
}
export interface ResearchResult {
  opportunities: Opportunity[]; marketingOpportunities: MarketingOpportunity[]; researchSignals: ResearchSignal[]; warnings: string[]; adjacentSearches: string[];
  metadata: { papersSearched: number; uniquePapers: number; queriesRun: number; queriesSucceeded: number;
    completedAt: string; method: string; requestedIdeas: number; coverage: string };
}
export interface ResearchInput { brief: string; industry: string; audience: string; ideaCount: number;
  yearRange: number; minCitations: number; openAccessOnly: boolean; includeReviews: boolean; includeFoundational: boolean }
export interface ProgressEvent { stage: number; message: string; completed?: number; total?: number }

export interface MarketingOpportunity {
  researchSignalIds?: string[]; id: string; sourceOpportunityId: string; title: string; researchContext: string;
  evidenceSummary: string; audienceImplication: string; marketingOpportunity: string;
  suggestedActivations: string[]; supportingWorkIds: string[]; studyCount: number;
  yearRange: {earliest: number; latest: number} | null; totalCitationCount: number;
  evidenceStrength: Strength; safetyFlags: string[]; interpretationNotice: string;
  researchMomentum: {label: "Unclear"; explanation: string; yearCounts: {year: number; workCount: number}[]};
}


export const signalDefinitions = {
 growing_importance: {label:"Growing importance",question:"What is becoming more important?"},
 declining_effectiveness: {label:"Declining effectiveness",question:"What may not work as well as it used to?"},
 strong_driver: {label:"Strong driver",question:"What is associated with the outcome?"},
 key_barrier: {label:"Key barrier",question:"What is getting in the customer’s way?"},
 audience_difference: {label:"Audience difference",question:"Who responds differently?"},
 behaviour_gap: {label:"Behaviour gap",question:"Where do stated intentions differ from action?"},
 trust_risk: {label:"Trust risk",question:"What could undermine customer trust?"},
 unmet_need: {label:"Unmet need",question:"What are customers not getting?"},
 emerging_opportunity: {label:"Emerging opportunity",question:"Where might there be a new opportunity?"},
 mixed_evidence: {label:"Mixed evidence",question:"Where is the evidence not settled?"},
 context_dependent: {label:"Context dependent",question:"When, where or for whom does this work?"},
 under_researched: {label:"Under-researched",question:"What question lacks evidence in this sample?"},
} as const;
export type ResearchSignalType = keyof typeof signalDefinitions;
export const signalTypeValues = Object.keys(signalDefinitions) as [ResearchSignalType,...ResearchSignalType[]];
export const signalStrengthLabels = {strong:"Strong",moderate:"Moderate",limited:"Limited",mixed:"Mixed"} as const;
export type SignalEvidenceStrength = keyof typeof signalStrengthLabels;
export const signalStrengthValues = Object.keys(signalStrengthLabels) as [SignalEvidenceStrength,...SignalEvidenceStrength[]];
export interface ResearchSignal {
 id: string; signalType: ResearchSignalType; title: string; evidenceSummary: string; marketingImplication: string;
 evidenceStrength: SignalEvidenceStrength; evidenceReason: string;
 supportingPaperCount: number; relevantPaperCount: number; supportingPaperIds: string[];
 excerpts: {paperId: string; text: string; stance: "supporting" | "contradictory"}[];
 limitation: string;
}
