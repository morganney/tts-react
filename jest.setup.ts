import { beforeEach, afterEach, jest } from '@jest/globals'
import { SpeechSynthesisMock } from './packages/tts-react/__tests__/speechSynthesis.mock.js'
import { SpeechSynthesisUtteranceMock } from './packages/tts-react/__tests__/speechSynthesisUtterance.mock.js'
import '@testing-library/jest-dom'

beforeEach(() => {
  global.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve())
  global.HTMLMediaElement.prototype.pause = jest.fn()
  global.HTMLMediaElement.prototype.load = jest.fn()
  global.speechSynthesis = new SpeechSynthesisMock()
  global.SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock

  jest.useFakeTimers()
})

afterEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})
