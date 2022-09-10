import { describe, test, jest } from '@jest/globals'
import { render, act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SpeechSynthesisMock } from './speechSynthesis.mock'
import { TextToSpeech } from '../src/component'

describe('TextToSpeech', () => {
  test('it should have play/pause, replay, and mute buttons by default', async () => {
    const user = userEvent.setup()
    const onMuteToggled = jest.fn()
    const { getByRole, queryByRole } = screen

    // Act to allow state to be updated on-mount inside useEffect
    act(() => {
      render(
        <TextToSpeech onMuteToggled={onMuteToggled} markTextAsSpoken>
          {SpeechSynthesisMock.textForTest}
        </TextToSpeech>
      )
    })

    const playPauseBtn = getByRole('button', { name: 'Play' })
    const muteBtn = getByRole('button', { name: 'Mute' })
    let replayBtn = queryByRole('button', { name: 'Replay' })

    // Play and Mute buttons present
    expect(playPauseBtn).toBeInTheDocument()
    expect(muteBtn).toBeInTheDocument()
    expect(replayBtn).not.toBeInTheDocument()

    // Test toggling of Play/Pause button
    await act(async () => {
      await user.click(playPauseBtn)
    })
    expect(playPauseBtn.title).toBe('Pause')
    await act(async () => {
      await user.click(playPauseBtn)
    })
    expect(playPauseBtn.title).toBe('Play')
    replayBtn = getByRole('button', { name: 'Replay' })
    expect(replayBtn).toBeInTheDocument()

    // Test replay button
    await act(async () => {
      await user.click(replayBtn as HTMLElement)
    })
    expect(playPauseBtn.title).toBe('Pause')

    // Test that markTextAsSpoken is working
    await waitFor(() => expect(screen.getByTestId('tts-react-mark')).toBeInTheDocument())

    // Test that mute button accepts a callback
    await act(async () => {
      await user.click(muteBtn)
    })
    expect(onMuteToggled).toHaveBeenCalledWith(false)
    await act(async () => {
      await user.click(muteBtn)
    })
    expect(onMuteToggled).toHaveBeenLastCalledWith(true)
  })

  test('it should have a stop button when using useStopOverPause prop', async () => {
    const user = userEvent.setup()
    const { getByRole } = screen

    await act(async () => {
      render(
        <TextToSpeech useStopOverPause>{SpeechSynthesisMock.textForTest}</TextToSpeech>
      )
    })

    const playStopBtn = getByRole('button', { name: 'Play' })

    expect(playStopBtn).toBeInTheDocument()
    await act(async () => {
      await user.click(playStopBtn)
    })
    expect(playStopBtn.title).toBe('Stop')
    await act(async () => {
      await user.click(playStopBtn)
    })
    expect(playStopBtn.title).toBe('Play')
  })
})
