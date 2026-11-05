import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'aeira-lang';

const getInitialLang = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* التخزين غير متاح */
  }
  return 'en';
};

// دعم بسيط للجمع: {count, plural, one {item} other {items}}
const pluralPattern = /\{(\w+),\s*plural,\s*one\s*\{([^{}]*)\}\s*other\s*\{([^{}]*)\}\}/g;

const formatMessage = (template, vars, lang) => {
  let output = String(template).replace(pluralPattern, (_, name, one, other) => {
    const value = Number(vars?.[name] ?? 0);
    const rule = new Intl.PluralRules(lang).select(value);
    return rule === 'one' ? one : other;
  });

  output = output.replace(/\{(\w+)\}/g, (match, name) => (
    vars && vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : match
  ));

  return output;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(getInitialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* التخزين غير متاح */
    }
  }, [lang, dir]);

  const t = useCallback((key, vars) => {
    const dictionary = translations[lang] || translations.en;
    const template = dictionary[key] ?? translations.en[key] ?? key;
    return formatMessage(template, vars, lang);
  }, [lang]);

  const setLanguage = useCallback((next) => {
    if (next === 'ar' || next === 'en') setLang(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang((current) => (current === 'ar' ? 'en' : 'ar'));
  }, []);

  const value = useMemo(() => ({
    lang,
    isRtl: dir === 'rtl',
    dir,
    t,
    setLanguage,
    toggleLanguage,
  }), [lang, dir, t, setLanguage, toggleLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
