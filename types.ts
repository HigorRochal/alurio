
export enum UserPlan {
  BASE = 'BASE',
  PRO = 'PRO'
}

export interface UserProfile {
  name: string;
  email: string;
  plan: UserPlan;
  niche: string;
  objective: string;
  tone: string;
  onboardingCompleted: boolean;
}

export enum ContentType {
  SCRIPT = 'SCRIPT',
  POST = 'POST'
}

export enum ContentStatus {
  DRAFT = 'Rascunho',
  READY = 'Pronto',
  PUBLISHED = 'Publicado'
}

export interface ThemeSuggestion {
  title: string;
  reasoning: string;
}

export interface ScriptSegment {
  text: string;
  action: string;
}

export interface ScriptContent {
  id: string;
  title: string;
  hook: ScriptSegment;
  development: ScriptSegment[];
  cta: ScriptSegment;
  tips: string[];
  reachTips: string[];
  nextThemes: ThemeSuggestion[];
  duration: number;
  length: 'Curto' | 'Médio' | 'Longo';
  status: ContentStatus;
  isUsed: boolean;
  createdAt: string;
}

export interface PostSlide {
  slideNumber: number;
  text: string;
  visualAdvice: string;
}

export interface PostContent {
  id: string;
  title: string;
  imageUrl?: string; // Imagem principal ou primeira do carrossel
  imageUrls?: string[]; // Lista de imagens se for carrossel
  isCarousel?: boolean;
  slides?: PostSlide[];
  caption: string;
  hashtags: string[];
  musicSuggestions: string[];
  nextImageTips: string[];
  status: ContentStatus;
  isUsed: boolean;
  createdAt: string;
}

export type LibraryItem = (ScriptContent & { type: ContentType.SCRIPT }) | (PostContent & { type: ContentType.POST });
