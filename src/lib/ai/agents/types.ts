/**
 * Shared types for multi-agent health check pipeline.
 */

export interface CompanyProfile {
  type: string;
  size: "micro" | "small" | "medium";
  hasEmployees: boolean;
  employeeCount: string;
  hasInternationalActivity: boolean;
  internationalScope: "EU" | "Global" | "Kun Danmark";
  hasMultipleOwners: boolean;
  industry: string;
  riskFactors: string[];
  areaWeights: {
    gdpr: number;
    employment: number;
    corporate: number;
    contracts: number;
    ip: number;
  };
}

export interface LawReference {
  law: string;
  paragraph: string;
  stk?: string;
  description: string;
  url: string;
  isEURegulation: boolean;
  verified?: boolean | null;
  verifiedAt?: string;
  retsinformationUrl?: string;
}

export interface SpecialistIssue {
  title: string;
  description: string;
  riskLevel: "critical" | "important" | "recommended";
  confidence: "high" | "medium" | "low";
  confidenceReason: string;
  lawReferences: LawReference[];
  action: string;
  timeEstimate: string;
  deadline: string;
}

export interface SpecialistAnalysis {
  area: string;
  areaName: string;
  status: "critical" | "warning" | "ok";
  score: number;
  issues: SpecialistIssue[];
  positives: string[];
  summary: string;
}

export interface ActionItem {
  priority: number;
  title: string;
  description: string;
  area: string;
  riskLevel: "critical" | "important" | "recommended";
  timeEstimate: string;
  deadline: string;
  lawReferences: LawReference[];
}

/** Slim orchestrator output: only scoring + prioritized action plan */
export interface OrchestratorScoring {
  overallScore: number;
  scoreLevel: "red" | "yellow" | "green";
  scoreSummary: string;
  areaScores: { area: string; score: number; status: "critical" | "warning" | "ok" }[];
  actionPlan: {
    priority: number;
    title: string;
    description: string;
    area: string;
    riskLevel: "critical" | "important" | "recommended";
    timeEstimate: string;
    deadline: string;
  }[];
}

/** Full report: specialist areas merged with orchestrator scoring */
export interface OrchestratorOutput {
  overallScore: number;
  scoreLevel: "red" | "yellow" | "green";
  scoreSummary: string;
  areas: SpecialistAnalysis[];
  actionPlan: ActionItem[];
}

export interface VerifierModification {
  type:
    | "law_reference_corrected"
    | "risk_level_adjusted"
    | "issue_added"
    | "issue_removed"
    | "confidence_adjusted";
  description: string;
  area: string;
}

export interface VerifiedReport {
  report: OrchestratorOutput;
  qualityScore: number;
  modifications: VerifierModification[];
  warnings: string[];
}
