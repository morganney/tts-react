import { isPunctuation } from './utils.js'

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
interface ControllerOptions {
  lang?: string
  voice?: SpeechSynthesisVoice
  dispatchBoundaries?: boolean
  fetchAudioData?: FetchAudioData
}
type Target = HTMLAudioElement | SpeechSynthesisUtterance
type Synthesizer = HTMLAudioElement | SpeechSynthesis
type TTSEvent = SpeechSynthesisEvent | Event

class Controller extends EventTarget {
  #target: Target
  #synthesizer: Synthesizer
  #dispatchBoundaries = true
  #fetchAudioData: FetchAudioData = () => Promise.resolve({ audio: '', marks: [] })
  #marks: PollySpeechMark[] = []
  #text = ''
  #lang = ''
  #aborter = new AbortController()
  #initialized = false

  constructor(options?: ControllerOptions) {
    super()

    this.#lang = options?.lang ?? this.#lang
    this.#synthesizer = window.speechSynthesis
    this.#target = new SpeechSynthesisUtterance(this.#text)
    this.#dispatchBoundaries = options?.dispatchBoundaries ?? this.#dispatchBoundaries

    if (options?.fetchAudioData) {
      this.#target = this.#synthesizer = new Audio()
      this.#fetchAudioData = options.fetchAudioData
    } else {
      this.#initWebSpeechVoice(options?.voice)

      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.#initWebSpeechVoice(options?.voice)
        }
      }
    }
  }

  #initWebSpeechVoice(voice?: SpeechSynthesisVoice): void {
    if (this.#target instanceof SpeechSynthesisUtterance) {
      let voices = window.speechSynthesis.getVoices()

      if (voice) {
        this.#target.voice = voice
      }

      if (this.#lang) {
        voices = voices.filter((voice) => voice.lang === this.#lang)
        this.#target.voice = voices[0] ?? null

        if (voice && voice.lang === this.#lang) {
          this.#target.voice = voice
        }
      }
    }
  }

  async #attachAudioSource(): Promise<void> {
    if (this.#synthesizer instanceof HTMLAudioElement) {
      let data: TTSAudioData | null = null

      try {
        data = await this.#fetchAudioData(this.#text)
      } catch (err) {
        if (err instanceof Error) {
          this.#dispatchError(err.message)
        }
      } finally {
        if (data?.audio) {
          this.#synthesizer.src = data.audio
          this.#marks = data.marks ?? this.#marks
        }
      }
    }
  }

  #dispatchEnd(evt: TTSEvent): void {
    this.dispatchEvent(new CustomEvent(Events.END, { detail: evt }))
  }

  #dispatchError(msg?: string): void {
    this.dispatchEvent(new CustomEvent(Events.ERROR, { detail: msg }))
  }

  #dispatchReady(): void {
    this.dispatchEvent(new Event(Events.READY))
  }

  #dispatchPlaying(evt: TTSEvent): void {
    this.dispatchEvent(new CustomEvent(Events.PLAYING, { detail: evt }))
  }

  #dispatchPaused(evt: TTSEvent): void {
    this.dispatchEvent(new CustomEvent(Events.PAUSED, { detail: evt }))
  }

  #dispatchBoundary(evt: TTSEvent, boundary: TTSBoundaryUpdate): void {
    this.dispatchEvent(new CustomEvent(Events.BOUNDARY, { detail: { evt, boundary } }))
  }

  #dispatchVolume(volume: number): void {
    this.dispatchEvent(new CustomEvent(Events.VOLUME, { detail: volume }))
  }

  #dispatchRate(rate: number): void {
    this.dispatchEvent(new CustomEvent(Events.RATE, { detail: rate }))
  }

  #dispatchPitch(pitch: number): void {
    this.dispatchEvent(new CustomEvent(Events.PITCH, { detail: pitch }))
  }

  async #playHtmlAudio(): Promise<void> {
    const audio = this.#synthesizer as HTMLAudioElement

    try {
      await audio.play()
    } catch (err) {
      if (err instanceof Error) {
        this.#dispatchError(err.message)
      }
    }
  }

  #getPollySpeechMarkForAudioTime(time: number): PollySpeechMark {
    const length = this.#marks.length
    let bestMatch = this.#marks[0]
    let found = false
    let i = 1

    while (i < length && !found) {
      if (this.#marks[i].time <= time) {
        bestMatch = this.#marks[i]
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
  #getBoundaryWordCharLength(startIndex: number): number {
    const match = this.#text.substring(startIndex).match(/.+?\b/)

    return match ? match[0].length : 0
  }

  #clamp(value: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(value, max))
  }

  /**
   * Removes registered listeners and creates new abort controller.
   */
  #recycle(): AbortSignal {
    this.#aborter.abort()
    this.#aborter = new AbortController()

    return this.#aborter.signal
  }

  #utteranceInit(): void {
    if (this.#target instanceof SpeechSynthesisUtterance) {
      const signal = this.#recycle()

      this.#target.addEventListener('end', this.#dispatchEnd.bind(this), { signal })
      this.#target.addEventListener('start', this.#dispatchPlaying.bind(this), { signal })
      this.#target.addEventListener('resume', this.#dispatchPlaying.bind(this), {
        signal
      })
      this.#target.addEventListener('pause', this.#dispatchPaused.bind(this), { signal })
      this.#target.addEventListener(
        'error',
        (evt) => {
          this.#dispatchError(evt.error)
        },
        { signal }
      )

      if (this.#lang) {
        this.#target.lang = this.#lang
      }

      if (this.#dispatchBoundaries) {
        this.#target.addEventListener(
          'boundary',
          (evt) => {
            const { charIndex: startChar } = evt
            const charLength =
              evt.charLength ?? this.#getBoundaryWordCharLength(startChar)
            const endChar = startChar + charLength
            const word = this.#text.substring(startChar, endChar)

            if (word && !isPunctuation(word)) {
              this.#dispatchBoundary(evt, { word, startChar, endChar })
            }
          },
          { signal }
        )
      }

      this.#dispatchReady()
    }
  }

  async #htmlAudioInit(): Promise<void> {
    if (this.#target instanceof HTMLAudioElement) {
      const target = this.#target

      this.#target.addEventListener('canplay', this.#dispatchReady.bind(this), {
        once: true
      })
      this.#target.addEventListener('playing', this.#dispatchPlaying.bind(this))
      this.#target.addEventListener('pause', this.#dispatchPaused.bind(this))
      this.#target.addEventListener('ended', this.#dispatchEnd.bind(this))
      this.#target.addEventListener('error', () => {
        const error = target.error

        this.#dispatchError(error?.message)
      })

      if (this.#dispatchBoundaries) {
        this.#target.addEventListener('timeupdate', (evt) => {
          // Polly Speech Marks use milliseconds
          const currentTime = target.currentTime * 1000
          const mark = this.#getPollySpeechMarkForAudioTime(currentTime)

          if (mark && !this.paused) {
            this.#dispatchBoundary(evt, {
              word: mark.value,
              startChar: mark.start,
              endChar: mark.end
            })
          }
        })
      }

      await this.#attachAudioSource()
    }
  }

  get synthesizer(): Synthesizer {
    return this.#synthesizer
  }

  get target(): Target {
    return this.#target
  }

  set text(value: string) {
    this.#text = value

    if (this.#target instanceof SpeechSynthesisUtterance) {
      this.#target.text = value
    }
  }

  get paused(): boolean {
    return this.#synthesizer.paused
  }

  get rate(): number {
    if (this.#synthesizer instanceof HTMLAudioElement) {
      return this.#synthesizer.playbackRate
    }

    return (this.#target as SpeechSynthesisUtterance).rate
  }

  set rate(value: number) {
    const clamped = this.#clamp(parseFloat(value.toPrecision(3)), 0.1, 10)

    if (!Number.isNaN(clamped)) {
      this.#dispatchRate(clamped)

      if (this.#synthesizer instanceof HTMLAudioElement) {
        this.#synthesizer.defaultPlaybackRate = clamped
        this.#synthesizer.playbackRate = clamped
      }

      if (this.#target instanceof SpeechSynthesisUtterance) {
        this.#target.rate = clamped
      }
    }
  }

  get pitch(): number {
    if (this.#target instanceof SpeechSynthesisUtterance) {
      return this.#target.pitch
    }

    // Not supported by HTMLAudioElement
    return -1
  }

  set pitch(value: number) {
    if (this.#target instanceof SpeechSynthesisUtterance) {
      const clamped = this.#clamp(parseFloat(value.toPrecision(2)), 0, 2)

      if (!Number.isNaN(clamped)) {
        this.#dispatchPitch(clamped)
        this.#target.pitch = clamped
      }
    }
  }

  get volumeMin(): number {
    return 0
  }

  get volumeMax(): number {
    return 1
  }

  get volume(): number {
    return this.#target.volume
  }

  set volume(value: number) {
    const clamped = this.#clamp(
      parseFloat(value.toPrecision(2)),
      this.volumeMin,
      this.volumeMax
    )

    if (!Number.isNaN(clamped)) {
      this.#dispatchVolume(clamped)
      this.#target.volume = clamped
    }
  }

  get preservesPitch(): boolean {
    if (this.#synthesizer instanceof HTMLAudioElement) {
      return (this.#synthesizer as HTMLAudioElement & { preservesPitch: boolean })
        .preservesPitch
    }

    return false
  }

  set preservesPitch(value: boolean) {
    /**
     * `preservesPitch` requires vendor-prefix on some browsers (Safari).
     * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1300
     */
    if (this.#synthesizer instanceof HTMLAudioElement) {
      ;(
        this.#synthesizer as HTMLAudioElement & { preservesPitch: boolean }
      ).preservesPitch = value
    }
  }

  get lang(): string {
    return this.#lang
  }

  set lang(value: string) {
    if (this.#target instanceof SpeechSynthesisUtterance) {
      this.#lang = value
      this.#target.lang = value
      this.#target.voice = null
      this.#initWebSpeechVoice()
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
    if (!this.#initialized) {
      if (this.#target instanceof SpeechSynthesisUtterance) {
        this.#utteranceInit()
      }

      if (this.#target instanceof HTMLAudioElement) {
        await this.#htmlAudioInit()
      }

      this.#initialized = true
    }
  }

  async play(): Promise<void> {
    if (this.#synthesizer instanceof HTMLAudioElement) {
      await this.#playHtmlAudio()
    } else {
      this.#synthesizer.speak(this.#target as SpeechSynthesisUtterance)
    }
  }

  pause(): void {
    this.#synthesizer.pause()
  }

  async resume(): Promise<void> {
    if (this.#synthesizer instanceof HTMLAudioElement) {
      await this.#playHtmlAudio()
    } else {
      this.#synthesizer.resume()
    }
  }

  async replay(): Promise<void> {
    if (this.#synthesizer instanceof HTMLAudioElement) {
      this.#synthesizer.load()
      await this.#playHtmlAudio()
    } else {
      // Take out of any paused state
      this.#synthesizer.resume()
      // Drop all utterances in the queue
      this.#synthesizer.cancel()
      // Start speaking from the beginning
      this.#synthesizer.speak(this.#target as SpeechSynthesisUtterance)
    }
  }

  cancel(): void {
    if (this.#synthesizer instanceof HTMLAudioElement) {
      this.#synthesizer.load()
    } else {
      this.#synthesizer.cancel()
    }
  }

  async mute() {
    this.volume = 0

    /**
     * There is no way to effectively mute an ongoing utterance for SpeechSynthesis.
     * If there is currently an utterance being spoken, replay to activate the muting instantly.
     */
    if (
      !(this.#synthesizer instanceof HTMLAudioElement) &&
      !this.paused &&
      this.#synthesizer.speaking
    ) {
      await this.replay()
    }
  }

  async unmute(volume?: number) {
    this.volume = volume ?? 1

    /**
     * Same as muting, for SpeechSynthesis have to replay to activate the volume change instantly.
     */
    if (
      !(this.#synthesizer instanceof HTMLAudioElement) &&
      !this.paused &&
      this.#synthesizer.speaking
    ) {
      await this.replay()
    }
  }
}

export { Controller, Events }
export type {
  TTSAudioData,
  PollySpeechMark,
  ControllerOptions,
  TTSBoundaryUpdate,
  TTSEvent
}
