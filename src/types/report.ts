export type ScoreLevel = 'red' | 'yellow' | 'green';
export type RiskLevel = 'critical' | 'important' | 'recommended';

export interface LawReference {
  law: string;
  paragraph: string;
  description: string;
  url: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ReportIssue {
  title: string;
  risk: RiskLevel;
  description: string;
  lawReferences: LawReference[];
  action: string;
  /** From multi-agent pipeline; medium/low show verification badges */
  confidence?: ConfidenceLevel;
}

export interface ReportArea {
  name: string;
  score: ScoreLevel;
  status: string;
  issues: ReportIssue[];
}

export interface ActionItem {
  priority: number;
  title: string;
  deadlineRecommendation: string;
  estimatedTime: string;
}

export interface HealthCheckReport {
  overallScore: ScoreLevel;
  scoreExplanation: string;
  areas: ReportArea[];
  actionPlan: ActionItem[];
  generatedAt: string;
  disclaimer: string;
}
