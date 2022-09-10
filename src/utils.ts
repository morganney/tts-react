import type { ReactNode } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum LangCodes {
  ARABIC_SAUDI_ARABIA = 'ar-SA',
  CZECH_CZECH_REPUBLIC = 'cs-CZ',
  DANISH_DENMARK = 'da-DK',
  GERMAN_GERMANY = 'de-DE',
  MODERN_GREEK_GREECE = 'el-GR',
  ENGLISH_AUSTRALIA = 'en-AU',
  ENGLISH_UNITED_KINGDOM = 'en-GB',
  ENGLISH_IRELAND = 'en-IE',
  ENGLISH_UNITED_STATES = 'en-US',
  ENGLISH_SOUTH_AFRICA = 'en-ZA',
  SPANISH_SPAIN = 'es-ES',
  SPANISH_MEXICO = 'es-MX',
  FINNISH_FINLAND = 'fi-FI',
  FRENCH_CANADA = 'fr-CA',
  FRENCH_FRANCE = 'fr-FR',
  HEBREW_ISRAEIL = 'he-IL',
  HINDI_INDIA = 'hi-IN',
  HUNGARIAN_HUNGARY = 'hu-HU',
  INDONESIAN_INDONESIA = 'id-ID',
  ITALIAN_ITALY = 'it-IT',
  JAPANESE_JAPAN = 'ja-JP',
  KOREAN_REPUBLIC_OF_KOREA = 'ko-KR',
  DUTCH_BELGIUM = 'nl-BE',
  DUTCH_NETHERLANDS = 'nl-NL',
  NORWEGIAN_NORWAY = 'no-NO',
  POLISH_POLAND = 'pl-PL',
  PORTUGUESE_BRAZIL = 'pt-BR',
  PORTUGUESE_PORTUGAL = 'pt-PT',
  ROMANIAN_ROMANIA = 'ro-RO',
  RUSSIAN_RUSSIAN_FEDERATION = 'ru-RU',
  SLOVAK_SLOVAKIA = 'sk-SK',
  SWEDISH_SWEDEN = 'sv-SE',
  THAI_THAILAND = 'th-TH',
  TURKISH_TURKEY = 'tr-TR',
  CHINESE_CHINA = 'zh-CN',
  CHINESE_HONG_KONG = 'zh-HK',
  CHINESE_TAIWAN = 'zh-TW'
}

const punctuationRgx = /[^\P{P}'/-]+/gu
const isStringOrNumber = (value: ReactNode): boolean => {
  return typeof value === 'string' || typeof value === 'number'
}
const stripPunctuation = (text: string): string => {
  return text.replace(punctuationRgx, '')
}
const isPunctuation = (text: string): boolean => {
  const trimmed = text.trim()

  return punctuationRgx.test(trimmed) && trimmed.length === 1
}

export { isStringOrNumber, stripPunctuation, isPunctuation, punctuationRgx, LangCodes }
