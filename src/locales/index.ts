import en from './en.json';
import es from './es.json';
import pt from './pt.json';
import zh from './zh.json';

export const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  zh: { translation: zh },
} as const;

export type TranslationKeys = typeof en;
