import { isPunctuation } from './utils'

enum Events {
  BOUNDARY = 'boundary',
  END = 'end',
  ERROR = 'error',
  PAUSED = 'paused',
  PITCH = 'pitch',
  PLAYING = 'playing',
  RATE = 'rate',
  READY = 'ready',
  VOLUME = 'volume'
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
interface CustomNumberEventListener {
  (evt: CustomEvent<number>): void
}
interface ControllerOptions {
  lang?: string
  voice?: SpeechSynthesisVoice
  dispatchBoundaries?: boolean
  fetchAudioData?: FetchAudioData
}
type Target = HTMLAudioElement | SpeechSynthesisUtterance
type Synthesizer = HTMLAudioElement | SpeechSynthesis

class Controller extends EventTarget {
  protected readonly target: Target
  protected readonly synthesizer: Synthesizer
  protected readonly dispatchBoundaries: boolean = false
  protected fetchAudioData: FetchAudioData
  protected marks: PollySpeechMark[] = []
  protected text = ''
  protected locale = ''
  protected initialized = false

  constructor(options?: ControllerOptions) {
    super()

    this.locale = options?.lang ?? this.locale
    this.synthesizer = window.speechSynthesis
    this.target = new SpeechSynthesisUtterance(this.text)
    this.fetchAudioData = async () => ({ audio: '', marks: [] })
    this.dispatchBoundaries = options?.dispatchBoundaries ?? this.dispatchBoundaries

    if (options?.fetchAudioData) {
      this.target = this.synthesizer = new Audio()
      this.fetchAudioData = options.fetchAudioData
    } else {
      this.initWebSpeechVoice(options?.voice)

      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initWebSpeechVoice(options?.voice)
        }
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

  protected dispatchVolume(volume: number): void {
    this.dispatchEvent(new CustomEvent(Events.VOLUME, { detail: volume }))
  }

  protected dispatchRate(rate: number): void {
    this.dispatchEvent(new CustomEvent(Events.RATE, { detail: rate }))
  }

  protected dispatchPitch(pitch: number): void {
    this.dispatchEvent(new CustomEvent(Events.PITCH, { detail: pitch }))
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

  protected clamp(value: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(value, max))
  }

  get synth(): Synthesizer {
    return this.synthesizer
  }

  get utter(): Target {
    if (this.target instanceof SpeechSynthesisUtterance) {
      return this.target
    }

    return this.target as HTMLAudioElement
  }

  set spokenText(value: string) {
    this.text = value

    if (this.target instanceof SpeechSynthesisUtterance) {
      this.target.text = value
    }
  }

  get paused(): boolean {
    return this.synthesizer.paused
  }

  get rate(): number {
    if (this.synthesizer instanceof HTMLAudioElement) {
      return this.synthesizer.playbackRate
    }

    return (this.target as SpeechSynthesisUtterance).rate
  }

  set rate(value: number) {
    const clamped = this.clamp(parseFloat(value.toPrecision(3)), 0.1, 10)

    if (!Number.isNaN(clamped)) {
      if (this.synthesizer instanceof HTMLAudioElement) {
        this.synthesizer.playbackRate = clamped
      }

      if (this.target instanceof SpeechSynthesisUtterance) {
        this.target.rate = clamped
      }

      this.dispatchRate(clamped)
    }
  }

  get pitch(): number {
    if (this.target instanceof SpeechSynthesisUtterance) {
      return this.target.pitch
    }

    // Not supported by HTMLAudioElement
    return -1
  }

  set pitch(value: number) {
    if (this.target instanceof SpeechSynthesisUtterance) {
      const clamped = this.clamp(parseFloat(value.toPrecision(2)), 0, 2)

      if (!Number.isNaN(clamped)) {
        this.target.pitch = clamped
        this.dispatchPitch(clamped)
      }
    }
  }

  get volume(): number {
    return this.target.volume
  }

  set volume(value: number) {
    const clamped = this.clamp(parseFloat(value.toPrecision(2)))

    if (!Number.isNaN(clamped)) {
      this.target.volume = clamped
      this.dispatchVolume(clamped)
    }
  }

  get preservesPitch(): boolean {
    if (this.synthesizer instanceof HTMLAudioElement) {
      return (this.synthesizer as HTMLAudioElement & { preservesPitch: boolean })
        .preservesPitch
    }

    return false
  }

  set preservesPitch(value: boolean) {
    /**
     * `preservesPitch` requires vendor-prefix on some browsers (Safari).
     * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1300
     */
    if (this.synthesizer instanceof HTMLAudioElement) {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;(
        this.synthesizer as HTMLAudioElement & { preservesPitch: boolean }
      ).preservesPitch = value
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

  /**
   * Allows listeners for controller events to be registered
   * before instances start firing events related to underlying API's,
   * for instance in a useEffect block.
   *
   * Run it as async to allow for the fetchAudioData call to be awaited.
   */
  async init(): Promise<void> {
    if (!this.initialized) {
      if (this.target instanceof SpeechSynthesisUtterance) {
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
        this.target.addEventListener('ended', this.dispatchEnd.bind(this))
        this.target.addEventListener('canplay', this.dispatchReady.bind(this), {
          once: true
        })
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

      this.initialized = true
    }
  }

  async play(): Promise<void> {
    if (this.synthesizer instanceof HTMLAudioElement) {
      await this.playHtmlAudio()
    } else {
      this.synthesizer.speak(this.target as SpeechSynthesisUtterance)
    }
  }

  pause(): void {
    this.synthesizer.pause()
  }

  mute(): void {
    this.volume = 0

    /**
     * There is no way to effectively mute an ongoing utterance for SpeechSynthesis.
     * If there is currently an utterance being spoken, reset to activate the muting.
     */
    if (
      !(this.synthesizer instanceof HTMLAudioElement) &&
      !this.paused &&
      this.synthesizer.speaking
    ) {
      this.reset()
    }
  }

  unmute(volume?: number): void {
    this.volume = volume ?? 1

    /**
     * Same as muting, for SpeechSynthesis have to reset to activate the volume change.
     */
    if (
      !(this.synthesizer instanceof HTMLAudioElement) &&
      !this.paused &&
      this.synthesizer.speaking
    ) {
      this.reset()
    }
  }

  async resume(): Promise<void> {
    if (this.synthesizer instanceof HTMLAudioElement) {
      await this.playHtmlAudio()
    } else {
      this.synthesizer.resume()
    }
  }

  async reset(): Promise<void> {
    if (this.synthesizer instanceof HTMLAudioElement) {
      this.synthesizer.load()
      await this.playHtmlAudio()
    } else {
      // Take out of any paused state
      this.synthesizer.resume()
      // Drop all utterances in the queue
      this.synthesizer.cancel()
      // Starat speaking from the beginning
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
  CustomErrorEventListener,
  CustomNumberEventListener
}
