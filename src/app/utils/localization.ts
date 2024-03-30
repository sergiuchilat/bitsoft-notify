import { Language } from '@/app/enum/language.enum';

export function setLanguage(language: Language): Language {
  if (!language) {
    return Language.en;
  }

  if (language === Language.en) {
    return Language.en;
  }

  if (language === Language.ro) {
    return Language.ro;
  }

  if (language === Language.ru) {
    return Language.ru;
  }

  return Language.en;
}
