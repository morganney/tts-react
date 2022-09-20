import { beforeEach, afterEach, jest } from '@jest/globals'
import { SpeechSynthesisMock } from './__tests__/speechSynthesis.mock'
import { SpeechSynthesisUtteranceMock } from './__tests__/speechSynthesisUtterance.mock'
import '@testing-library/jest-dom'

beforeEach(() => {
  global.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve())
  global.HTMLMediaElement.prototype.pause = jest.fn()
  global.HTMLMediaElement.prototype.load = jest.fn()
  global.speechSynthesis = new SpeechSynthesisMock()
  global.SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock

  jest.useFakeTimers()
})

afterEach(async () => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})
