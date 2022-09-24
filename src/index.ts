export { TextToSpeech, Positions, Sizes } from './component'
export { useTts } from './hook'
export { LanguageTags } from './languageTags'

export type { TTSProps } from './component'
export type {
  TTSHookProps,
  TTSHookResponse,
  TTSHookState,
  TTSEventHandler,
  TTSBoundaryHandler,
  TTSAudioChangeHandler,
  TTSErrorHandler
} from './hook'
export type { TTSBoundaryUpdate, TTSAudioData, PollySpeechMark } from './controller'
