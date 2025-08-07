import { useMemo, useCallback, createElement, cloneElement, Fragment, isValidElement } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { useTts } from './hook.js'
import type { TTSHookProps, TTSRenderProp } from './hook.js'
import type { TTSBoundaryUpdate } from './controller.js'
import { isStringOrNumber, stripPunctuation, extractTextFromChildren } from './utils.js'
import { Highlighter } from './highlighter.js'
import { iconSizes, Sizes } from './icons.js'
import type { SvgProps } from './icons.js'
import { Control, padding as ctrlPadding } from './control.js'
import type { ControlProps } from './control.js'

enum Positions {
  TL = 'topLeft',
  TR = 'topRight',
  BL = 'bottomLeft',
  BR = 'bottomRight',
  TC = 'topCenter',
  RC = 'rightCenter',
  BC = 'bottomCenter',
  LC = 'leftCenter'
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
  /** Callback when the `TextToSpeech` component's audio toggling control is clicked. */
  onMuteToggled?: (wasMuted: boolean) => void
  /** Whether the `TextToSpeech` component should render a stop control instead of pause. */
  useStopOverPause?: boolean
}
type StyleProps = Pick<TTSProps, 'align' | 'position' | 'size'>

const wrap = ({ position = Positions.LC }: StyleProps): CSSProperties => {
  let gridTemplateAreas = `'cnt ctl'`
  let gridTemplateColumns = '1fr auto'
  let alignItems = 'start'

  switch (position) {
    case Positions.TL:
      gridTemplateAreas = `'ctl cnt'`
      gridTemplateColumns = 'auto 1fr'
      break
    case Positions.BL:
      gridTemplateAreas = `'ctl cnt'`
      alignItems = 'end'
      gridTemplateColumns = 'auto 1fr'
      break
    case Positions.BR:
      gridTemplateAreas = `'cnt ctl'`
      alignItems = 'end'
      break
    case Positions.TC:
      gridTemplateColumns = '1fr'
      gridTemplateAreas = `'ctl'\n'cnt'`
      alignItems = 'center'
      break
    case Positions.RC:
      alignItems = 'center'
      break
    case Positions.BC:
      gridTemplateColumns = '1fr'
      gridTemplateAreas = `'cnt'\n'ctl'`
      alignItems = 'center'
      break
    case Positions.LC:
      gridTemplateAreas = `'ctl cnt'`
      gridTemplateColumns = 'auto 1fr'
      alignItems = 'center'
  }

  return {
    alignItems,
    gridTemplateAreas,
    gridTemplateColumns,
    display: 'grid',
    gap: '15px'
  }
}
const controls = ({
  align,
  position = Positions.LC,
  size = Sizes.MEDIUM
}: StyleProps): CSSProperties => {
  return {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: align === 'horizontal' ? 'row' : 'column',
    gap: '5px',
    gridArea: 'ctl',
    padding: 0,
    margin: position.includes('Center') ? 'auto' : 0,
    backgroundColor: '#f2f1f1a6',
    borderRadius: `${iconSizes[size] + ctrlPadding[size]}px`,
    border: '1px solid transparent'
  }
}
const content = (): CSSProperties => {
  return {
    gridArea: 'cnt'
  }
}

/**
 * Default render prop implementation that handles complex React children
 * by recursively applying highlighting similar to the old Children.map approach
 */
const createDefaultRenderer = (
  text: string,
  markColor?: string,
  markBackgroundColor?: string
): TTSRenderProp => {
  let textBuffer = ''

  const parseChildrenRecursively = (
    children: ReactNode,
    boundary: TTSBoundaryUpdate,
    markTextAsSpoken: boolean
  ): ReactNode => {
    if (!children) return children

    // Handle arrays of children
    if (Array.isArray(children)) {
      return children.map((child: ReactNode) => 
        parseChildrenRecursively(child, boundary, markTextAsSpoken)
      )
    }

    // Handle React elements
    if (isValidElement(children)) {
      const childProps = children.props && typeof children.props === 'object' ? children.props : {}
      
      return cloneElement(children, {
        ...childProps,
        children: parseChildrenRecursively(
          'children' in childProps ? (childProps.children as ReactNode) : undefined,
          boundary,
          markTextAsSpoken
        )
      } as Record<string, unknown>)
    }

    // Handle string and number primitives
    if (isStringOrNumber(children)) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const childText = String(children)
      const { word, startChar, endChar } = boundary
      const bufferTextLength = textBuffer.length

      textBuffer += `${childText} `

      if (markTextAsSpoken && word) {
        const start = startChar - bufferTextLength
        const end = endChar - bufferTextLength
        const prev = childText.substring(0, start)
        const found = childText.substring(start, end)
        const after = childText.substring(end, childText.length)

        if (found && stripPunctuation(found) === stripPunctuation(word)) {
          const Highlight = createElement(Highlighter, {
            text: found,
            mark: stripPunctuation(found),
            color: markColor,
            backgroundColor: markBackgroundColor
          })
          
          return createElement(
            Fragment,
            { key: `tts-${start}-${end}` },
            prev,
            Highlight,
            after
          )
        }
      }
    }

    return children
  }

  return ({ children, boundary, markTextAsSpoken }) => {
    // Reset the buffer for each render
    textBuffer = ''
    return parseChildrenRecursively(children, boundary, markTextAsSpoken)
  }
}
/**
 * `useTts` is a React hook for converting text to speech using
 * the `SpeechSynthesis` and `SpeechSynthesisUtterance` Browser API's.
 * Optionally, you can fallback to using the `HTMLAudioElement` API
 * when setting the `fetchAudioData` prop, for example to use Amazon Polly,
 * or MS Azure Cognitive Speech Services.
 *
 * The `TextToSpeech` component is an implementation of `useTts` that provides
 * controls for playing, pausing/stopping, and replaying the spoken text.
 * It also extends the props of `useTts` by supporting some of it's own:
 *
 * - `align`
 * - `allowMuting`
 * - `onMuteToggled`
 * - `position`
 * - `size`
 * - `useStopOverPause`
 */
const TextToSpeech = ({
  size,
  lang,
  rate,
  voice,
  volume,
  children,
  text,
  render,
  position,
  onStart,
  onPause,
  onBoundary,
  onEnd,
  onError,
  onMuteToggled,
  onVolumeChange,
  onPitchChange,
  onRateChange,
  onNotSupported,
  fetchAudioData,
  markColor,
  markBackgroundColor,
  autoPlay = false,
  allowMuting = true,
  align = 'horizontal',
  markTextAsSpoken = false,
  useStopOverPause = false
}: TTSProps) => {
  // Create a default renderer for complex content when markTextAsSpoken is true
  // but no custom render prop is provided
  const defaultRenderer = useMemo(() => {
    if (markTextAsSpoken && !render) {
      const extractedText = text || (children ? extractTextFromChildren(children) : '')
      return createDefaultRenderer(extractedText, markColor, markBackgroundColor)
    }
    return undefined
  }, [markTextAsSpoken, render, text, children, markColor, markBackgroundColor])

  const { state, replay, toggleMute, playOrPause, playOrStop, ttsChildren } = useTts({
    lang,
    rate,
    voice,
    volume,
    children,
    text,
    render: render || defaultRenderer,
    onStart,
    onPause,
    onBoundary,
    onEnd,
    onError,
    onVolumeChange,
    onPitchChange,
    onRateChange,
    onNotSupported,
    fetchAudioData,
    autoPlay,
    markColor,
    markBackgroundColor,
    markTextAsSpoken
  })
  const wrapStyle = useMemo(() => wrap({ position }), [position])
  const controlsStyle = useMemo(
    () => controls({ align, position, size }),
    [align, position, size]
  )
  const contentStyle = useMemo(() => content(), [])
  const [type, title, onClick] = useMemo(() => {
    if (state.isPlaying) {
      if (useStopOverPause) {
        return ['stop', 'Stop', playOrStop]
      }

      return ['pause', 'Pause', playOrPause]
    }

    return ['play', 'Play', playOrPause]
  }, [state.isPlaying, useStopOverPause, playOrStop, playOrPause])
  const handleOnMuteClicked = useCallback(async () => {
    await toggleMute(onMuteToggled)
  }, [toggleMute, onMuteToggled])

  return (
    <div style={wrapStyle} className="tts-react" data-testid="tts-react">
      {state.isReady && (
        <aside style={controlsStyle} data-testid="tts-react-controls">
          {allowMuting && (
            <Control
              size={size}
              align={align}
              title={state.isMuted ? 'Unmute' : 'Mute'}
              aria-label={state.isMuted ? 'Unmute' : 'Mute'}
              onClick={handleOnMuteClicked}
              type={
                state.isMuted ? 'volumeOff' : state.isPlaying ? 'volumeUp' : 'volumeDown'
              }
            />
          )}
          <Control
            type={type as ControlProps['type']}
            title={title}
            aria-label={title}
            onClick={onClick}
            size={size}
            align={align}
          />
          {state.isPaused && (
            <Control
              type="replay"
              size={size}
              align={align}
              title="Replay"
              aria-label="Replay"
              onClick={replay}
            />
          )}
        </aside>
      )}
      <div style={contentStyle}>{ttsChildren}</div>
    </div>
  )
}

export { Sizes } from './icons.js'
export { TextToSpeech, Positions }
export type { TTSProps }
