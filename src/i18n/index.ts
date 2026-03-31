import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import enTranslations from './en.json';
import thTranslations from './th.json';

export type Language = 'en' | 'th';

type Translations = typeof enTranslations;

const translations: Record<Language, Translations> = {
    en: enTranslations,
    th: thTranslations,
};

interface I18nState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Internationalization store for FinnaFlow.
 * Supports English and Thai languages with localStorage persistence.
 */
export const useI18n = create<I18nState>()(
    persist(
        (set, get) => ({
            language: 'en',
            setLanguage: (lang: Language) => set({ language: lang }),
            t: (key: string, params?: Record<string, string | number>): string => {
                const lang = get().language;
                const keys = key.split('.');
                let result: unknown = translations[lang];

                for (const k of keys) {
                    if (result && typeof result === 'object' && k in result) {
                        result = (result as Record<string, unknown>)[k];
                    } else {
                        // Fallback to English if key not found
                        result = translations.en;
                        for (const ek of keys) {
                            if (result && typeof result === 'object' && ek in result) {
                                result = (result as Record<string, unknown>)[ek];
                            } else {
                                return key; // Return key if not found in any language
                            }
                        }
                        break;
                    }
                }

                let text = typeof result === 'string' ? result : key;
                
                // Replace parameters
                if (params) {
                    Object.entries(params).forEach(([k, v]) => {
                        text = text.replace(`{{${k}}}`, String(v));
                    });
                }

                return text;
            },
        }),
        {
            name: 'finnaflow-i18n',
        }
    )
);
