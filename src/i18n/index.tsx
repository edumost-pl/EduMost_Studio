import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_INTERFACE_LANGUAGE,
  type InterfaceLanguage,
} from '@/constants/language';
import { pl } from './locales/pl';
import { ua } from './locales/ua';
import type { I18nContextValue, TranslationKey, Translations } from './types';

const locales: Record<InterfaceLanguage, Translations> = { UA: ua, PL: pl };

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<InterfaceLanguage>(
    DEFAULT_INTERFACE_LANGUAGE,
  );

  useEffect(() => {
    window.edumost?.settings
      .get()
      .then((settings) => {
        if (settings?.interface_language === 'PL') {
          setLanguage('PL');
        }
      })
      .catch(() => {
        /* use default UA */
      });
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      interpolate(locales[language][key] ?? key, params),
    [language],
  );

  const value = useMemo(() => ({ language, t }), [language, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

/** Returns localized name from entity based on current UI language */
export function useLocalizedName(entity: {
  name_pl: string;
  name_ua: string;
}): string {
  const { language } = useI18n();
  return language === 'PL' ? entity.name_pl : entity.name_ua;
}

export function useLocalizedTitle(entity: {
  title_pl: string;
  title_ua: string;
}): string {
  const { language } = useI18n();
  return language === 'PL' ? entity.title_pl : entity.title_ua;
}
