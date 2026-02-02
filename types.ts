
export type AppTheme = 'standard' | 'amoled' | 'mondriaan';

export interface BabyProfile {
  name: string;
  birthDate: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AgendaEvent {
  week: number;
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
}

export interface AIResponse {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
}

export interface UserSettings {
  theme: AppTheme;
  apiKey: string;
  preferredModel: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
}
