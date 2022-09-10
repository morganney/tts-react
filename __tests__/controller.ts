import { describe, expect } from '@jest/globals'

import { Controller } from '../src/controller'
import { SpeechSynthesisMock } from './speechSynthesis.mock'

describe('Controller', () => {
  it("wraps parts of the SpeechSynthesis and HTMLAudioElement API's", () => {
    const voice = SpeechSynthesisMock.getVoices()[0]
    const controller = new Controller({
      text: SpeechSynthesisMock.textForTest,
      lang: 'en-US',
      dispatchBoundaries: true,
      voice
    })

    controller.init()

    expect(SpeechSynthesisMock.getVoices).toHaveBeenCalled()
  })
})
