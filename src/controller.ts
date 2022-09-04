import { isPunctuation } from './utils'

enum Events {
  END = 'end',
  ERROR = 'error',
  READY = 'ready',
  PAUSED = 'paused',
  PLAYING = 'playing',
  BOUNDARY = 'boundary'
}
interface PollySpeechMark {
  end: number
  start: number
  time: number
  type: string
  value: string
}
interface TTSBoundaryUpdate {
  word: string
  startChar: number
  endChar: number
}
interface TTSAudioData {
  audio: string
  marks?: PollySpeechMark[]
}
interface FetchAudioData {
  (text: string): Promise<TTSAudioData>
}
interface CustomBoundaryEventListener {
  (evt: CustomEvent<TTSBoundaryUpdate>): void
}
interface CustomErrorEventListener {
  (evt: CustomEvent<string>): void
}
interface ControllerOptions {
  text: string
  lang?: string
  voice?: SpeechSynthesisVoice
  dispatchBoundaries?: boolean
  fetchAudioData?: FetchAudioData
}
type Target = HTMLAudioElement | SpeechSynthesisUtterance
type Synthesizer = HTMLAudioElement | SpeechSynthesis

class Controller extends EventTarget {
  protected readonly text: string
  protected readonly target: Target
  protected readonly synthesizer: Synthesizer
  protected readonly dispatchBoundaries: boolean = false
  protected fetchAudioData: FetchAudioData
  protected marks: PollySpeechMark[] = []
  protected previousVolume = 1
  protected locale = ''

  constructor(options: ControllerOptions) {
    super()

    this.text = options.text
    this.locale = options?.lang ?? this.locale
    this.synthesizer = window.speechSynthesis
    this.target = new SpeechSynthesisUtterance(options.text)
    this.fetchAudioData = async () => ({ audio: '', marks: [] })
    this.dispatchBoundaries = options.dispatchBoundaries ?? this.dispatchBoundaries

    if (options.fetchAudioData) {
      this.target = this.synthesizer = new Audio()
      this.fetchAudioData = options.fetchAudioData
    } else {
      this.initWebSpeechVoice(options.voice)

      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          this.initWebSpeechVoice(options.voice)
        })
      }
    }
  }

  protected initWebSpeechVoice(voice?: SpeechSynthesisVoice): void {
    if (this.target instanceof SpeechSynthesisUtterance) {
      let voices = window.speechSynthesis.getVoices()

      if (voice) {
        this.target.voice = voice
      }

      if (this.locale) {
        voices = voices.filter((voice) => voice.lang === this.locale)
        this.target.voice = voices[0] ?? null

        if (voice && voice.lang === this.locale) {
          this.target.voice = voice
        }
      }
    }
  }

  protected async attachAudioSource(): Promise<void> {
    if (this.synthesizer instanceof HTMLAudioElement) {
      let data: TTSAudioData | null = null

      try {
        data = await this.fetchAudioData(this.text)
      } catch (err) {
        if (err instanceof Error) {
          this.dispatchError(err.message)
        }
      } finally {
        if (data?.audio) {
          this.synthesizer.src = data.audio
          this.marks = data.marks ?? this.marks
        }
      }
    }
  }

  protected dispatchEnd(): void {
    this.dispatchEvent(new Event(Events.END))
  }

  protected dispatchError(msg?: string): void {
    this.dispatchEvent(new CustomEvent(Events.ERROR, { detail: msg }))
  }

  protected dispatchReady(): void {
    this.dispatchEvent(new Event(Events.READY))
  }

  protected dispatchPlaying(): void {
    this.dispatchEvent(new Event(Events.PLAYING))
  }

  protected dispatchPaused(): void {
    this.dispatchEvent(new Event(Events.PAUSED))
  }

  protected dispatchBoundary(boundary: TTSBoundaryUpdate): void {
    this.dispatchEvent(new CustomEvent(Events.BOUNDARY, { detail: boundary }))
  }

  protected async playHtmlAudio(): Promise<void> {
    const audio = this.synthesizer as HTMLAudioElement

    try {
      await audio.play()
    } catch (err) {
      if (err instanceof Error) {
        this.dispatchError(err.message)
      }
    }
  }

  protected getPollySpeechMarkForAudioTime(time: number): PollySpeechMark {
    const length = this.marks.length
    let bestMatch = this.marks[0]
    let found = false
    let i = 1

    while (i < length && !found) {
      if (this.marks[i].time <= time) {
        bestMatch = this.marks[i]
      } else {
        found = true
      }

      i++
    }

    return bestMatch
  }

  /**
   * Not all browsers return `evt.charLength` on SpeechSynthesisUtterance `boundary` events.
   */
  protected getBoundaryWordCharLength(startIndex: number): number {
    const match = this.text.substring(startIndex).match(/.+?\b/)

    return match ? match[0].length : 0
  }

  get paused(): boolean {
    return this.synthesizer.paused
  }

  get rate(): number {
    if (this.synthesizer instanceof HTMLAudioElement) {
      return this.synthesizer.playbackRate
    }

    if (this.target instanceof SpeechSynthesisUtterance) {
      return this.target.rate
    }

    throw new Error(`[tts-react]: invalid controller instance.`)
  }

  set rate(value: number) {
    if (this.synthesizer instanceof HTMLAudioElement) {
      this.synthesizer.playbackRate = value
    }

    if (this.target instanceof SpeechSynthesisUtterance) {
      this.target.rate = value
    }
  }

  get pitch(): number {
    if (this.target instanceof SpeechSynthesisUtterance) {
      return this.target.pitch
    }

    throw new Error(`[tts-react]: can not read 'pitch' on HTMLAudioElement.`)
  }
  set pitch(value: number) {
    if (this.target instanceof SpeechSynthesisUtterance) {
      this.target.pitch = value
    }
  }

  get volume(): number {
    return this.target.volume
  }

  set volume(value: number) {
    this.target.volume = value
  }

  get preservesPitch(): boolean {
    if (this.synthesizer instanceof HTMLAudioElement) {
      const synth: HTMLAudioElement & { preservesPitch?: boolean } = this.synthesizer

      if (synth.preservesPitch) {
        return synth.preservesPitch
      }
    }

    return false
  }

  set preservesPitch(value: boolean) {
    if (this.synthesizer instanceof HTMLAudioElement) {
      /**
       * `preservesPitch` requires vendor-prefix on some browsers (Safari).
       * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1300
       */
      const synth: HTMLAudioElement & { preservesPitch?: boolean } = this.synthesizer

      if (synth.preservesPitch) {
        synth.preservesPitch = value
      }
    }
  }

  get lang(): string {
    return this.locale
  }

  set lang(value: string) {
    if (this.target instanceof SpeechSynthesisUtterance) {
      this.locale = value
      this.target.lang = value
      this.target.voice = null
      this.initWebSpeechVoice()
    }
  }

  init(): void {
    if (this.target instanceof SpeechSynthesisUtterance) {
      this.target.pitch = 1
      this.target.rate = 0.9
      this.target.volume = 1
      this.target.addEventListener('end', this.dispatchEnd.bind(this))
      this.target.addEventListener('start', this.dispatchPlaying.bind(this))
      this.target.addEventListener('resume', this.dispatchPlaying.bind(this))
      this.target.addEventListener('pause', this.dispatchPaused.bind(this))
      this.target.addEventListener('error', (evt) => {
        this.dispatchError(evt.error)
      })

      if (this.locale) {
        this.target.lang = this.locale
      }

      if (this.dispatchBoundaries) {
        this.target.addEventListener('boundary', (evt) => {
          const { charIndex: startChar } = evt
          const charLength = evt.charLength ?? this.getBoundaryWordCharLength(startChar)
          const endChar = startChar + charLength
          const word = this.text.substring(startChar, endChar)

          if (!isPunctuation(word)) {
            this.dispatchBoundary({ word, startChar, endChar })
          }
        })
      }

      this.dispatchReady()
    }

    if (this.target instanceof HTMLAudioElement) {
      const handleCanPlay = () => {
        this.dispatchReady()
        /**
         * Only dispatch ready event once per instance.
         * The 'canplay' event will fire multiple times throughout
         * the instances lifecycle depending on user action.
         *
         * We want to use this as an event to initialize the controls.
         */
        this.target.removeEventListener('canplay', handleCanPlay)
      }

      this.target.addEventListener('ended', this.dispatchEnd.bind(this))
      this.target.addEventListener('canplay', handleCanPlay)
      this.target.addEventListener('error', () => {
        const error = (this.target as HTMLAudioElement).error

        this.dispatchError(error?.message)
      })

      if (this.dispatchBoundaries) {
        this.target.addEventListener('timeupdate', () => {
          // Polly Speech Marks use milliseconds
          const currentTime = (this.target as HTMLAudioElement).currentTime * 1000
          const mark = this.getPollySpeechMarkForAudioTime(currentTime)

          if (!this.paused) {
            this.dispatchBoundary({
              word: mark.value,
              startChar: mark.start,
              endChar: mark.end
            })
          }
        })
      }

      this.attachAudioSource()
    }
  }

  play(): void {
    if (this.synthesizer instanceof HTMLAudioElement) {
      this.playHtmlAudio()
    } else {
      this.synthesizer.speak(this.target as SpeechSynthesisUtterance)
    }
  }

  pause(): void {
    this.synthesizer.pause()
  }

  mute(): void {
    this.previousVolume = this.volume
    this.volume = 0

    /**
     * There is no way to effectively mute an ongoing utterance.
     * Cancel the current utterance queue and restart the speaking.
     */
    if (!(this.synthesizer instanceof HTMLAudioElement)) {
      this.clear()

      if (!this.paused && this.synthesizer.speaking) {
        this.reset()
      }
    }
  }

  unmute(): void {
    this.volume = this.previousVolume ?? 1

    if (!(this.synthesizer instanceof HTMLAudioElement)) {
      this.clear()

      if (!this.paused && this.synthesizer.speaking) {
        this.reset()
      }
    }
  }

  resume(): void {
    if (this.synthesizer instanceof HTMLAudioElement) {
      this.playHtmlAudio()
    } else {
      this.synthesizer.resume()
    }
  }

  reset(): void {
    if (this.synthesizer instanceof HTMLAudioElement) {
      this.synthesizer.load()
      this.playHtmlAudio()
    } else {
      this.synthesizer.cancel()
      this.synthesizer.speak(this.target as SpeechSynthesisUtterance)
    }
  }

  clear(): void {
    if (this.synthesizer instanceof HTMLAudioElement) {
      this.synthesizer.pause()
      this.synthesizer.currentTime = 0
    } else {
      this.synthesizer.cancel()
    }
  }
}

export { Controller, Events }
export type {
  TTSAudioData,
  PollySpeechMark,
  ControllerOptions,
  TTSBoundaryUpdate,
  CustomBoundaryEventListener,
  CustomErrorEventListener
}
