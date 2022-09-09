// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum LangCode {
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
interface SpeechSynthesisEventListener {
  (evt: SpeechSynthesisEvent): void
}

class SpeechSynthesisUtteranceMock extends EventTarget {
  #text = ''
  #lang = ''
  #rate = 1
  #pitch = 1
  #volume = 1
  #voice: SpeechSynthesisVoice | null = null
  #onboundary: SpeechSynthesisEventListener | null = null
  #onend: SpeechSynthesisEventListener | null = null
  #onerror: SpeechSynthesisEventListener | null = null
  #onmark: SpeechSynthesisEventListener | null = null
  #onpause: SpeechSynthesisEventListener | null = null
  #onresume: SpeechSynthesisEventListener | null = null
  #onstart: SpeechSynthesisEventListener | null = null

  constructor(text?: string) {
    super()

    this.#text = text?.toString() ?? ''
  }

  get onstart() {
    return this.#onstart
  }

  set onstart(listener: SpeechSynthesisEventListener | null) {
    this.#onstart = listener ?? null
  }

  get onresume() {
    return this.#onresume
  }

  set onresume(listener: SpeechSynthesisEventListener | null) {
    this.#onresume = listener ?? null
  }

  get onpause() {
    return this.#onpause
  }

  set onpause(listener: SpeechSynthesisEventListener | null) {
    this.#onpause = listener ?? null
  }

  get onmark() {
    return this.#onmark
  }

  set onmark(listener: SpeechSynthesisEventListener | null) {
    this.#onmark = listener ?? null
  }

  get onenrror() {
    return this.#onerror
  }

  set onerror(listener: SpeechSynthesisEventListener | null) {
    this.#onerror = listener ?? null
  }

  get onend() {
    return this.#onend
  }

  set onend(listener: SpeechSynthesisEventListener | null) {
    this.#onend = listener ?? null
  }

  get onboundary() {
    return this.#onboundary
  }

  set onboundary(listener: SpeechSynthesisEventListener | null) {
    this.#onboundary = listener ?? null
  }

  get volume() {
    return this.#volume
  }

  set volume(value: number) {
    this.#volume = value
  }

  get pitch() {
    return this.#pitch
  }

  set pitch(value: number) {
    this.#pitch = value
  }

  get rate() {
    return this.#rate
  }

  set rate(value: number) {
    this.#rate = value
  }

  get voice() {
    return this.#voice
  }

  set voice(value: SpeechSynthesisVoice | null) {
    this.#voice = value ?? null
  }

  get lang() {
    return this.#lang
  }

  set lang(value: string) {
    this.#lang = value.toString()
  }

  get text() {
    return this.#text
  }

  set text(text: string) {
    this.#text = text.toString()
  }
}

export { SpeechSynthesisUtteranceMock }
