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
  CustomErrorEventListener
} from './controller'
import { isStringOrNumber, stripPunctuation } from './utils'
import { Highlighter } from './highlighter'

interface MarkStyles {
  markColor?: string
  markBackgroundColor?: string
}
interface TTSHookProps extends MarkStyles {
  lang?: ControllerOptions['lang']
  autoPlay?: boolean
  children: ReactNode
  markTextAsSpoken?: boolean
  onMuted?: (muted: boolean) => void
  onError?: (errorMsg: string) => void
  fetchAudioData?: ControllerOptions['fetchAudioData']
  voice?: ControllerOptions['voice']
}
interface TTSHookState {
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
    | 'stop'
  payload?: TTSBoundaryUpdate
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
  onMuted: () => void
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
    case 'stop':
      return { ...state, isPlaying: false, isPaused: false, isError: false }
    case 'muted':
      return { ...state, isMuted: !state.isMuted }
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
  onMuted,
  fetchAudioData,
  autoPlay = false,
  markTextAsSpoken = false
}: TTSHookProps): TTSHookResponse => {
  const [state, dispatch] = useReducer(reducer, {
    boundary: defaultBoundary,
    isPlaying: false,
    isPaused: false,
    isMuted: false,
    isError: false,
    isReady: false
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

    return [parsed, buffer.text]
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
  const onMutedHandler = useCallback(() => {
    if (state.isMuted) {
      controller.unmute()
    } else {
      controller.mute()
    }

    if (typeof onMuted === 'function') {
      onMuted(state.isMuted)
    }

    dispatch({ type: 'muted' })
  }, [controller, state.isMuted, onMuted])
  const onPlayPause = useMemo(
    () => (state.isPlaying ? onPause : onPlay),
    [state.isPlaying, onPause, onPlay]
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

      if (autoPlay) {
        controller.play()
        dispatch({ type: 'play' })
      }
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
    const onBeforeUnload = () => {
      controller.clear()
    }

    controller.addEventListener(Events.END, onEnd)
    controller.addEventListener(Events.ERROR, onErrorHandler as EventListener)
    controller.addEventListener(Events.READY, onReady)
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
      window.removeEventListener('beforeunload', onBeforeUnload)
      controller.clear()
    }
  }, [controller, autoPlay, markTextAsSpoken, onError])

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
    onPlayPause,
    onMuted: onMutedHandler
  }
}

export { useTts }
export type { TTSHookProps, TTSHookResponse, TTSHookState }
