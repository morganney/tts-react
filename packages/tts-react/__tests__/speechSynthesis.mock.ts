import { SpeechSynthesisEventMock } from './speechSynthesisEvent.mock.js'
import { SpeechSynthesisErrorEventMock } from './speechSynthesisErrorEvent.mock.js'

interface SpeechSynthesisUtteranceEntry {
  utterance: SpeechSynthesisUtterance
  words: string[]
}

class SpeechSynthesisMock extends EventTarget {
  static #triggerError = false

  #paused = false
  #speaking = false
  #pending = false
  #utterances: SpeechSynthesisUtteranceEntry[] = []

  static get wordBoundaryDelayMs() {
    return 100
  }

  static get textForTest() {
    return 'This is only a test.'
  }

  static set triggerError(value: boolean) {
    this.#triggerError = value
  }

  static get triggerError() {
    return this.#triggerError
  }

  static getWords = (text: string) => text.replace(/\s+/g, ' ').split(' ')

  get paused() {
    return this.#paused
  }

  get speaking() {
    return this.#speaking
  }

  get pending() {
    return this.#pending
  }

  get utterances() {
    return this.#utterances
  }

  #wait = (delay: number = SpeechSynthesisMock.wordBoundaryDelayMs) =>
    new Promise((resolve) => setTimeout(resolve, delay))

  #speak = async (entry: SpeechSynthesisUtteranceEntry) => {
    const { utterance, words } = entry
    const text = utterance.text
    const eventType =
      words.length < SpeechSynthesisMock.getWords(utterance.text).length
        ? 'resume'
        : 'start'
    let word = words.shift()

    this.#speaking = true
    utterance.dispatchEvent(new SpeechSynthesisEventMock(eventType, { utterance }))

    if (SpeechSynthesisMock.triggerError) {
      utterance.dispatchEvent(new SpeechSynthesisErrorEventMock('error', { utterance }))
      SpeechSynthesisMock.triggerError = false
    }

    while (word && !this.#paused && this.#speaking) {
      await this.#wait()
      utterance.dispatchEvent(
        new SpeechSynthesisEventMock('boundary', {
          utterance,
          charIndex: text.lastIndexOf(word)
        })
      )
      word = words.shift()
    }

    await this.#wait()

    if (this.#paused) {
      const remaining = word ? [word, ...words] : [...words]

      if (remaining.length) {
        this.#utterances.unshift({ utterance: entry.utterance, words: remaining })
        utterance.dispatchEvent(new SpeechSynthesisEventMock('pause', { utterance }))
      }
    } else {
      this.#speaking = false
      utterance.dispatchEvent(new SpeechSynthesisEventMock('end', { utterance }))
    }
  }

  speak = jest.fn<Promise<void>, [SpeechSynthesisUtterance]>(async (utterance) => {
    const words = SpeechSynthesisMock.getWords(utterance.text)
    const current = { utterance, words }

    if (this.#paused || this.#utterances.length) {
      this.#utterances.push(current)
      this.#pending = true
    }

    if (!this.#paused) {
      const speakit = this.#utterances.shift() ?? current

      if (!this.#utterances.length) {
        this.#pending = false
      }

      await this.#speak(speakit)
    }
  })

  cancel = jest.fn<void, []>(() => {
    this.#speaking = false
    this.#utterances = []
  })

  pause = jest.fn<void, []>(() => {
    if (!this.#paused) {
      this.#paused = true
    }
  })

  resume = jest.fn<Promise<void>, []>(async () => {
    if (this.#paused) {
      this.#paused = false

      if (this.#speaking) {
        const entry = this.#utterances.shift()

        if (entry) {
          await this.speak(entry.utterance)
        }
      }
    }
  })

  getVoices = jest
    .fn<SpeechSynthesisVoice[], []>()
    .mockReturnValue([
      { name: 'Alex', lang: 'en-US', default: true, localService: true, voiceURI: 'Alex' }
    ])

  onvoiceschanged = null
}

export { SpeechSynthesisMock }
