import { beforeEach, afterEach, jest } from '@jest/globals'
import { SpeechSynthesisMock } from './speechSynthesis.mock.js'
import { SpeechSynthesisUtteranceMock } from './speechSynthesisUtterance.mock.js'

beforeEach(() => {
  globalThis.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve())
  globalThis.HTMLMediaElement.prototype.pause = jest.fn()
  globalThis.HTMLMediaElement.prototype.load = jest.fn()
  globalThis.speechSynthesis = new SpeechSynthesisMock()
  globalThis.SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock

  jest.useFakeTimers()
})

afterEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})
