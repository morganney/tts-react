import { describe, expect } from '@jest/globals'

import { Controller, Events } from '../src/controller'
import { SpeechSynthesisMock } from './speechSynthesis.mock'
import type { TTSAudioData } from '../src/controller'

describe('Controller', () => {
  const fetchAudioDataResponse: TTSAudioData = {
    audio: 'data:audio/mpeg;base64,',
    marks: [
      {
        time: 0,
        type: 'word',
        start: 0,
        end: 4,
        value: 'This'
      },
      {
        time: 100,
        type: 'word',
        start: 5,
        end: 7,
        value: 'is'
      },
      {
        time: 200,
        type: 'word',
        start: 8,
        end: 12,
        value: 'only'
      },
      {
        time: 300,
        type: 'word',
        start: 13,
        end: 14,
        value: 'a'
      },
      {
        time: 400,
        type: 'word',
        start: 15,
        end: 19,
        value: 'test'
      }
    ]
  }

  it("wraps parts of the SpeechSynthesis and HTMLAudioElement API's", async () => {
    const voice = global.speechSynthesis.getVoices()[0]
    const controller = new Controller({
      lang: 'en-US',
      dispatchBoundaries: true,
      voice
    })

    if (global.speechSynthesis.onvoiceschanged) {
      global.speechSynthesis.onvoiceschanged(new Event('voiceschanged'))
    }

    controller.spokenText = SpeechSynthesisMock.textForTest
    await controller.init()

    expect(controller.lang).toBe('en-US')
    expect(controller.rate).toBe(1)
    expect(controller.volume).toBe(1)
    expect(controller.pitch).toBe(1)
    expect(controller.preservesPitch).toBe(false)
    expect(controller.paused).toBe(false)
    controller.play()
    expect(global.speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: SpeechSynthesisMock.textForTest })
    )
    controller.pause()
    expect(global.speechSynthesis.pause).toHaveBeenCalled()
    controller.resume()
    expect(global.speechSynthesis.resume).toHaveBeenCalled()
    controller.clear()
    expect(global.speechSynthesis.cancel).toHaveBeenCalled()
    controller.play()
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(2)
    controller.mute()
    expect(global.speechSynthesis.resume).toHaveBeenCalledTimes(2)
    expect(global.speechSynthesis.cancel).toHaveBeenCalledTimes(2)
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(3)
    controller.unmute(0.5)
    expect(controller.volume).toBe(0.5)
    expect(global.speechSynthesis.resume).toHaveBeenCalledTimes(3)
    expect(global.speechSynthesis.cancel).toHaveBeenCalledTimes(3)
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(4)
    controller.reset()
    expect(global.speechSynthesis.resume).toHaveBeenCalledTimes(4)
    expect(global.speechSynthesis.cancel).toHaveBeenCalledTimes(4)
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(5)
  })

  it('wraps the HTMLAudioElement API when passed fetchAudioData', async () => {
    const fetchAudioData = jest.fn<Promise<TTSAudioData>, [string]>(() =>
      Promise.resolve(fetchAudioDataResponse)
    )
    const controller = new Controller({
      fetchAudioData,
      dispatchBoundaries: true
    })
    const synth = controller.synth as HTMLAudioElement

    global.HTMLMediaElement.prototype.play = jest.fn(async () => {
      // Fire a 'timeupdate' event to trigger word boundaries
      synth.dispatchEvent(new Event('timeupdate'))
    })

    controller.spokenText = SpeechSynthesisMock.textForTest
    // Wait for the fetchAudioData promise to resolve
    await controller.init()

    /**
     * The 'play' event for HTMLMediaElement toggles 'paused' from 'true' to 'false'.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play_event
     *
     * Mock it to return 'true' once so that a boundary event can be dispatched
     * during controller.play().
     */
    jest.spyOn(controller, 'paused', 'get').mockImplementationOnce(() => false)
    await controller.play()
    expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalled()

    controller.pause()
    expect(global.HTMLMediaElement.prototype.pause).toHaveBeenCalled()
    controller.resume()
    expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2)
    controller.reset()
    expect(global.HTMLMediaElement.prototype.load).toHaveBeenCalled()
    expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(3)
    controller.clear()
    expect(global.HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(2)
    expect(synth.currentTime).toBe(0)

    // Check that the rate getter/setter abstracts playbackRate
    expect(controller.rate).toBe(1)
    controller.rate = 2
    expect(controller.rate).toBe(2)

    // Check preservesPitch
    controller.preservesPitch = false
    expect(controller.preservesPitch).toBe(false)

    // Check that pitch doesn't apply
    expect(controller.pitch).toBe(-1)
  })

  it('catches and dispatches fetchAudioData, play, and event errors', async () => {
    const fetchAudioData = jest.fn<Promise<TTSAudioData>, [string]>(() =>
      Promise.reject(new Error())
    )
    const controller = new Controller({
      fetchAudioData
    })
    // No distinction between synthesizer and target when using fetchAudioData
    const synth = controller.utter as HTMLAudioElement
    const onControllerError = jest.fn()

    controller.spokenText = SpeechSynthesisMock.textForTest
    controller.addEventListener(Events.ERROR, onControllerError)

    await controller.init()
    expect(synth.src).toBe('')
    expect(onControllerError).toHaveBeenCalled()

    global.HTMLMediaElement.prototype.play = jest
      .fn()
      .mockImplementationOnce(() => Promise.reject(new Error()))
    await controller.play()
    expect(onControllerError).toHaveBeenCalledTimes(2)

    synth.dispatchEvent(new Event('error'))
    expect(onControllerError).toHaveBeenCalledTimes(3)
  })

  it('dispatches pause events when calling pause on an utterance', async () => {
    const onPaused = jest.fn()
    const controller = new Controller()

    controller.spokenText = SpeechSynthesisMock.textForTest
    controller.addEventListener(Events.PAUSED, onPaused)

    await controller.init()

    controller.utter.dispatchEvent(new Event('pause'))
    expect(onPaused).toHaveBeenCalled()
  })
})
