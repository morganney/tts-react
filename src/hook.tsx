import {
  useMemo,
  useReducer,
  useCallback,
  useEffect,
  Children,
  cloneElement,
  isValidElement
} from 'react'
import type { ReactNode } from 'react'

import { Controller, Events } from './controller'
import type {
  ControllerOptions,
  TTSBoundaryUpdate,
  CustomBoundaryEventListener,
  CustomErrorEventListener,
  CustomNumberEventListener
} from './controller'
import { isStringOrNumber, stripPunctuation } from './utils'
import { Highlighter } from './highlighter'

interface MarkStyles {
  /** Text color of the currently marked word. */
  markColor?: string
  /** Background color of the currently marked word. */
  markBackgroundColor?: string
}
interface TTSHookProps extends MarkStyles {
  /** The spoken text is extracted from here. */
  children: ReactNode
  /** The `SpeechSynthesisUtterance.lang` to use. */
  lang?: ControllerOptions['lang']
  /** The `SpeechSynthesisUtterance.voice` to use. */
  voice?: ControllerOptions['voice']
  /** Whether the text should be spoken automatically, i.e. on render. */
  autoPlay?: boolean
  /** Whether the spoken word should be wrapped in a `<mark>` element. */
  markTextAsSpoken?: boolean
  /** Callback when the volume is changed.  */
  onVolumeChange?: (newVolume: number) => void
  /** Callback when the rate is changed.  */
  onRateChange?: (newRate: number) => void
  /** Callback when the pitch is changed.  */
  onPitchChange?: (newPitch: number) => void
  /** Callback when there is an error of any kind. */
  onError?: (errorMsg: string) => void
  /** Function to fetch audio and speech marks for the spoken text. */
  fetchAudioData?: ControllerOptions['fetchAudioData']
}
interface TTSHookState {
  voices: SpeechSynthesisVoice[]
  boundary: TTSBoundaryUpdate
  isPlaying: boolean
  isPaused: boolean
  isMuted: boolean
  isError: boolean
  isReady: boolean
}
interface Action {
  type:
    | 'ready'
    | 'pause'
    | 'play'
    | 'boundary'
    | 'reset'
    | 'end'
    | 'error'
    | 'muted'
    | 'unmuted'
    | 'stop'
    | 'voices'
  payload?: TTSBoundaryUpdate | SpeechSynthesisVoice[]
}
interface OnToggleMuteCallback {
  (wasMuted: boolean): void
}
interface TTSHookResponse {
  set: {
    lang: (value: string) => void
    rate: (value: number) => void
    pitch: (value: number) => void
    volume: (value: number) => void
    preservesPitch: (value: boolean) => void
  }
  get: {
    lang: () => string
    rate: () => number
    pitch: () => number
    volume: () => number
    preservesPitch: () => boolean
  }
  state: TTSHookState
  spokenText: string
  onPlay: () => void
  onStop: () => void
  onPause: () => void
  onReset: () => void
  onToggleMute: (callback?: OnToggleMuteCallback) => void
  onPlayStop: () => void
  onPlayPause: () => void
  ttsChildren: ReactNode
}
interface TextBuffer {
  text: string
}
interface ParseChildrenProps extends MarkStyles {
  children: ReactNode
  buffer: TextBuffer
  boundary: TTSBoundaryUpdate
}

const parseChildrenRecursively = ({
  children,
  buffer,
  boundary,
  markColor,
  markBackgroundColor
}: ParseChildrenProps): ReactNode => {
  return Children.map(children, (child) => {
    let currentChild = child

    if (isValidElement(child)) {
      currentChild = cloneElement(child, {
        ...child.props,
        children: parseChildrenRecursively({
          buffer,
          boundary,
          markColor,
          markBackgroundColor,
          children: child.props.children
        })
      })
    }

    if (isStringOrNumber(child)) {
      const text = (child as string | number).toString()
      const { word, startChar, endChar } = boundary
      const bufferTextLength = buffer.text.length

      buffer.text += `${text} `

      if (word) {
        const start = startChar - bufferTextLength
        const end = endChar - bufferTextLength
        const prev = text.substring(0, start)
        const found = text.substring(start, end)
        const after = text.substring(end, text.length)

        if (found) {
          return (
            <>
              {prev}
              <Highlighter
                text={found}
                mark={stripPunctuation(found)}
                color={markColor}
                backgroundColor={markBackgroundColor}
              />
              {after}
            </>
          )
        }
      }
    }

    return currentChild
  })
}
const defaultBoundary = { word: '', startChar: 0, endChar: 0 }
const reducer = (state: TTSHookState, action: Action): TTSHookState => {
  switch (action.type) {
    case 'pause':
      return { ...state, isPlaying: false, isPaused: true, isError: false }
    case 'play':
    case 'reset':
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        isError: false,
        boundary: defaultBoundary
      }
    case 'end':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        isError: false,
        boundary: defaultBoundary
      }
    case 'error':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        isError: true,
        boundary: defaultBoundary
      }
    case 'ready':
      return { ...state, isReady: true }
    case 'boundary':
      return {
        ...state,
        boundary: { ...state.boundary, ...(action.payload as TTSBoundaryUpdate) }
      }
    case 'voices':
      return { ...state, voices: action.payload as SpeechSynthesisVoice[] }
    case 'stop':
      return { ...state, isPlaying: false, isPaused: false, isError: false }
    case 'muted':
      return { ...state, isMuted: true }
    case 'unmuted':
      return { ...state, isMuted: false }
    default:
      throw new Error(`[tts-react]: invalid action type ${action.type}`)
  }
}
const useTts = ({
  lang,
  voice,
  children,
  markColor,
  markBackgroundColor,
  onError,
  onVolumeChange,
  onPitchChange,
  onRateChange,
  fetchAudioData,
  autoPlay = false,
  markTextAsSpoken = false
}: TTSHookProps): TTSHookResponse => {
  const [state, dispatch] = useReducer(reducer, {
    voices: window.speechSynthesis?.getVoices() ?? [],
    boundary: defaultBoundary,
    isPlaying: false,
    isPaused: false,
    isMuted: false,
    isError: false,
    isReady: typeof fetchAudioData === 'undefined'
  })
  const [ttsChildren, spokenText] = useMemo(() => {
    const buffer: TextBuffer = { text: '' }
    const parsed = parseChildrenRecursively({
      children,
      buffer,
      markColor,
      markBackgroundColor,
      boundary: state.boundary
    })

    return [parsed, buffer.text.trim()]
  }, [children, state.boundary, markColor, markBackgroundColor])
  const controller = useMemo(
    () =>
      new Controller({
        lang,
        voice,
        fetchAudioData,
        text: spokenText,
        dispatchBoundaries: markTextAsSpoken
      }),
    [lang, voice, fetchAudioData, spokenText, markTextAsSpoken]
  )
  const onPlay = useCallback(() => {
    if (state.isPaused) {
      controller.resume()
    } else {
      controller.play()
    }

    dispatch({ type: 'play' })
  }, [controller, state.isPaused])
  const onPause = useCallback(() => {
    controller.pause()
    dispatch({ type: 'pause' })
  }, [controller])
  const onReset = useCallback(() => {
    controller.reset()
    dispatch({ type: 'reset' })
  }, [controller])
  const onStop = useCallback(() => {
    controller.clear()

    dispatch({ type: 'stop' })
  }, [controller])
  const onToggleMuteHandler = useCallback(
    (callback?: OnToggleMuteCallback) => {
      const wasMuted = state.isMuted

      if (wasMuted) {
        controller.unmute()
        dispatch({ type: 'unmuted' })
      } else {
        controller.mute()
        dispatch({ type: 'muted' })
      }

      if (typeof callback === 'function') {
        callback(wasMuted)
      }
    },
    [controller, state.isMuted]
  )
  const onPlayPause = useMemo(
    () => (state.isPlaying ? onPause : onPlay),
    [state.isPlaying, onPause, onPlay]
  )
  const onPlayStop = useMemo(
    () => (state.isPlaying ? onStop : onPlay),
    [state.isPlaying, onStop, onPlay]
  )
  const [get, set] = useMemo(
    () => [
      {
        lang() {
          return controller.lang
        },
        rate() {
          return controller.rate
        },
        pitch() {
          return controller.pitch
        },
        volume() {
          return controller.volume
        },
        preservesPitch() {
          return controller.preservesPitch
        }
      },
      {
        lang(value: string) {
          controller.lang = value
        },
        rate(value: number) {
          controller.rate = value
        },
        pitch(value: number) {
          controller.pitch = value
        },
        volume(value: number) {
          controller.volume = value
        },
        preservesPitch(value: boolean) {
          controller.preservesPitch = value
        }
      }
    ],
    [controller]
  )

  useEffect(() => {
    const onEnd = () => {
      dispatch({ type: 'end' })
    }
    const onReady = () => {
      dispatch({ type: 'ready' })
    }
    const onErrorHandler: CustomErrorEventListener = (evt) => {
      dispatch({ type: 'error' })

      if (typeof onError === 'function') {
        onError(evt.detail)
      }
    }
    const onBoundary: CustomBoundaryEventListener = (evt) => {
      dispatch({ type: 'boundary', payload: evt.detail })
    }
    const onVolume: CustomNumberEventListener = (evt) => {
      const volume = evt.detail

      if (volume === 0 && !state.isMuted) {
        dispatch({ type: 'muted' })
      }

      if (volume !== 0 && state.isMuted) {
        dispatch({ type: 'unmuted' })
      }

      if (typeof onVolumeChange === 'function') {
        onVolumeChange(volume)
      }
    }
    const onPitch: CustomNumberEventListener = (evt) => {
      if (typeof onPitchChange === 'function') {
        onPitchChange(evt.detail)
      }
    }
    const onRate: CustomNumberEventListener = (evt) => {
      if (typeof onRateChange === 'function') {
        onRateChange(evt.detail)
      }
    }
    const onBeforeUnload = () => {
      controller.clear()
    }

    controller.addEventListener(Events.END, onEnd)
    controller.addEventListener(Events.ERROR, onErrorHandler as EventListener)
    controller.addEventListener(Events.READY, onReady)
    controller.addEventListener(Events.VOLUME, onVolume as EventListener)
    controller.addEventListener(Events.PITCH, onPitch as EventListener)
    controller.addEventListener(Events.RATE, onRate as EventListener)
    window.addEventListener('beforeunload', onBeforeUnload)

    if (markTextAsSpoken) {
      controller.addEventListener(Events.BOUNDARY, onBoundary as EventListener)
    }

    controller.init()

    return () => {
      controller.removeEventListener(Events.END, onEnd)
      controller.removeEventListener(Events.ERROR, onErrorHandler as EventListener)
      controller.removeEventListener(Events.READY, onReady)
      controller.removeEventListener(Events.BOUNDARY, onBoundary as EventListener)
      controller.removeEventListener(Events.VOLUME, onVolume as EventListener)
      controller.removeEventListener(Events.PITCH, onPitch as EventListener)
      controller.removeEventListener(Events.RATE, onRate as EventListener)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [
    controller,
    markTextAsSpoken,
    onError,
    state.isMuted,
    onVolumeChange,
    onPitchChange,
    onRateChange
  ])

  useEffect(() => {
    if (autoPlay && state.isReady) {
      controller.clear()
      controller.play()
      dispatch({ type: 'play' })
    }
  }, [autoPlay, controller, state.isReady])

  useEffect(() => {
    const onVoicesChanged = () => {
      dispatch({ type: 'voices', payload: window.speechSynthesis.getVoices() })
    }

    if (typeof window.speechSynthesis?.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    }

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', onVoicesChanged)
    }
  }, [])

  return {
    get,
    set,
    state,
    spokenText,
    ttsChildren,
    onPlay,
    onStop,
    onPause,
    onReset,
    onPlayStop,
    onPlayPause,
    onToggleMute: onToggleMuteHandler
  }
}

export { useTts }
export type { TTSHookProps, TTSHookResponse, TTSHookState }
