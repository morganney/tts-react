import { SpeechSynthesisEventMock } from './speechSynthesisEvent.mock'

interface SpeechSynthesisUtteranceEntry {
  utterance: SpeechSynthesisUtterance
  words: string[]
}

class SpeechSynthesisMock extends EventTarget {
  #paused = false
  #speaking = false
  #pending = false
  #utterances: SpeechSynthesisUtteranceEntry[] = []
  #abortController: AbortController = new AbortController()

  get paused() {
    return this.#paused
  }
  get speaking() {
    return this.#speaking
  }
  get pending() {
    return this.#pending
  }

  static get wordBoundaryDelayMs() {
    return 100
  }

  get utterances() {
    return this.#utterances
  }

  static get textForTest() {
    return 'This is only a test.'
  }

  static getWords = (text: string) => text.replace(/\s+/g, ' ').split(' ')

  #wait = (delay: number = SpeechSynthesisMock.wordBoundaryDelayMs) =>
    new Promise((resolve) => setTimeout(resolve, delay))

  #speak = async (entry: SpeechSynthesisUtteranceEntry) => {
    const { utterance, words } = entry
    const text = utterance.text
    let word = words.shift()

    this.#abortController.signal.onabort = () => {
      this.#utterances.unshift({ utterance: entry.utterance, words: [...words] })
      this.#speaking = false
    }

    this.#speaking = true
    utterance.dispatchEvent(new SpeechSynthesisEventMock('start', { utterance }))

    while (word) {
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
    utterance.dispatchEvent(new SpeechSynthesisEventMock('end', { utterance }))
    this.#speaking = false
    this.#abortController.signal.onabort = null
  }

  speak = jest.fn<void, [SpeechSynthesisUtterance]>(async (utterance) => {
    const words = SpeechSynthesisMock.getWords(utterance.text)
    const current = { utterance, words }

    if (this.#paused || this.#utterances.length) {
      this.#utterances.push(current)
    }

    if (!this.#paused) {
      this.#speak(this.#utterances.shift() ?? current)
    }
  })

  cancel = jest.fn<void, []>(() => {
    const entry = this.#utterances[0]

    if (entry) {
      entry.utterance.dispatchEvent(
        new SpeechSynthesisEventMock('end', { utterance: entry.utterance })
      )
    }

    if (this.#speaking && this.#abortController) {
      this.#abortController.abort()
    }

    this.#speaking = false
    this.#utterances = []
  })

  pause = jest.fn<void, []>(() => {
    const entry = this.#utterances[0]

    this.#paused = true

    if (entry) {
      entry.utterance.dispatchEvent(
        new SpeechSynthesisEventMock('pause', { utterance: entry.utterance })
      )
    }

    if (this.#abortController) {
      this.#abortController.abort()
    }
  })

  resume = jest.fn<void, []>(() => {
    const entry = this.#utterances[0]

    this.#paused = false

    if (entry) {
      const numWords = SpeechSynthesisMock.getWords(entry.utterance.text).length
      const numWordsLeft = entry.words.length

      entry.utterance.dispatchEvent(
        new SpeechSynthesisEventMock(numWordsLeft === numWords ? 'start' : 'resume', {
          utterance: entry.utterance
        })
      )
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
