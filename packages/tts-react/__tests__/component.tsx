import { describe, test, jest } from '@jest/globals'
import { render, act, waitFor, fireEvent } from '@testing-library/react'

import { SpeechSynthesisMock } from './speechSynthesis.mock.js'
import { TextToSpeech, Positions } from '../src/component.js'
import { stripPunctuation } from '../src/utils.js'

describe('TextToSpeech', () => {
  test('it should have play/pause, replay, and mute buttons by default', () => {
    const onMuteToggled = jest.fn()
    const { getByRole, queryByRole } = render(
      <TextToSpeech onMuteToggled={onMuteToggled}>
        {SpeechSynthesisMock.textForTest}
      </TextToSpeech>
    )

    // Play and Mute buttons present
    expect(getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Mute' })).toBeInTheDocument()
    expect(queryByRole('button', { name: 'Replay' })).not.toBeInTheDocument()

    // Click play check for pause button
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Play' }))
    })
    expect(global.speechSynthesis.cancel).toHaveBeenCalled()
    expect(global.speechSynthesis.resume).toHaveBeenCalled()
    expect(global.speechSynthesis.speak).toHaveBeenCalled()
    expect(getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    // Click pause check for play and replay buttons
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Pause' }))
    })
    expect(global.speechSynthesis.pause).toHaveBeenCalled()
    expect(getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Replay' })).toBeInTheDocument()

    // Click mute, check that the callback was invoked
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Mute' }))
    })
    expect(onMuteToggled).toHaveBeenCalledWith(false)
    // Cancel only called once thus far as we are currently paused (so no replay)
    expect(global.speechSynthesis.cancel).toHaveBeenCalledTimes(1)
    expect(global.speechSynthesis.resume).toHaveBeenCalledTimes(1)
    expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(1)
  })

  test('it will use a stop button with prop useStopOverPause', () => {
    const { getByRole } = render(
      <TextToSpeech useStopOverPause>{SpeechSynthesisMock.textForTest}</TextToSpeech>
    )

    // Click play check for stop button
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Play' }))
    })
    expect(getByRole('button', { name: 'Stop' })).toBeInTheDocument()

    // Click stop check for play button
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Stop' }))
    })
    expect(getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  test('it will render highlighted words with <mark> elements', async () => {
    const words = SpeechSynthesisMock.getWords(SpeechSynthesisMock.textForTest)
    const { getByRole, queryByRole, getByTestId, queryByTestId } = render(
      <TextToSpeech markTextAsSpoken>{SpeechSynthesisMock.textForTest}</TextToSpeech>,
      /**
       * @FIXME Do not use legacyRoot.
       */
      { legacyRoot: true }
    )

    // Click play to start firing boundary events and thus inserts marks
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Play' }))
      //jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
    })
    await waitFor(() => expect(getByTestId('tts-react-mark')).toBeInTheDocument())
    expect(getByTestId('tts-react-mark').textContent).toBe(words.shift())

    act(() => {
      jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
    })
    await waitFor(() => expect(getByTestId('tts-react-mark')).toBeInTheDocument())
    expect(getByTestId('tts-react-mark').textContent).toBe(words.shift())

    // Finish marking the words in the spoken text
    while (words.length) {
      act(() => {
        jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
      })
      await waitFor(() => expect(getByTestId('tts-react-mark')).toBeInTheDocument())
      expect(getByTestId('tts-react-mark').textContent).toBe(
        stripPunctuation(words.shift() as string)
      )
    }

    // Wait for the end event to fire and speaking to stop
    act(() => {
      jest.advanceTimersByTime(SpeechSynthesisMock.wordBoundaryDelayMs)
    })
    await waitFor(() => expect(queryByTestId('tts-react-mark')).not.toBeInTheDocument())
    expect(queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
  })

  it('supports position and align props', () => {
    const { getByTestId, rerender } = render(
      <TextToSpeech position={Positions.TL}>
        {SpeechSynthesisMock.textForTest}
      </TextToSpeech>
    )

    expect(getByTestId('tts-react')).toHaveStyle({ gridTemplateAreas: `'ctl cnt'` })

    rerender(
      <TextToSpeech position={Positions.BL}>
        {SpeechSynthesisMock.textForTest}
      </TextToSpeech>
    )
    expect(getByTestId('tts-react')).toHaveStyle({ gridTemplateAreas: `'ctl cnt'` })

    rerender(
      <TextToSpeech position={Positions.BR}>
        {SpeechSynthesisMock.textForTest}
      </TextToSpeech>
    )
    expect(getByTestId('tts-react')).toHaveStyle({ gridTemplateAreas: `'cnt ctl'` })
    expect(getByTestId('tts-react-controls')).toHaveStyle({
      flexDirection: 'row'
    })

    rerender(
      <TextToSpeech position={Positions.TC}>
        {SpeechSynthesisMock.textForTest}
      </TextToSpeech>
    )
    expect(getByTestId('tts-react')).toHaveStyle({ gridTemplateAreas: "'ctl'\n'cnt'" })

    rerender(
      <TextToSpeech position={Positions.BC}>
        {SpeechSynthesisMock.textForTest}
      </TextToSpeech>
    )
    expect(getByTestId('tts-react')).toHaveStyle({ gridTemplateAreas: "'cnt'\n'ctl'" })

    rerender(
      <TextToSpeech position={Positions.RC}>
        {SpeechSynthesisMock.textForTest}
      </TextToSpeech>
    )
    expect(getByTestId('tts-react')).toHaveStyle({ alignItems: 'center' })

    rerender(
      <TextToSpeech position={Positions.LC}>
        {SpeechSynthesisMock.textForTest}
      </TextToSpeech>
    )
    expect(getByTestId('tts-react')).toHaveStyle({
      alignItems: 'center',
      gridTemplateColumns: 'auto 1fr'
    })

    rerender(
      <TextToSpeech align="vertical">{SpeechSynthesisMock.textForTest}</TextToSpeech>
    )
    expect(getByTestId('tts-react-controls')).toHaveStyle({
      flexDirection: 'column'
    })
  })
})
