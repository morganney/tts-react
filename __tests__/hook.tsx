import { describe, test, jest, beforeEach } from '@jest/globals'
import { renderHook, act } from '@testing-library/react-hooks'

import { SpeechSynthesisMock } from './speechSynthesis.mock'
import { useTts } from '../src/hook'
import { stripPunctuation } from '../src/utils'

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

  beforeEach(() => {
    words = SpeechSynthesisMock.getWords(SpeechSynthesisMock.textForTest)
  })

  test('it converts text-to-speech from children text and updates state on word boundaries', async () => {
    const onEnd = jest.fn()
    const { result, waitForNextUpdate } = renderHook(
      ({ children, markTextAsSpoken, onEnd, rate, volume }) =>
        useTts({ children, markTextAsSpoken, onEnd, rate, volume }),
      {
        initialProps: {
          onEnd,
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
    act(() => {
      global.speechSynthesis.dispatchEvent(new Event('voiceschanged'))
    })
    expect(global.speechSynthesis.getVoices).toHaveBeenCalled()

    // Start coverting text to speech
    act(() => {
      result.current.onPlay()
    })
    expect(result.current.state.isPlaying).toBe(true)
    expect(result.current.get.rate()).toBe(0.4)
    expect(result.current.get.volume()).toBe(0.5)
    expect(global.speechSynthesis.speak).toHaveBeenCalled()

    // Check firing of word boundaries and state boundary updates
    while (word) {
      act(() => {
        jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
      })
      await waitForNextUpdate()
      expect(result.current.state.boundary.word).toBe(stripPunctuation(word))
      word = words.shift()
    }

    // Wait for firing of 'end' event on utterance
    act(() => {
      jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
    })
    await waitForNextUpdate()
    expect(result.current.state.isPlaying).toBe(false)
    expect(onEnd).toHaveBeenCalled()
  })

  it('allows pausing, resuming and stopping of spoken text', () => {
    const { result } = renderHook(({ children }) => useTts({ children }), {
      initialProps: {
        children: SpeechSynthesisMock.textForTest
      }
    })

    // Check default state and play
    expect(result.current.state).toStrictEqual(defaultState)
    act(() => {
      result.current.onPlay()
    })
    expect(result.current.state.isPlaying).toBe(true)
    expect(global.speechSynthesis.speak).toHaveBeenCalled()

    // Now pause
    act(() => {
      result.current.onPause()
    })
    expect(global.speechSynthesis.pause).toHaveBeenCalled()
    expect(result.current.state.isPaused).toBe(true)
    expect(result.current.state.isPlaying).toBe(false)

    // Now resume (via useTts.onPlay)
    act(() => {
      result.current.onPlay()
    })
    expect(global.speechSynthesis.resume).toHaveBeenCalled()
    expect(result.current.state.isPaused).toBe(false)
    expect(result.current.state.isPlaying).toBe(true)

    // Now stop
    act(() => {
      result.current.onStop()
    })
    expect(global.speechSynthesis.cancel).toHaveBeenCalled()
    expect(result.current.state.isPaused).toBe(false)
    expect(result.current.state.isPlaying).toBe(false)
  })

  it('returns a handler for toggling mute, and reset(replay)ing the spoken text', () => {
    const onMutedCallback = jest.fn()
    const { result } = renderHook(({ children }) => useTts({ children }), {
      initialProps: {
        children: SpeechSynthesisMock.textForTest
      }
    })

    // Check default state
    expect(result.current.state).toStrictEqual(defaultState)

    // Now activate mute
    act(() => {
      result.current.onToggleMute(onMutedCallback)
    })
    expect(result.current.state.isMuted).toBe(true)
    expect(onMutedCallback).toHaveBeenCalledWith(false)

    // Now activate unmute
    act(() => {
      result.current.onToggleMute(onMutedCallback)
    })
    expect(result.current.state.isMuted).toBe(false)
    expect(onMutedCallback).toHaveBeenLastCalledWith(true)

    // Now play
    act(() => {
      result.current.onPlay()
    })
    expect(result.current.state.isPlaying).toBe(true)

    // Now mute while playing against a SpeechSynthesis instance of the backing controller
    act(() => {
      result.current.onToggleMute(onMutedCallback)
    })
    expect(result.current.state.isMuted).toBe(true)
    expect(onMutedCallback).toHaveBeenLastCalledWith(false)
    /**
     * Check that the synthesizer resumed, cancelled and then started speaking again.
     * Not all user agents will change the volume of an utterance that is currently
     * beig spoken, even if utterance.voice was changed.
     *
     * This is effectively an onReset().
     */
    expect(global.speechSynthesis.resume).toHaveBeenCalled()
    expect(global.speechSynthesis.cancel).toHaveBeenCalled()
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(2)
    expect(result.current.state.isPlaying).toBe(true)

    // Now Pause
    act(() => {
      result.current.onPause()
    })
    expect(result.current.state.isPaused).toBe(true)
    expect(result.current.state.isPlaying).toBe(false)

    // Now reset
    act(() => {
      result.current.onReset()
    })
    expect(result.current.state.isPaused).toBe(false)
    expect(global.speechSynthesis.resume).toHaveBeenCalledTimes(2)
    expect(global.speechSynthesis.cancel).toHaveBeenCalledTimes(2)
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(3)
    expect(result.current.state.isPlaying).toBe(true)
  })

  it('returns getters/setters for speaking attributes, and callbacks when they change', () => {
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
    result.current.set.volume(0.2)
    expect(result.current.get.volume()).toBe(0.2)
    expect(onVolumeChange).toHaveBeenCalledWith(0.2)

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

    expect(result.current.state.isReady).toBe(true)
    expect(result.current.state.isPlaying).toBe(true)
    expect(global.speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: SpeechSynthesisMock.textForTest
      })
    )
  })
})
