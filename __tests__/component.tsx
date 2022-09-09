import { describe, test } from '@jest/globals'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TextToSpeech } from '../src/component'

describe('TextToSpeech', () => {
  test('it should have play/pause, replay, and mute buttons by default', async () => {
    const user = userEvent.setup()
    const onMuteToggled = jest.fn()
    const { getByRole, queryByRole } = render(
      <TextToSpeech onMuteToggled={onMuteToggled} markTextAsSpoken>
        This is a test.
      </TextToSpeech>
    )
    const playPauseBtn = getByRole('button', { name: 'Play' })
    const muteBtn = getByRole('button', { name: 'Mute' })
    let replayBtn = queryByRole('button', { name: 'Replay' })

    // Play and Mute buttons present
    expect(playPauseBtn).toBeInTheDocument()
    expect(muteBtn).toBeInTheDocument()
    expect(replayBtn).not.toBeInTheDocument()

    // Test toggling of Play/Pause button
    await user.click(playPauseBtn)
    expect(playPauseBtn.title).toBe('Pause')
    await user.click(playPauseBtn)
    expect(playPauseBtn.title).toBe('Play')
    replayBtn = getByRole('button', { name: 'Replay' })
    expect(replayBtn).toBeInTheDocument()

    // Test replay button
    await user.click(replayBtn)
    expect(playPauseBtn.title).toBe('Pause')

    // Test that mute button accepts a callback
    await user.click(muteBtn)
    expect(onMuteToggled).toHaveBeenCalledWith(false)
    await user.click(muteBtn)
    expect(onMuteToggled).toHaveBeenLastCalledWith(true)
  })

  test('it should have a stop button when using useStopOverPause prop', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <TextToSpeech useStopOverPause>This is a test.</TextToSpeech>
    )
    const playStopBtn = getByRole('button', { name: 'Play' })

    expect(playStopBtn).toBeInTheDocument()
    await user.click(playStopBtn)
    expect(playStopBtn.title).toBe('Stop')
    await user.click(playStopBtn)
    expect(playStopBtn.title).toBe('Play')
  })
})
