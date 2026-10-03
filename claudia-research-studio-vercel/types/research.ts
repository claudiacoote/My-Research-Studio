export interface Paper {
  id: string; title: string; authors: string[]; authorIds: string[]; year: number | null;
  publicationDate: string | null; journal: string | null; doi: string | null;
  openAlexUrl: string; citedByCount: number; abstract: string | null; workType: string;
  studyType: string; studyTypeBasis: string; topics: string[]; relevanceScore: number;
  isOpenAccess: boolean; discoveredBy: string[];
}
export interface Theme { name: string; anchor: string; terms: string[]; question: string; headline: string; queries: string[] }
export type Strength = "Strong research base" | "Moderate research base" | "Emerging research" | "Limited evidence";
export interface Opportunity {
  id: string; theme: string; question: string; headline: string; angle: string;
  whyAudienceCares: string; evidenceSummary: string; evidenceStrength: Strength;
  evidenceReason: string; paperCount: number; papers: Paper[]; suggestedKeywords: string[];
  safetyFlags: string[]; queries: string[]; considered: number; generationMethod: string;
}
export interface ResearchResult {
  themes: string[]; opportunities: Opportunity[]; marketingOpportunities: MarketingOpportunity[]; warnings: string[]; adjacentSearches: string[];
  metadata: { papersSearched: number; uniquePapers: number; queriesRun: number; queriesSucceeded: number;
    completedAt: string; method: string; requestedIdeas: number; coverage: string };
}
export interface ResearchInput { brief: string; industry: string; audience: string; ideaCount: number;
  yearRange: number; minCitations: number; openAccessOnly: boolean; includeReviews: boolean; includeFoundational: boolean }
export interface ProgressEvent { stage: number; message: string; completed?: number; total?: number }

export interface MarketingOpportunity {
  id: string; sourceOpportunityId: string; theme: string; title: string; researchTheme: string;
  evidenceSummary: string; audienceImplication: string; marketingOpportunity: string;
  suggestedActivations: string[]; supportingWorkIds: string[]; studyCount: number;
  yearRange: {earliest: number; latest: number} | null; totalCitationCount: number;
  evidenceStrength: Strength; safetyFlags: string[]; interpretationNotice: string;
  researchMomentum: {label: "Unclear"; explanation: string; yearCounts: {year: number; workCount: number}[]};
}
