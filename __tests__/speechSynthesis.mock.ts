import { SpeechSynthesisEventMock } from './speechSynthesisEvent.mock'

const wait = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))
class SpeechSynthesisMock {
  static #paused = false
  static #speaking = false
  static #pending = false
  static #utterance: SpeechSynthesisUtterance | null = null

  static get paused() {
    return this.#paused
  }
  static get speaking() {
    return this.#speaking
  }
  static get pending() {
    return this.#pending
  }
  static get utterance() {
    return this.#utterance
  }
  static get textForTest() {
    return 'This is only a test.'
  }

  static getVoices = jest
    .fn<SpeechSynthesisVoice[], []>()
    .mockReturnValue([
      { name: 'Alex', lang: 'en-US', default: true, localService: true, voiceURI: 'Alex' }
    ])
  static speak = jest.fn<void, [SpeechSynthesisUtterance]>(async (utterance) => {
    this.#utterance = utterance
    this.#speaking = true
    utterance.dispatchEvent(new SpeechSynthesisEventMock('start', { utterance }))
    await wait(5)
    utterance.dispatchEvent(
      new SpeechSynthesisEventMock('boundary', { utterance, charIndex: 0 })
    )
    await wait(5)
    utterance.dispatchEvent(
      new SpeechSynthesisEventMock('boundary', { utterance, charIndex: 5 })
    )
    await wait(5)
    utterance.dispatchEvent(
      new SpeechSynthesisEventMock('boundary', { utterance, charIndex: 8 })
    )
    await wait(5)
    utterance.dispatchEvent(
      new SpeechSynthesisEventMock('boundary', { utterance, charIndex: 13 })
    )
    await wait(5)
    utterance.dispatchEvent(
      new SpeechSynthesisEventMock('boundary', { utterance, charIndex: 15 })
    )
    await wait(5)
    utterance.dispatchEvent(new SpeechSynthesisEventMock('end', { utterance }))
    await wait(5)
    this.#speaking = false
    this.#utterance = null
  })
  static onvoiceschanged = jest.fn()
  static cancel = jest.fn()
  static pause = jest.fn<void, []>(() => {
    this.#paused = true
    this.#utterance?.dispatchEvent(
      new SpeechSynthesisEventMock('pause', { utterance: this.#utterance })
    )
  })
  static resume = jest.fn<void, []>(() => {
    this.#paused = false
    this.#utterance?.dispatchEvent(
      new SpeechSynthesisEventMock('resume', { utterance: this.#utterance })
    )
  })
  static removeEventListener = jest.fn()
  static addEventListener = jest.fn()
  static dispatchEvent = jest.fn()
}

export { SpeechSynthesisMock }
