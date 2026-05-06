
export interface SpongeRecommendation {
  productName: string;
  shape: string;
  material: string;
  reason: string;
  imageUrl: string;
}

export enum SkinType {
  DRY = 'Dry',
  OILY = 'Oily',
  COMBINATION = 'Combination',
  NORMAL = 'Normal',
  SENSITIVE = 'Sensitive'
}

export enum FinishType {
  DEWY = 'Dewy',
  MATTE = 'Matte',
  NATURAL = 'Natural'
}

export interface QuizState {
  skinType: SkinType | null;
  finish: FinishType | null;
  formula: string | null;
  concern: string | null;
}

export interface SubscriptionStatus {
  active: boolean;
  startDate?: string;
  nextShipmentDate?: string;
  plan: string;
}

export interface DiagnosticReport {
  overallScore: number;
  dimensions: {
    blendability: number;
    evenness: number;
    naturalism: number;
    detailWork: number;
  };
  advice: string;
}
