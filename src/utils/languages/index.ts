import { VIETNAMESE_KEYWORDS, VIETNAMESE_RESPONSES } from "./vietnamese";
import { ENGLISH_KEYWORDS, ENGLISH_RESPONSES } from "./english";

export const LANGUAGES = {
  VIETNAMESE: "vi",
  ENGLISH: "en",
} as const;

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export const LANGUAGE_RESOURCES = {
  [LANGUAGES.VIETNAMESE]: {
    keywords: VIETNAMESE_KEYWORDS,
    responses: VIETNAMESE_RESPONSES,
  },
  [LANGUAGES.ENGLISH]: {
    keywords: ENGLISH_KEYWORDS,
    responses: ENGLISH_RESPONSES,
  },
} as const;

export const LANGUAGE_FLAGS = {
  [LANGUAGES.VIETNAMESE]: "🇻🇳",
  [LANGUAGES.ENGLISH]: "🇬🇧",
} as const;
