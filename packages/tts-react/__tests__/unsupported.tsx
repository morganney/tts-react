import { renderHook, act } from '@testing-library/react'
import { useTts } from '../src/hook.js'

describe('support', () => {
  it('does not throw errors when speech synthesis is not supported', () => {
    const { result } = renderHook(() => useTts({ children: 'Test' }))

    expect(result.current.isSynthSupported).toBe(false)
    expect(async () => {
      await act(async () => {
        await result.current.play()
      })
    }).not.toThrow()
  })

  it('supports onNotSupported callback', async () => {
    const onNotSupported = jest.fn()
    const { result } = renderHook(() => useTts({ children: 'Test', onNotSupported }))

    expect(result.current.isSynthSupported).toBe(false)
    expect(onNotSupported).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.play()
    })
    expect(onNotSupported).toHaveBeenCalled()

    await act(async () => {
      await result.current.playOrPause()
    })
    expect(onNotSupported).toHaveBeenCalledTimes(2)

    await act(async () => {
      await result.current.playOrStop()
    })
    expect(onNotSupported).toHaveBeenCalledTimes(3)
  })

  it('calls onNotSupported when using autoplay', () => {
    const onNotSupported = jest.fn()
    const { result } = renderHook(() =>
      useTts({ children: 'Test auto play', autoPlay: true, onNotSupported })
    )

    expect(result.current.isSynthSupported).toBe(false)
    expect(onNotSupported).toHaveBeenCalled()
  })
})
