class SpeechSynthesisUtteranceMock extends EventTarget {
  #text = ''
  #lang = 'en-US'
  #rate = 1
  #pitch = 1
  #volume = 1
  #voice: SpeechSynthesisVoice | null = null

  constructor(text?: string) {
    super()

    this.#text = text ?? ''
  }

  get text() {
    return this.#text
  }
  set text(text: string) {
    this.#text = text
  }
  get lang() {
    return this.#lang
  }
  set lang(lang: string) {
    this.#lang = lang
  }
  get pitch() {
    return this.#pitch
  }
  set pitch(pitch: number) {
    this.#pitch = pitch
  }
  get rate() {
    return this.#rate
  }
  set rate(rate: number) {
    this.#rate = rate
  }
  get volume() {
    return this.#volume
  }
  set volume(volume: number) {
    this.#volume = volume
  }
  get voice() {
    return this.#voice
  }
  set voice(value: SpeechSynthesisVoice | null) {
    this.#voice = value
  }

  onboundary = jest.fn<void, [SpeechSynthesisEvent]>()
  onend = jest.fn<void, [SpeechSynthesisEvent]>()
  onerror = jest.fn<void, [SpeechSynthesisEvent]>()
  onmark = jest.fn<void, [SpeechSynthesisEvent]>()
  onpause = jest.fn<void, [SpeechSynthesisEvent]>()
  onresume = jest.fn<void, [SpeechSynthesisEvent]>()
  onstart = jest.fn<void, [SpeechSynthesisEvent]>()
}

export { SpeechSynthesisUtteranceMock }
