class SpeechSynthesisMock extends EventTarget {
  #paused = false
  #pending = false
  #speaking = false
  #onvoiceschanged = null

  constructor() {
    super()
  }

  get onvoiceschanged() {
    return this.#onvoiceschanged
  }

  get paused() {
    return this.#paused
  }

  get pending() {
    return this.#pending
  }

  get speaking() {
    return this.#speaking
  }

  cancel(): void {}
  getVoices(): SpeechSynthesisVoice[] {
    return [
      { name: 'Alex', lang: 'en-US', default: true, localService: true, voiceURI: 'Alex' }
    ]
  }
  pause(): void {}
  resume(): void {}
  speak(): void {}
}

export { SpeechSynthesisMock }
