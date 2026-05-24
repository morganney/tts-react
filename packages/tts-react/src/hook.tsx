import {
  useRef,
  useMemo,
  useReducer,
  useCallback,
  useEffect,
  createElement,
  Fragment
} from 'react'
import type { ReactNode } from 'react'

import { Controller, ControllerStub, Events } from './controller.js'
import type { ControllerOptions, TTSBoundaryUpdate, TTSEvent } from './controller.js'
import { stripPunctuation, noop, extractTextFromChildren } from './utils.js'
import { Highlighter } from './highlighter.js'

/**
 * Event handler for a TTS event:
 * - `onStart`
 * - `onPause`
 * - `onEnd`
 *
 * If not using `fetchAudioData` then the event will be `SpeechSynthesisEvent`.
 * Otherwise, the event will be the generic `Event` type used by `HTMLAudioElement`.
 */
type TTSEventHandler = (evt: SpeechSynthesisEvent | Event) => void
/**
 * Event handler for a TTS error event.
 * `tts-react` wraps both `SpeechSynthesis` and `HTMLAudioElement` API's
 * which return the error information in diferrent ways. `tts-react` will
 * return the error message from to the handler if one is found.
 */
type TTSErrorHandler = (msg: string) => void
/**
 * Event handler if an attribute of speaking has changed:
 * - volume
 * - rate
 * - pitch
 */
type TTSAudioChangeHandler = (newValue: number) => void
/**
 * Event handler for TTS boundary events.
 *
 * If yousing `fetchAudioData` these events correspond to `timeupdate` events
 * for `HTMLAudioElement` where a `PollySpeechMark` could be found for the event's `currentTime`.
 *
 * Otherwise, these correspond to `boundary` events for `SpeechSynthesisUtterance`.
 */
type TTSBoundaryHandler = (
  boundary: TTSBoundaryUpdate,
  evt: SpeechSynthesisEvent | Event
) => void
/**
 * Fallback function to call when the `SpeechSynthesis` API is not supported.
 */
type TTSFallback = () => void

interface TTSOnEvent {
  (evt: CustomEvent<TTSEvent>): void
}
interface TTSOnBoundary {
  (
    evt: CustomEvent<{ boundary: TTSBoundaryUpdate; evt: SpeechSynthesisEvent | Event }>
  ): void
}
interface TTSOnError {
  (evt: CustomEvent<string>): void
}
interface TTSOnAudioChange {
  (evt: CustomEvent<number>): void
}
interface MarkStyles {
  /** Text color of the currently marked word. */
  markColor?: string
  /** Background color of the currently marked word. */
  markBackgroundColor?: string
}
/**
 * Render prop function type for custom text highlighting
 */
type TTSRenderProp = (params: {
  children: ReactNode
  boundary: TTSBoundaryUpdate
  markTextAsSpoken: boolean
  markColor?: string
  markBackgroundColor?: string
}) => ReactNode

interface TTSHookProps extends MarkStyles {
  /** The spoken text is extracted from here. */
  children?: ReactNode
  /** Direct text to be spoken - alternative to children. */
  text?: string
  /** Render prop for custom highlighting - receives highlighting parameters */
  render?: TTSRenderProp
  /** The `SpeechSynthesisUtterance.lang` to use. */
  lang?: ControllerOptions['lang']
  /** The `SpeechSynthesisUtterance.voice` to use. */
  voice?: ControllerOptions['voice']
  /** The initial rate of the speaking audio. */
  rate?: number
  /** The initial volume of the speaking audio. */
  volume?: number
  /** Whether the text should be spoken automatically, i.e. on render. */
  autoPlay?: boolean
  /** Whether the spoken word should be wrapped in a `<mark>` element. */
  markTextAsSpoken?: boolean
  /** Callback when the volume is changed.  */
  onVolumeChange?: TTSAudioChangeHandler
  /** Callback when the rate is changed.  */
  onRateChange?: TTSAudioChangeHandler
  /** Callback when the pitch is changed.  */
  onPitchChange?: TTSAudioChangeHandler
  /** Callback when there is an error of any kind. */
  onError?: TTSErrorHandler
  /** Callback when speaking/audio starts playing. */
  onStart?: TTSEventHandler
  /** Callback when the speaking/audio is paused. */
  onPause?: TTSEventHandler
  /** Callback when a word boundary/mark has been reached. */
  onBoundary?: TTSBoundaryHandler
  /** Calback when the current utterance/audio has ended. */
  onEnd?: TTSEventHandler
  /** Function to call when the `SpeechSynthesis` API is not supported. */
  onNotSupported?: TTSFallback
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
interface ToggleMuteCallback {
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
  /** Whether speechSynthesis is supported. */
  isSynthSupported: boolean
  /** State of the current speaking/audio. */
  state: TTSHookState
  /** The text extracted from the children elements and used to synthesize speech. */
  spokenText: string
  play: () => Promise<void>
  stop: () => void
  pause: () => void
  replay: () => Promise<void>
  /** Toggles between muted/unmuted, i.e. volume is zero or non-zero. */
  toggleMute: (callback?: (wasMuted: boolean) => void) => Promise<void>
  /** Toggles between play/stop. */
  playOrStop: () => Promise<void>
  /** Toggles between play/pause. */
  playOrPause: () => Promise<void>
  /** The original children with a possible <mark> included if using `markTextAsSpoken`. */
  ttsChildren: ReactNode
}
/**
 * Creates highlighted text using render prop pattern instead of Children.map
 */
const createHighlightedContent = (
  children: ReactNode,
  text: string,
  boundary: TTSBoundaryUpdate,
  markTextAsSpoken: boolean,
  markColor?: string,
  markBackgroundColor?: string,
  renderProp?: TTSRenderProp
): ReactNode => {
  // If a render prop is provided, use it
  if (renderProp) {
    return renderProp({
      children,
      boundary,
      markTextAsSpoken,
      markColor,
      markBackgroundColor
    })
  }

  // If not marking text as spoken or no boundary word, return original children
  if (!markTextAsSpoken || !boundary.word || !children) {
    return children
  }

  // For simple text content, apply highlighting directly
  if (typeof children === 'string') {
    const { word, startChar, endChar } = boundary
    const prev = text.substring(0, startChar)
    const found = text.substring(startChar, endChar)
    const after = text.substring(endChar)

    if (found && stripPunctuation(found) === stripPunctuation(word)) {
      const Highlight = createElement(Highlighter, {
        text: found,
        mark: stripPunctuation(found),
        color: markColor,
        backgroundColor: markBackgroundColor
      })
      
      return createElement(
        Fragment,
        { key: `tts-${startChar}-${endChar}` },
        prev,
        Highlight,
        after
      )
    }
  }

  // For complex content, return as-is (highlighting would need custom render prop)
  return children
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
  }
}
const useTts = ({
  lang,
  rate,
  volume,
  voice,
  children,
  text,
  render,
  markColor,
  markBackgroundColor,
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
  autoPlay = false,
  markTextAsSpoken = false
}: TTSHookProps): TTSHookResponse => {
  const spokenTextRef = useRef<string>('')
  const handleNotSupported = onNotSupported || noop
  const isSynthSupported =
    typeof globalThis !== 'undefined' && 'speechSynthesis' in globalThis
  const [state, dispatch] = useReducer(reducer, {
    voices: isSynthSupported ? globalThis.speechSynthesis.getVoices() : [],
    boundary: defaultBoundary,
    isPlaying: false,
    isPaused: false,
    isMuted: false,
    isError: false,
    isReady: isSynthSupported && typeof fetchAudioData === 'undefined'
  })
  const [ttsChildren, spokenText] = useMemo(() => {
    // Use text prop if provided, otherwise extract from children
    const extractedText = text || (children ? extractTextFromChildren(children) : '')
    
    // Create highlighted content using the new approach
    const highlightedContent = createHighlightedContent(
      children || extractedText,
      extractedText,
      state.boundary,
      markTextAsSpoken,
      markColor,
      markBackgroundColor,
      render
    )

    spokenTextRef.current = extractedText.trim()

    return [highlightedContent, spokenTextRef.current]
  }, [children, text, state.boundary, markColor, markBackgroundColor, markTextAsSpoken, render])
  const controller = useMemo(
    () =>
      isSynthSupported
        ? new Controller({
            lang,
            voice,
            fetchAudioData
          })
        : new ControllerStub(),
    [lang, voice, isSynthSupported, fetchAudioData]
  )
  const play = useCallback(async () => {
    if (!isSynthSupported) {
      handleNotSupported()
    } else if (state.isPaused) {
      await controller.resume()
    } else {
      // Replay gives a more consistent/expected experience
      await controller.replay()
    }

    dispatch({ type: 'play' })
  }, [controller, state.isPaused, isSynthSupported, handleNotSupported])
  const pause = useCallback(() => {
    controller.pause()
    dispatch({ type: 'pause' })
  }, [controller])
  const replay = useCallback(async () => {
    await controller.replay()
    dispatch({ type: 'reset' })
  }, [controller])
  const stop = useCallback(() => {
    controller.cancel()

    dispatch({ type: 'stop' })
  }, [controller])
  const toggleMuteHandler = useCallback(
    async (callback?: ToggleMuteCallback) => {
      const wasMuted = parseFloat(controller.volume.toFixed(2)) === controller.volumeMin

      if (wasMuted) {
        await controller.unmute()
        dispatch({ type: 'unmuted' })
      } else {
        await controller.mute()
        dispatch({ type: 'muted' })
      }

      if (typeof callback === 'function') {
        callback(wasMuted)
      }
    },
    [controller]
  )
  const playOrPause = useCallback(async () => {
    if (!isSynthSupported) {
      handleNotSupported()
    } else if (state.isPlaying) {
      pause()
    } else {
      await play()
    }
  }, [state.isPlaying, isSynthSupported, handleNotSupported, pause, play])
  const playOrStop = useCallback(async () => {
    if (!isSynthSupported) {
      handleNotSupported()
    } else if (state.isPlaying) {
      stop()
    } else {
      await play()
    }
  }, [state.isPlaying, isSynthSupported, handleNotSupported, stop, play])
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
  // Controller event listeners
  const onStartHandler: TTSOnEvent = useCallback(
    (evt) => {
      dispatch({ type: 'play' })

      if (typeof onStart === 'function') {
        onStart(evt.detail)
      }
    },
    [onStart]
  )
  const onPauseHandler: TTSOnEvent = useCallback(
    (evt) => {
      if (typeof onPause === 'function') {
        onPause(evt.detail)
      }
    },
    [onPause]
  )
  const onEndHandler: TTSOnEvent = useCallback(
    (evt) => {
      dispatch({ type: 'end' })

      if (typeof onEnd === 'function') {
        onEnd(evt.detail)
      }
    },
    [onEnd]
  )
  const onReady = useCallback(() => {
    dispatch({ type: 'ready' })
  }, [])
  const onErrorHandler: TTSOnError = useCallback(
    (evt) => {
      dispatch({ type: 'error' })

      if (typeof onError === 'function') {
        onError(evt.detail)
      }
    },
    [onError]
  )
  const onBoundaryHandler: TTSOnBoundary = useCallback(
    (evt) => {
      dispatch({ type: 'boundary', payload: evt.detail.boundary })

      if (typeof onBoundary === 'function') {
        onBoundary(evt.detail.boundary, evt.detail.evt)
      }
    },
    [onBoundary]
  )
  const onVolume: TTSOnAudioChange = useCallback(
    (evt) => {
      const volume = evt.detail
      const min = controller.volumeMin

      if (volume === min && controller.volume !== min) {
        dispatch({ type: 'muted' })
      }

      if (volume !== min && controller.volume === min) {
        dispatch({ type: 'unmuted' })
      }

      if (typeof onVolumeChange === 'function') {
        onVolumeChange(volume)
      }
    },
    [onVolumeChange, controller]
  )
  const onPitch: TTSOnAudioChange = useCallback(
    (evt) => {
      if (typeof onPitchChange === 'function') {
        onPitchChange(evt.detail)
      }
    },
    [onPitchChange]
  )
  const onRate: TTSOnAudioChange = useCallback(
    (evt) => {
      if (typeof onRateChange === 'function') {
        onRateChange(evt.detail)
      }
    },
    [onRateChange]
  )

  useEffect(() => {
    controller.text = spokenText
  }, [spokenText, controller])

  useEffect(() => {
    if (rate && Number.isFinite(rate)) {
      controller.rate = rate
    }

    if (volume && Number.isFinite(volume)) {
      controller.volume = volume
    }
  }, [controller, rate, volume])

  useEffect(() => {
    const onBeforeUnload = () => {
      controller.cancel()
    }
    const initializeListeners = async () => {
      controller.addEventListener(Events.PLAYING, onStartHandler as EventListener)
      controller.addEventListener(Events.PAUSED, onPauseHandler as EventListener)
      controller.addEventListener(Events.END, onEndHandler as EventListener)
      controller.addEventListener(Events.ERROR, onErrorHandler as EventListener)
      controller.addEventListener(Events.READY, onReady)
      controller.addEventListener(Events.BOUNDARY, onBoundaryHandler as EventListener)
      controller.addEventListener(Events.VOLUME, onVolume as EventListener)
      controller.addEventListener(Events.PITCH, onPitch as EventListener)
      controller.addEventListener(Events.RATE, onRate as EventListener)
      globalThis.addEventListener('beforeunload', onBeforeUnload)

      await controller.init()
    }

    initializeListeners().catch((err) => {
      if (err instanceof Error) {
        // eslint-disable-next-line no-console
        console.error(err.message)
      }
    })

    return () => {
      globalThis.removeEventListener('beforeunload', onBeforeUnload)
      controller.removeEventListener(Events.PLAYING, onStartHandler as EventListener)
      controller.removeEventListener(Events.PAUSED, onPauseHandler as EventListener)
      controller.removeEventListener(Events.END, onEndHandler as EventListener)
      controller.removeEventListener(Events.ERROR, onErrorHandler as EventListener)
      controller.removeEventListener(Events.READY, onReady)
      controller.removeEventListener(Events.BOUNDARY, onBoundaryHandler as EventListener)
      controller.removeEventListener(Events.VOLUME, onVolume as EventListener)
      controller.removeEventListener(Events.PITCH, onPitch as EventListener)
      controller.removeEventListener(Events.RATE, onRate as EventListener)
    }
  }, [
    onStartHandler,
    onBoundaryHandler,
    onPauseHandler,
    onEndHandler,
    onReady,
    onErrorHandler,
    onBoundary,
    onVolume,
    onPitch,
    onRate,
    controller
  ])

  useEffect(() => {
    const handleAutoPlay = async () => {
      if (autoPlay) {
        if (!isSynthSupported) {
          handleNotSupported()
        } else if (state.isReady) {
          await controller.replay()
          dispatch({ type: 'play' })
        }
      }
    }

    handleAutoPlay().catch((err) => {
      if (err instanceof Error) {
        // eslint-disable-next-line no-console
        console.error(`Unable to auto play: ${err.message}`)
      }
    })
  }, [autoPlay, controller, state.isReady, isSynthSupported, handleNotSupported])

  useEffect(() => {
    const onVoicesChanged = () => {
      dispatch({ type: 'voices', payload: globalThis.speechSynthesis.getVoices() })
    }

    if (typeof globalThis.speechSynthesis?.addEventListener === 'function') {
      globalThis.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    }

    return () => {
      if (typeof globalThis.speechSynthesis?.removeEventListener === 'function') {
        globalThis.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
      }
    }
  }, [])

  return {
    get,
    set,
    state,
    spokenText,
    ttsChildren,
    isSynthSupported,
    play,
    stop,
    pause,
    replay,
    playOrStop,
    playOrPause,
    toggleMute: toggleMuteHandler
  }
}

export { useTts }
export type {
  TTSHookProps,
  TTSHookResponse,
  TTSHookState,
  TTSEventHandler,
  TTSErrorHandler,
  TTSBoundaryHandler,
  TTSAudioChangeHandler,
  TTSRenderProp
}
