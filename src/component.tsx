import { useMemo } from 'react'
import type { CSSProperties } from 'react'

import { useTts } from './hook'
import type { TTSHookProps } from './hook'
import { Icon, sizes as iconSizes, Sizes } from './icons'
import type { SvgProps } from './icons'
import { Button, padding as btnPadding } from './button'

enum Positions {
  TL = 'topLeft',
  TR = 'topRight',
  BL = 'bottomLeft',
  BR = 'bottomRight'
}
interface TTSProps extends TTSHookProps {
  align?: 'vertical' | 'horizontal'
  size?: SvgProps['size']
  position?: `${Positions}`
  allowMuting?: boolean
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
    gap: '5px',
    padding: `${btnPadding[size]}px`,
    backgroundColor: '#f2f1f1a6',
    borderRadius: `${iconSizes[size] + btnPadding[size]}px`,
    border: '1px solid transparent'
  }
}
const TextToSpeech = ({
  children,
  voiceName,
  onError,
  fetchAudioData,
  markColor,
  markBackgroundColor,
  autoPlay = false,
  allowMuting = true,
  size = Sizes.MEDIUM,
  align = 'horizontal',
  position = Positions.TR,
  markTextAsSpoken = false
}: TTSProps) => {
  const { state, onReset, onMuted, onPlayPause, ttsChildren } = useTts({
    children,
    onError,
    fetchAudioData,
    voiceName,
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

  return (
    <div style={wrapStyle} className="tts-react">
      {state.isReady && (
        <aside style={controlsStyle}>
          {allowMuting && (
            <Button title="Mute audio" size={size} onClick={onMuted}>
              {state.isMuted ? (
                <Icon type="volumeOff" size={size} />
              ) : state.isPlaying ? (
                <Icon type="volumeUp" size={size} />
              ) : (
                <Icon type="volumeDown" size={size} />
              )}
            </Button>
          )}
          <Button
            size={size}
            title={state.isPlaying ? 'Pause' : 'Play'}
            onClick={onPlayPause}>
            {state.isPlaying ? (
              <Icon type="pause" size={size} />
            ) : (
              <Icon type="play" size={size} />
            )}
          </Button>
          {state.isPaused && (
            <Button title="Replay" size={size} onClick={onReset}>
              {<Icon type="replay" size={size} />}
            </Button>
          )}
        </aside>
      )}
      {ttsChildren}
    </div>
  )
}

export { TextToSpeech, Positions }
export type { TTSProps }
