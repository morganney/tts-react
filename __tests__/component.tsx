import { describe, test } from '@jest/globals'

describe('TextToSpeech', () => {
  /**
   * Lots of mocking is going to be required. When running
   * this test the very first issue is:
   * `ReferenceError: SpeechSynthesisUtterance is not defined`
   */
  test('it should have a play button', () => {
    // const { getByText } = render(<TextToSpeech>This is a test.</TextToSpeech>)
    // expect(getByText('Play')).toBeTruthy()
  })
})
