import { create } from 'zustand';
import { AppInstance, SubmissionInstance } from '@ai-app/shared';

interface AppStore {
  apps: AppInstance[];
  currentApp: AppInstance | null;
  editorJson: string;
  jsonError: string | null;
  validationWarnings: string[];
  theme: 'light' | 'dark';
  locale: 'en' | 'ta';
  submissions: SubmissionInstance[];
  isLoading: boolean;
  
  // Actions
  setApps: (apps: AppInstance[]) => void;
  setCurrentApp: (app: AppInstance | null) => void;
  setEditorJson: (json: string) => void;
  setJsonError: (error: string | null) => void;
  setValidationWarnings: (warnings: string[]) => void;
  toggleTheme: () => void;
  setLocale: (locale: 'en' | 'ta') => void;
  setSubmissions: (submissions: SubmissionInstance[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  apps: [],
  currentApp: null,
  editorJson: '',
  jsonError: null,
  validationWarnings: [],
  theme: 'dark', // Sleek dark mode by default
  locale: 'en',
  submissions: [],
  isLoading: false,

  setApps: (apps) => set({ apps }),
  setCurrentApp: (app) => set({
    currentApp: app,
    editorJson: app ? JSON.stringify(app.config, null, 2) : '',
    jsonError: null,
    validationWarnings: [],
  }),
  setEditorJson: (editorJson) => set({ editorJson }),
  setJsonError: (jsonError) => set({ jsonError }),
  setValidationWarnings: (validationWarnings) => set({ validationWarnings }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setLocale: (locale) => set({ locale }),
  setSubmissions: (submissions) => set({ submissions }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
