import { describe, test, jest, beforeEach } from '@jest/globals'
import { renderHook, act, waitFor } from '@testing-library/react'

import { SpeechSynthesisMock } from './speechSynthesis.mock.js'
import { SpeechSynthesisEventMock } from './speechSynthesisEvent.mock.js'
import { useTts } from '../src/hook.js'
import { stripPunctuation } from '../src/utils.js'
import './setup.js'

describe('useTts', () => {
  let words: string[] = []

  const defaultState = {
    voices: [
      {
        name: 'Alex',
        lang: 'en-US',
        default: true,
        localService: true,
        voiceURI: 'Alex'
      }
    ],
    boundary: { word: '', startChar: 0, endChar: 0 },
    isPlaying: false,
    isPaused: false,
    isMuted: false,
    isError: false,
    isReady: true
  }
  const advanceBy = async (steps: number) => {
    for (let i = 0; i < steps; i++) {
      await act(async () => {
        jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
      })
    }
  }

  beforeEach(() => {
    words = SpeechSynthesisMock.getWords(SpeechSynthesisMock.textForTest)
  })

  test('it converts text-to-speech from children text and updates state on word boundaries', async () => {
    const onStart = jest.fn()
    const onEnd = jest.fn()
    const onBoundary = jest.fn()
    const { result } = renderHook(
      ({ children, markTextAsSpoken, onStart, onEnd, onBoundary, rate, volume }) =>
        useTts({ children, markTextAsSpoken, onStart, onEnd, onBoundary, rate, volume }),
      {
        initialProps: {
          onStart,
          onEnd,
          onBoundary,
          rate: 0.4,
          volume: 0.5,
          markTextAsSpoken: true,
          children: <p>{SpeechSynthesisMock.textForTest}</p>
        }
      }
    )
    let word = words.shift()

    // Check default state
    expect(result.current.state).toStrictEqual(defaultState)

    // Check that voices get updated
    await act(async () => {
      global.speechSynthesis.dispatchEvent(new Event('voiceschanged'))
    })
    expect(global.speechSynthesis.getVoices).toHaveBeenCalled()

    // Start coverting text to speech
    await act(async () => {
      await result.current.play()
    })
    expect(onStart).toHaveBeenCalled()
    expect(result.current.state.isPlaying).toBe(true)
    expect(result.current.get.rate()).toBe(0.4)
    expect(result.current.get.volume()).toBe(0.5)
    expect(global.speechSynthesis.speak).toHaveBeenCalled()

    // Check firing of word boundaries and state boundary updates
    while (word) {
      await act(async () => {
        jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
      })
      expect(result.current.state.boundary.word).toBe(stripPunctuation(word))
      expect(onBoundary).toHaveBeenLastCalledWith(
        expect.objectContaining({
          word: stripPunctuation(word)
        }),
        expect.any(SpeechSynthesisEventMock)
      )
      word = words.shift()
    }

    // Wait for firing of 'end' event on utterance
    await act(async () => {
      jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
    })
    expect(result.current.state.isPlaying).toBe(false)
    expect(onEnd).toHaveBeenCalled()
  })

  it('allows pausing, resuming and stopping of spoken text', async () => {
    const onPause = jest.fn()
    const { result } = renderHook(
      ({ children, onPause }) => useTts({ children, onPause }),
      {
        initialProps: {
          onPause,
          children: SpeechSynthesisMock.textForTest
        }
      }
    )

    // Check default state and play
    expect(result.current.state).toStrictEqual(defaultState)
    await act(async () => {
      await result.current.play()
    })
    expect(result.current.state.isPlaying).toBe(true)
    expect(global.speechSynthesis.speak).toHaveBeenCalled()

    await advanceBy(1)
    expect(result.current.state.boundary.word).toBe(words[0])

    // Now pause
    await act(async () => {
      result.current.pause()
    })
    //expect(onPause).toHaveBeenCalled() TODO: Better mocking?
    expect(global.speechSynthesis.pause).toHaveBeenCalled()
    expect(global.speechSynthesis.speaking).toBe(true)
    expect(result.current.state.isPaused).toBe(true)
    expect(result.current.state.isPlaying).toBe(false)

    // Now resume playing
    await act(async () => {
      await result.current.play()
    })
    await advanceBy(1)
    expect(global.speechSynthesis.resume).toHaveBeenCalled()
    expect(global.speechSynthesis.cancel).toHaveBeenCalled()
    expect(result.current.state.isPaused).toBe(false)
    expect(result.current.state.isPlaying).toBe(true)
    expect(result.current.state.boundary.word).toBe(words[1])

    // Now stop
    await act(async () => {
      result.current.stop()
    })
    expect(global.speechSynthesis.cancel).toHaveBeenCalled()
    expect(result.current.state.isPaused).toBe(false)
    expect(result.current.state.isPlaying).toBe(false)
  })

  it('returns a handler for toggling mute, and reset(replay)ing the spoken text', async () => {
    const onMutedCallback = jest.fn()
    const { result } = renderHook(({ children }) => useTts({ children }), {
      initialProps: {
        children: SpeechSynthesisMock.textForTest
      }
    })

    // Check default state
    expect(result.current.state).toStrictEqual(defaultState)

    // Now activate mute
    await act(async () => {
      await result.current.toggleMute(onMutedCallback)
    })
    expect(result.current.state.isMuted).toBe(true)
    expect(onMutedCallback).toHaveBeenCalledWith(false)

    // Now activate unmute
    await act(async () => {
      await result.current.toggleMute(onMutedCallback)
    })
    expect(result.current.state.isMuted).toBe(false)
    expect(onMutedCallback).toHaveBeenLastCalledWith(true)

    // Now play
    await act(async () => {
      await result.current.play()
    })
    expect(global.speechSynthesis.cancel).toHaveBeenCalled()
    expect(global.speechSynthesis.resume).toHaveBeenCalled()
    expect(global.speechSynthesis.speak).toHaveBeenCalled()
    expect(result.current.state.isPlaying).toBe(true)

    // Now mute while playing against a SpeechSynthesis instance of the backing controller
    await act(async () => {
      await result.current.toggleMute(onMutedCallback)
    })
    expect(result.current.state.isMuted).toBe(true)
    expect(onMutedCallback).toHaveBeenLastCalledWith(false)
    // Check that the syntehsizer resumed, cancelled, and then started speaking again (effectively a replay).
    expect(global.speechSynthesis.resume).toHaveBeenCalledTimes(2)
    expect(global.speechSynthesis.cancel).toHaveBeenCalledTimes(2)
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(2)
    expect(result.current.state.isPlaying).toBe(true)

    // Now Pause
    await act(async () => {
      result.current.pause()
    })
    expect(result.current.state.isPaused).toBe(true)
    expect(result.current.state.isPlaying).toBe(false)

    // Now replay
    await act(async () => {
      await result.current.replay()
    })
    expect(result.current.state.isPaused).toBe(false)
    expect(global.speechSynthesis.resume).toHaveBeenCalledTimes(3)
    expect(global.speechSynthesis.cancel).toHaveBeenCalledTimes(3)
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(3)
    expect(result.current.state.isPlaying).toBe(true)
  })

  it('returns getters/setters for speaking attributes, and callbacks when they change', async () => {
    const onVolumeChange = jest.fn()
    const onPitchChange = jest.fn()
    const onRateChange = jest.fn()
    const { result } = renderHook(
      ({ children, onRateChange, onPitchChange, onVolumeChange }) =>
        useTts({ children, onRateChange, onPitchChange, onVolumeChange }),
      {
        initialProps: {
          onRateChange,
          onPitchChange,
          onVolumeChange,
          children: SpeechSynthesisMock.textForTest
        }
      }
    )

    expect(result.current.state).toStrictEqual(defaultState)

    expect(result.current.get.lang()).toBe('')
    result.current.set.lang('en-US')
    expect(result.current.get.lang()).toBe('en-US')

    expect(result.current.get.rate()).toBe(1)
    result.current.set.rate(2)
    expect(result.current.get.rate()).toBe(2)
    expect(onRateChange).toHaveBeenCalledWith(2)

    expect(result.current.get.pitch()).toBe(1)
    result.current.set.pitch(0.5)
    expect(result.current.get.pitch()).toBe(0.5)
    expect(onPitchChange).toHaveBeenCalledWith(0.5)

    expect(result.current.get.volume()).toBe(1)
    await act(async () => {
      result.current.set.volume(0)
    })
    expect(result.current.state.isMuted).toBe(true)
    expect(result.current.get.volume()).toBe(0)
    expect(onVolumeChange).toHaveBeenCalledWith(0)
    await act(async () => {
      result.current.set.volume(0.5)
    })
    expect(result.current.state.isMuted).toBe(false)
    expect(onVolumeChange).toHaveBeenCalledWith(0.5)

    // SpeechSynthesis does not support preservesPitch
    expect(result.current.get.preservesPitch()).toBe(false)
    result.current.set.preservesPitch(true)
    expect(result.current.get.preservesPitch()).toBe(false)
  })

  it('plays on render when using autoPlay', async () => {
    const { result } = renderHook(
      ({ children, autoPlay }) => useTts({ children, autoPlay }),
      {
        initialProps: {
          autoPlay: true,
          children: SpeechSynthesisMock.textForTest
        }
      }
    )

    await waitFor(() => expect(result).not.toBe(null))

    expect(result.current.state.isReady).toBe(true)
    expect(result.current.state.isPlaying).toBe(true)
    expect(global.speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: SpeechSynthesisMock.textForTest
      })
    )
  })

  it('accepts an onError callback', async () => {
    const onError = jest.fn()
    const { result } = renderHook(
      ({ children, onError }) => useTts({ children, onError }),
      {
        initialProps: {
          onError,
          children: SpeechSynthesisMock.textForTest
        }
      }
    )

    SpeechSynthesisMock.triggerError = true
    await act(async () => {
      await result.current.play()
    })
    expect(onError).toHaveBeenCalled()
  })

  it('cancels speaking before the window unloads', () => {
    renderHook(({ children }) => useTts({ children }), {
      initialProps: {
        children: SpeechSynthesisMock.textForTest
      }
    })
    global.dispatchEvent(new Event('beforeunload'))
    expect(global.speechSynthesis.cancel).toHaveBeenCalled()
  })
})
