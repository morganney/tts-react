import type { Meta, StoryFn } from '@storybook/react'
import { faker } from '@faker-js/faker'
import { useRef, useState, useEffect, useCallback } from 'react'
import type { ChangeEventHandler, ChangeEvent, ReactNode } from 'react'
import parse from 'html-react-parser'

import { Child } from './child'
import { audiosrc } from './assets'
import {
  TextToSpeech,
  Positions,
  Sizes,
  useTts,
  TTSAudioData,
  TTSHookResponse
} from 'tts-react'
import type { TTSHookProps, TTSEventHandler } from 'tts-react'

type SpeakProps = Pick<TTSHookProps, 'children'>
let voices: SpeechSynthesisVoice[] = []

if (window.speechSynthesis) {
  voices = window.speechSynthesis.getVoices()

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices()
    }
  }
}
const capitalize = (text: string) => {
  return `${text[0].toUpperCase()}${text.substring(1)}`
}
const Label = ({ children }: { children: ReactNode }) => {
  return <label style={{ display: 'inline-flex' }}>{children}</label>
}
const fetchAudioData = () =>
  new Promise<TTSAudioData>((resolve) => {
    setTimeout(() => {
      resolve({
        marks: [
          { time: 6, type: 'word', start: 0, end: 3, value: 'You' },
          { time: 126, type: 'word', start: 4, end: 7, value: 'can' },
          { time: 292, type: 'word', start: 8, end: 11, value: 'use' },
          { time: 495, type: 'word', start: 12, end: 18, value: 'Amazon' },
          { time: 936, type: 'word', start: 19, end: 24, value: 'Polly' },
          { time: 1314, type: 'word', start: 25, end: 29, value: 'with' },
          { time: 1481, type: 'word', start: 30, end: 45, value: 'fetchAudioData' }
        ],
        audio: audiosrc
      })
    }, 1000)
  })
const RandomSentence: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args}>
      {`${faker.random.words(3)}, `}
      {`${faker.random.words(6)}.`}
    </TextToSpeech>
  )
}
const Sentence: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args}>
      <p>Converting text to speech with React!</p>
    </TextToSpeech>
  )
}
const Languages: StoryFn<typeof TextToSpeech> = (args) => {
  const toLocales = (voices: SpeechSynthesisVoice[]) =>
    Array.from(new Set(voices.map((voice) => voice.lang)))
  const [locales, setLocales] = useState(() =>
    toLocales(window.speechSynthesis?.getVoices() ?? [])
  )
  const [lang, setLang] = useState<string | undefined>()
  const [disabled, setDisabled] = useState(false)
  const onStart: TTSEventHandler = useCallback(() => {
    setDisabled(true)
  }, [])
  const onEnd: TTSEventHandler = useCallback(() => {
    setDisabled(false)
  }, [])

  useEffect(() => {
    if (!voices.length) {
      voices = window.speechSynthesis?.getVoices()
      setLocales(toLocales(voices))
    }
  }, [])

  return (
    <>
      <p>
        When <code>voice</code> is not set, the browser will fallback to the most suitable
        voice for the provided <code>lang</code>. If neither is set, the default will be
        the <code>&lt;html&nbsp;lang&gt;</code> value, or the user agent&apos;s default.
      </p>
      <label>
        <select
          value={lang}
          disabled={disabled}
          onChange={(evt) => {
            setLang(voices.find((voice) => voice.lang === evt.target.value)?.lang)
          }}>
          <option>-- Select a locale --</option>
          {locales.map((locale) => (
            <option key={locale}>{locale}</option>
          ))}
        </select>
      </label>
      <p style={{ marginTop: 0 }}>
        <small>
          <em>(Some voices may create skewed word boundaries for the given text.)</em>
        </small>
      </p>
      <TextToSpeech {...args} lang={lang} onStart={onStart} onEnd={onEnd}>
        The voice should sound appropriate to the selected locale.
      </TextToSpeech>
    </>
  )
}
const LangES_ES: StoryFn<typeof TextToSpeech> = (args) => {
  const esVoices = voices.filter((voice) => voice.lang === 'es-ES')
  const voice = esVoices.find((voice) => voice.name === 'Monica') ?? esVoices[0]

  return (
    <TextToSpeech {...args} lang="es-ES" voice={voice}>
      <p>¿Hola, cómo estás hoy?</p>
    </TextToSpeech>
  )
}
const Android: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args} useStopOverPause>
      <p>
        On Android <code>SpeechSynthesis.pause()</code> behaves like <code>cancel()</code>
        . <code>useStopOverPause</code> changes the component&apos;s pause control to a
        stop as shown here.
      </p>
    </TextToSpeech>
  )
}
const ImageText: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args}>
      <figure style={{ textAlign: 'center' }}>
        <img
          src={
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'
          }
          style={{ height: '92px' }}
          alt="Google's logo"
        />
        <figcaption>Google is evil (some say).</figcaption>
      </figure>
    </TextToSpeech>
  )
}
const RandomText: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args}>
      {Array.from({ length: 3 }, (v, i) => i).map((item) => (
        <p key={item}>
          {`${capitalize(faker.random.words(4))}, `}
          {`${faker.random.words(6)}. `}
          {`${capitalize(faker.random.words(5))}. `}
        </p>
      ))}
    </TextToSpeech>
  )
}
const SpeakComponent: StoryFn<typeof TextToSpeech> = (args) => {
  const Speak = ({ children }: SpeakProps) => (
    <>
      {
        useTts({ ...args, children, autoPlay: !window.location.search.includes('docs') })
          .ttsChildren
      }
    </>
  )

  return (
    <Speak>
      <p>This text will be spoken with words marked on render.</p>
    </Speak>
  )
}
const Hook: StoryFn<typeof TextToSpeech> = (args) => {
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [voices, setVoices] = useState(window.speechSynthesis?.getVoices() ?? [])
  const [voice, setVoice] = useState<SpeechSynthesisVoice | undefined>()
  const prevVolume = useRef(volume)
  const {
    ttsChildren,
    state,
    set,
    play,
    pause,
    replay,
    stop,
    toggleMute
  }: TTSHookResponse = useTts({
    ...args,
    voice,
    children: 'The hook can be used to create custom controls.'
  })
  const onMuteChanged = useCallback(() => {
    toggleMute((wasMuted) => {
      setVolume(wasMuted ? prevVolume.current : 0)
      set.volume(wasMuted ? prevVolume.current : 0)
    })
  }, [toggleMute, set])
  const onSelectVoice = useCallback(
    (evt: ChangeEvent<HTMLSelectElement>) => {
      setVoice(voices.find((voice) => voice.name === evt.target.value))
      set.volume(1)
      setVolume(1)
      set.rate(1)
      setRate(1)
      set.pitch(1)
      setPitch(1)
    },
    [set, voices]
  )
  const onVolumeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => {
      const volume = parseFloat(evt.target.value)

      set.volume(volume)
      setVolume(volume)
      prevVolume.current = volume
    },
    [set]
  )
  const onRateHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => {
      const rate = parseFloat(evt.target.value)

      set.rate(rate)
      setRate(rate)
    },
    [set]
  )
  const onPitchHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => {
      const pitch = parseFloat(evt.target.value)

      set.pitch(pitch)
      setPitch(pitch)
    },
    [set]
  )

  useEffect(() => {
    if (state.voices) {
      setVoices(state.voices)
    }
  }, [state.voices])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {voices.length > 0 ? (
        <>
          <small>
            <em>Some voices may create skewed word boundaries for the given text.</em>
          </small>
          <label>
            <select
              disabled={state.isPlaying}
              value={voice?.name}
              onChange={onSelectVoice}>
              <option>-- Select a voice --</option>
              {voices.map(({ name, lang }) => (
                <option key={name} value={name}>
                  {name} [{lang}]
                </option>
              ))}
            </select>
          </label>
        </>
      ) : typeof window.speechSynthesis !== 'undefined' ? (
        <p>
          Click&nbsp;
          <button onClick={() => setVoices(window.speechSynthesis.getVoices())}>
            load
          </button>
          &nbsp;to select speech synthesis voices.
        </p>
      ) : (
        <p>
          <strong>Your browser does not support SpeechSynthesis</strong>
        </p>
      )}
      <div style={{ display: 'flex', gap: '5px' }}>
        <button disabled={state.isPlaying} onClick={play}>
          Play
        </button>
        <button disabled={!state.isPlaying} onClick={pause}>
          Pause
        </button>
        <button onClick={stop}>Stop</button>
        <button onClick={replay}>Replay</button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          marginTop: '15px'
        }}>
        <label>
          Mute:{' '}
          <input disabled={state.isPlaying} type="checkbox" onChange={onMuteChanged} />
        </label>
        <Label>
          <span style={{ width: 70 }}>Volume:</span>
          <input
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            value={volume}
            disabled={state.isPlaying}
            onChange={onVolumeHandler}
          />
        </Label>
        <Label>
          <span style={{ width: 70 }}>Rate:</span>
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            defaultValue="1"
            disabled={state.isPlaying}
            onChange={onRateHandler}
          />
          <span>{rate}</span>
        </Label>
        <Label>
          <span style={{ width: 70 }}>Pitch:</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            defaultValue="1"
            disabled={state.isPlaying}
            onChange={onPitchHandler}
          />
          <span>{pitch}</span>
        </Label>
      </div>
      <p>{ttsChildren}</p>
    </div>
  )
}
const Component: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args}>
      <div>
        <p style={{ margin: 0 }}>During their day, workers in this cluster might:</p>
        <ul style={{ marginBottom: 0 }}>
          <li>Work with my hands and learn that way.</li>
          <li>Put things together.</li>
          <li>Do routine, organized and accurate work.</li>
          <li>Perform activities that produce tangible results.</li>
          <li>Apply math to work out solutions.</li>
          <li>Use hand and power tools and operate equipment/machinery.</li>
          <li>Visualize objects in three dimensions.</li>
        </ul>
      </div>
    </TextToSpeech>
  )
}
const DangerouslySetInnerHTML: StoryFn<typeof TextToSpeech> = (args) => {
  const html = '<ul><li>one</li><li>two</li><li>three</li></ul>'

  return (
    <>
      <p>
        <code>tts-react</code> does not support speaking text from{' '}
        <code>dangerouslySetInnerHTML</code> content. Instead use an html-to-react parser
        and avoid using <code>dangerouslySetInnerHTML</code>.
      </p>
      <p>For example:</p>
      <pre style={{ color: 'green' }}>
        import parse from &apos;html-react-parser&apos;
        <br />
        <br />
        const html =
        &apos;&lt;ul&gt;&lt;li&gt;one&lt;/li&gt;&lt;li&gt;two&lt;/li&gt;&lt;li&gt;three&lt;/li&gt;&lt;/ul&gt;&apos;
        <br />
        <br />
        &lt;TextToSpeech markTextAsSpoken&gt;&#123;parse(html)&#125;&lt;/TextToSpeech&gt;
      </pre>
      <TextToSpeech {...args}>{parse(html)}</TextToSpeech>
    </>
  )
}
const ErrorExample: StoryFn<typeof TextToSpeech> = (args) => {
  const fetchAudioData = () =>
    Promise.resolve({
      marks: [],
      audio: 'ata:audio/mpeg;base64,S'
    })

  return (
    <TextToSpeech {...args} fetchAudioData={fetchAudioData}>
      Check the &apos;Actions&apos; tab for the error.
    </TextToSpeech>
  )
}
const AmazonPollyHook: StoryFn<typeof TextToSpeech> = (args) => {
  const children = (
    <p>
      You can use Amazon Polly with <code>fetchAudioData</code>.
    </p>
  )
  const { state, ttsChildren, play, pause, stop, replay } = useTts({
    ...args,
    children,
    fetchAudioData
  })

  if (!state.isReady) {
    return <p>Loading data...</p>
  }

  return (
    <>
      <button disabled={state.isPlaying} onClick={() => play()}>
        Play
      </button>
      <button disabled={!state.isPlaying} onClick={() => pause()}>
        Pause
      </button>
      <button onClick={() => stop()}>Stop</button>
      <button onClick={() => replay()}>Replay</button>
      <div>{ttsChildren}</div>
    </>
  )
}
const AmazonPolly: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <>
      <p>
        <small>
          You can not set the <code>voice</code> or <code>lang</code> when using{' '}
          <code>fetchAudioData</code>.
        </small>
      </p>
      <TextToSpeech {...args} fetchAudioData={fetchAudioData}>
        <p>
          You can use Amazon Polly with <code>fetchAudioData</code>.
        </p>
      </TextToSpeech>
    </>
  )
}
const ReactComponentAsChild: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <>
      <p>
        Due to the way{' '}
        <a href="https://react.dev/reference/react/Children#children-map-caveats">
          <code>Children.map</code>
        </a>{' '}
        works in React, <code>tts-react</code> can not add text from child components to
        the speech synthesis utterance. Instead, include that text as a{' '}
        <strong>direct</strong> child to <code>TextToSpeech</code>.
      </p>
      <TextToSpeech {...args}>
        <p>The text from children components will not be spoken.</p>
        <Child />
      </TextToSpeech>
    </>
  )
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CountOnEnd: StoryFn<typeof TextToSpeech> = (args) => {
  const [count, setCount] = useState(1)
  const [counting, setCounting] = useState(false)
  const { ttsChildren, play } = useTts({
    ...args,
    children: count,
    markTextAsSpoken: true,
    onEnd: useCallback(() => {
      setCount((prev) => prev + 1)
    }, [])
  })

  useEffect(() => {
    if (counting) {
      play()
    }
  }, [count, counting, play])

  return (
    <>
      <button disabled={counting} onClick={() => setCounting(true)}>
        Start
      </button>
      <button onClick={() => setCounting(false)}>Stop</button>
      <p>{ttsChildren}</p>
    </>
  )
}

Component.args = {
  align: 'vertical',
  position: Positions.TL
}
Component.argTypes = {
  voice: {
    control: false
  }
}
AmazonPolly.argTypes = {
  lang: {
    control: false
  },
  voice: {
    control: false
  }
}
LangES_ES.argTypes = {
  voice: {
    control: false
  },
  lang: {
    control: false
  }
}
LangES_ES.args = {
  size: Sizes.SMALL
}
Languages.argTypes = {
  voice: {
    control: false
  },
  lang: {
    control: false
  }
}
Languages.args = {
  size: Sizes.SMALL
}
Hook.argTypes = {
  size: {
    control: false
  },
  align: {
    control: false
  },
  lang: {
    control: false
  },
  position: {
    control: false
  },
  allowMuting: {
    control: false
  },
  useStopOverPause: {
    control: false
  },
  rate: {
    control: false
  },
  volume: {
    control: false
  }
}
SpeakComponent.argTypes = {
  autoPlay: {
    control: false
  },
  size: {
    control: false
  },
  align: {
    control: false
  },
  position: {
    control: false
  },
  allowMuting: {
    control: false
  },
  useStopOverPause: {
    control: false
  }
}
Android.argTypes = {
  useStopOverPause: {
    control: false
  }
}
ImageText.args = {
  position: Positions.BC
}
Sentence.args = {
  size: Sizes.SMALL
}

export default {
  title: 'tts-react',
  component: TextToSpeech,
  args: {
    autoPlay: false,
    rate: 1,
    volume: 1,
    size: Sizes.MEDIUM,
    allowMuting: true,
    align: 'horizontal',
    position: Positions.LC,
    markTextAsSpoken: true,
    markColor: 'white',
    markBackgroundColor: '#55AD66',
    useStopOverPause: /android/i.test(navigator?.userAgent)
  },
  tags: ['autodocs'],
  argTypes: {
    lang: {
      options: voices.length
        ? voices.map((voice) => voice.lang)
        : ['en-US', 'es-ES', 'en-GB', 'de-DE', 'it-IT', 'zh-HK'],
      control: {
        type: 'select'
      }
    },
    voice: {
      control: false
    },
    rate: {
      control: {
        type: 'number',
        min: 0.1,
        max: 4,
        step: 0.1
      }
    },
    volume: {
      control: {
        type: 'number',
        min: 0,
        max: 1,
        step: 0.1
      }
    },
    children: {
      control: false
    },
    fetchAudioData: {
      control: false
    },
    markColor: {
      control: 'color'
    },
    markBackgroundColor: {
      control: 'color'
    },
    onError: {
      action: 'onError',
      control: false
    },
    onStart: {
      action: 'onStart',
      control: false
    },
    onEnd: {
      action: 'onEnd',
      control: false
    },
    onPause: {
      action: 'onPause',
      control: false
    },
    onBoundary: {
      action: 'onBoundary',
      control: false
    },
    onVolumeChange: {
      action: 'onVolumeChange',
      control: false
    },
    onRateChange: {
      action: 'onRateChange',
      control: false
    },
    onPitchChange: {
      action: 'onPitchChange',
      control: false
    },
    size: {
      options: Object.values(Sizes),
      control: {
        type: 'radio'
      }
    },
    position: {
      options: Object.values(Positions),
      control: {
        type: 'radio'
      }
    },
    align: {
      options: ['horizontal', 'vertical'],
      control: {
        type: 'radio'
      }
    }
  }
} as Meta<typeof TextToSpeech>

export {
  Hook,
  Component,
  SpeakComponent,
  Languages,
  LangES_ES,
  AmazonPolly,
  AmazonPollyHook,
  ImageText,
  Android,
  DangerouslySetInnerHTML,
  Sentence,
  RandomSentence,
  RandomText,
  ReactComponentAsChild,
  ErrorExample
}
