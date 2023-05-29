export { TextToSpeech, Positions, Sizes } from './component.js'
export { useTts } from './hook.js'
export { LanguageTags } from './languageTags.js'

export type { TTSProps } from './component.js'
export type {
  TTSHookProps,
  TTSHookResponse,
  TTSHookState,
  TTSEventHandler,
  TTSBoundaryHandler,
  TTSAudioChangeHandler,
  TTSErrorHandler
} from './hook.js'
export type { TTSBoundaryUpdate, TTSAudioData, PollySpeechMark } from './controller.js'
