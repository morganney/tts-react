class SpeechSynthesisEventMock extends Event {
  #charIndex?: number
  #utterance: SpeechSynthesisUtterance

  constructor(type: string, init: SpeechSynthesisEventInit) {
    super(type)

    this.#utterance = init.utterance
    this.#charIndex = init.charIndex
  }

  get charIndex() {
    return this.#charIndex
  }

  get utterance() {
    return this.#utterance
  }
}

export { SpeechSynthesisEventMock }
