import { useMemo } from 'react'
import type { CSSProperties } from 'react'

import { useTts } from './hook'
import type { TTSHookProps } from './hook'
import { iconSizes, Sizes } from './icons'
import type { SvgProps } from './icons'
import { Control, padding as ctrlPadding } from './control'
import type { ControlProps } from './control'

enum Positions {
  TL = 'topLeft',
  TR = 'topRight',
  BL = 'bottomLeft',
  BR = 'bottomRight'
}
interface TTSProps extends TTSHookProps {
  /** How the controls are aligned within the `TextToSpeech` component. */
  align?: 'vertical' | 'horizontal'
  /** The relative size of the controls within the `TextToSpeech` component. */
  size?: SvgProps['size']
  /** The relative position of the controls within the `TextToSpeech` component. */
  position?: `${Positions}`
  /** Whether the `TextToSpeech` component should render the audio toggling control. */
  allowMuting?: boolean
  /** Whether the `TextToSpeech` should render a stop control instead of pause. */
  useStopOverPause?: boolean
}
type ControlsProps = Required<Pick<TTSProps, 'align' | 'position' | 'size'>>

const getTRBL = (position: TTSProps['position']) => {
  switch (position) {
    case Positions.TL:
      return { top: '1px', left: '1px' }
    case Positions.BR:
      return { bottom: '1px', right: '1px' }
    case Positions.BL:
      return { bottom: '1px', left: '1px' }
    default:
      return { top: '1px', right: '1px' }
  }
}
const wrap = (): CSSProperties => {
  return {
    position: 'relative'
  }
}
const controls = ({ align, position, size }: ControlsProps): CSSProperties => {
  return {
    display: 'flex',
    flexDirection: align === 'horizontal' ? 'row' : 'column',
    position: 'absolute',
    ...getTRBL(position),
    zIndex: 9999,
    gap: '5px',
    padding: 0,
    backgroundColor: '#f2f1f1a6',
    borderRadius: `${iconSizes[size] + ctrlPadding[size]}px`,
    border: '1px solid transparent'
  }
}
/**
 * `useTts` is a React hook for converting text to speech using
 * the `SpeechSynthesis` and `SpeechSynthesisUtterance` Browser API's.
 * Optionally, you can fallback to using the `HTMLAudioElement` API
 * when setting the `fetchAudioData` prop, for example to use Amazon Polly.
 *
 * `TextToSpeech` is an implementation of `useTts` that provides
 * controls for playing, pausing/stopping, and replaying the spoken text.
 * It also extends the props of `useTts` by supporting some of it's own:
 *
 * - `align`
 * - `allowMuting`
 * - `position`
 * - `size`
 * - `useStopOverPause`
 */
const TextToSpeech = ({
  lang,
  voice,
  children,
  onError,
  fetchAudioData,
  markColor,
  markBackgroundColor,
  autoPlay = false,
  allowMuting = true,
  size = Sizes.MEDIUM,
  align = 'horizontal',
  position = Positions.TR,
  markTextAsSpoken = false,
  useStopOverPause = false
}: TTSProps) => {
  const { state, onReset, onMuted, onPlayPause, onPlayStop, ttsChildren } = useTts({
    lang,
    voice,
    children,
    onError,
    fetchAudioData,
    autoPlay,
    markColor,
    markBackgroundColor,
    markTextAsSpoken
  })
  const wrapStyle = useMemo(() => wrap(), [])
  const controlsStyle = useMemo(
    () => controls({ align, position, size }),
    [align, position, size]
  )
  const [type, title, onClick] = useMemo(() => {
    if (state.isPlaying) {
      if (useStopOverPause) {
        return ['stop', 'Stop', onPlayStop]
      }

      return ['pause', 'Pause', onPlayPause]
    }

    return ['play', 'Play', onPlayPause]
  }, [state.isPlaying, useStopOverPause, onPlayStop, onPlayPause])

  return (
    <div style={wrapStyle} className="tts-react">
      {state.isReady && (
        <aside style={controlsStyle}>
          {allowMuting && (
            <Control
              size={size}
              title="Mute audio"
              onClick={onMuted}
              type={
                state.isMuted ? 'volumeOff' : state.isPlaying ? 'volumeUp' : 'volumeDown'
              }
            />
          )}
          <Control
            type={type as ControlProps['type']}
            title={title}
            onClick={onClick}
            size={size}
          />
          {state.isPaused && (
            <Control type="replay" size={size} title="Replay" onClick={onReset} />
          )}
        </aside>
      )}
      {ttsChildren}
    </div>
  )
}

export { TextToSpeech, Positions }
export type { TTSProps }
