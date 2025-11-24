export enum AppView {
  GENERATOR = 'GENERATOR',
  BIBLE = 'BIBLE',
  STUDIO = 'STUDIO',
  RESEARCH = 'RESEARCH',
  CHAT = 'CHAT',
  ANALYZER = 'ANALYZER'
}

export interface ColorDefinition {
  hex: string;
  name: string;
  usage: string;
}

export interface TypographyDefinition {
  headerFont: string;
  bodyFont: string;
  reasoning: string;
}

export interface LogoConcept {
  title: string;
  description: string;
  primaryPrompt: string;
  secondaryPrompt: string;
}

export interface BrandVoice {
  tone: string;
  keywords: string[];
  copyExamples: {
    website: string;
    social: string;
  };
}

export interface BrandStrategy {
  brandName: string;
  tagline: string;
  brandVoice: BrandVoice;
  palette: ColorDefinition[];
  typography: TypographyDefinition;
  logoConcepts: LogoConcept[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  isError?: boolean;
}

export enum ImageAspectRatio {
  SQUARE = '1:1',
  PORTRAIT_2_3 = '2:3',
  LANDSCAPE_3_2 = '3:2',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9',
  CINEMATIC_21_9 = '21:9'
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}