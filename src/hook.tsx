import {
  useRef,
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
import type { ControllerOptions, TTSBoundaryUpdate, TTSEvent } from './controller'
import { isStringOrNumber, stripPunctuation } from './utils'
import { Highlighter } from './highlighter'

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
interface TTSHookProps extends MarkStyles {
  /** The spoken text is extracted from here. */
  children: ReactNode
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
  /** State of the current speaking/audio. */
  state: TTSHookState
  /** The text extracted from the children elements and used to synthesize speech. */
  spokenText: string
  play: () => void
  stop: () => void
  pause: () => void
  replay: () => void
  /** Toggles between muted/unmuted, i.e. volume is zero or non-zero. */
  toggleMute: (callback?: (wasMuted: boolean) => void) => void
  /** Toggles between play/stop. */
  playOrStop: () => void
  /** Toggles between play/pause. */
  playOrPause: () => void
  /** The original children with a possible <mark> included if using `markTextAsSpoken`. */
  ttsChildren: ReactNode
}
interface TextBuffer {
  text: string
}
interface ParseChildrenProps extends MarkStyles {
  children: ReactNode
  buffer: TextBuffer
  boundary: TTSBoundaryUpdate
  markTextAsSpoken: boolean
}

const parseChildrenRecursively = ({
  children,
  buffer,
  boundary,
  markColor,
  markBackgroundColor,
  markTextAsSpoken
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
          markTextAsSpoken,
          children: child.props.children
        })
      })
    }

    if (isStringOrNumber(child)) {
      const text = (child as string | number).toString()
      const { word, startChar, endChar } = boundary
      const bufferTextLength = buffer.text.length

      buffer.text += `${text} `

      if (markTextAsSpoken && word) {
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
  }
}
const useTts = ({
  lang,
  rate,
  volume,
  voice,
  children,
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
  fetchAudioData,
  autoPlay = false,
  markTextAsSpoken = false
}: TTSHookProps): TTSHookResponse => {
  const spokenTextRef = useRef<string>()
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
    if (typeof spokenTextRef.current === 'undefined' || markTextAsSpoken) {
      const buffer: TextBuffer = { text: '' }
      const parsed = parseChildrenRecursively({
        children,
        buffer,
        markColor,
        markBackgroundColor,
        markTextAsSpoken,
        boundary: state.boundary
      })

      spokenTextRef.current = buffer.text.trim()

      return [parsed, spokenTextRef.current]
    }

    return [children, spokenTextRef.current]
  }, [children, state.boundary, markColor, markBackgroundColor, markTextAsSpoken])
  const controller = useMemo(
    () =>
      new Controller({
        lang,
        voice,
        fetchAudioData
      }),
    [lang, voice, fetchAudioData]
  )
  const play = useCallback(async () => {
    if (state.isPaused) {
      controller.resume()
    } else {
      // Replay gives a more consistent/expected experience
      controller.replay()
    }

    dispatch({ type: 'play' })
  }, [controller, state.isPaused])
  const pause = useCallback(() => {
    controller.pause()
    dispatch({ type: 'pause' })
  }, [controller])
  const replay = useCallback(() => {
    controller.replay()
    dispatch({ type: 'reset' })
  }, [controller])
  const stop = useCallback(() => {
    controller.cancel()

    dispatch({ type: 'stop' })
  }, [controller])
  const toggleMuteHandler = useCallback(
    (callback?: ToggleMuteCallback) => {
      const wasMuted = controller.volume === 0

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
    [controller]
  )
  const playOrPause = useMemo(
    () => (state.isPlaying ? pause : play),
    [state.isPlaying, pause, play]
  )
  const playOrStop = useMemo(
    () => (state.isPlaying ? stop : play),
    [state.isPlaying, stop, play]
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

      if (volume === 0 && controller.volume !== 0) {
        dispatch({ type: 'muted' })
      }

      if (volume !== 0 && controller.volume === 0) {
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
      window.addEventListener('beforeunload', onBeforeUnload)

      await controller.init()
    }

    initializeListeners()

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
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
    if (autoPlay && state.isReady) {
      controller.replay()
      dispatch({ type: 'play' })
    }
  }, [autoPlay, controller, state.isReady, spokenText])

  useEffect(() => {
    const onVoicesChanged = () => {
      dispatch({ type: 'voices', payload: window.speechSynthesis.getVoices() })
    }

    if (typeof window.speechSynthesis?.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    }

    return () => {
      if (typeof window.speechSynthesis?.removeEventListener === 'function') {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
      }
    }
  }, [])

  return {
    get,
    set,
    state,
    spokenText,
    ttsChildren,
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
  TTSAudioChangeHandler
}
