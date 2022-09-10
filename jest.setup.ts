import { beforeEach, afterEach, jest } from '@jest/globals'
import { SpeechSynthesisMock } from './__tests__/speechSynthesis.mock'
import { SpeechSynthesisUtteranceMock } from './__tests__/speechSynthesisUtterance.mock'
import '@testing-library/jest-dom'

beforeEach(() => {
  global.speechSynthesis = SpeechSynthesisMock
  global.SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock
})

afterEach(() => {
  jest.clearAllMocks()
})
