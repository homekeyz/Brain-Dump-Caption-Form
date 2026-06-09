export interface CaptionStructure {
  hook: string;
  value: string;
  cta: string;
  fullFormattedText: string;
}

export interface CaptionAnalysis {
  hookStrength: string;
  whyItWorks: string;
  readabilityTips: string;
}

export interface StructuredCaptionResult {
  caption: CaptionStructure;
  analysis: CaptionAnalysis;
  alternativeHooks: string[];
  suggestedHashtags?: string[];
}

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  charLimit: number;
  hashtagDensity: 'none' | 'low' | 'moderate' | 'high';
}

export interface DraftItem {
  id: string;
  timestamp: string;
  brainDump: string;
  platform: string;
  tone: string;
  ctaText: string;
  result: StructuredCaptionResult;
}
