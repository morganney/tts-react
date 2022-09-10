import { describe, test } from '@jest/globals'
import { renderHook, act } from '@testing-library/react-hooks'

import { SpeechSynthesisMock } from './speechSynthesis.mock'
import { useTts } from '../src/hook'

describe('useTts', () => {
  test('it converts text to speech from react children', () => {
    const spokenText = SpeechSynthesisMock.textForTest
    const { result } = renderHook(() => useTts({ children: <p>{spokenText}</p> }))

    expect(result.current.state.isPlaying).toBe(false)
    expect(result.current.spokenText).toBe(spokenText)
    expect(result.current.get.volume()).toBe(1)
    expect(result.current.get.rate()).toBe(1)
    expect(result.current.get.pitch()).toBe(1)

    result.current.set.rate(0.5)
    expect(result.current.get.rate()).toBe(0.5)

    result.current.set.pitch(0.5)
    expect(result.current.get.pitch()).toBe(0.5)

    act(() => {
      result.current.set.volume(0.5)
    })
    expect(result.current.get.volume()).toBe(0.5)

    // Test clamping of rate/volume/pitch
    result.current.set.rate(11)
    expect(result.current.get.rate()).toBe(10)
    result.current.set.pitch(3)
    expect(result.current.get.pitch()).toBe(2)
    act(() => {
      result.current.set.volume(-1)
    })
    expect(result.current.get.volume()).toBe(0)
  })
})
