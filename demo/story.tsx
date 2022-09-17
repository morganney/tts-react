import type { ComponentMeta, ComponentStory } from '@storybook/react'
import { faker } from '@faker-js/faker'
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { ChangeEventHandler, ChangeEvent, ReactNode } from 'react'
import parse from 'html-react-parser'
import { action } from '@storybook/addon-actions'

import { audiosrc } from './assets'
import { TextToSpeech, Positions, Sizes, useTts } from '../src'
import type { TTSHookProps } from '../src'

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
const RandomSentence: ComponentStory<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args}>
      {`${faker.random.words(3)}, `}
      {`${faker.random.words(6)}.`}
    </TextToSpeech>
  )
}
const Sentence: ComponentStory<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args}>
      <p>Converting text to speech with React!</p>
    </TextToSpeech>
  )
}
const Languages: ComponentStory<typeof TextToSpeech> = (args) => {
  const toLocales = (voices: SpeechSynthesisVoice[]) =>
    Array.from(new Set(voices.map((voice) => voice.lang)))
  const [locales, setLocales] = useState(() =>
    toLocales(window.speechSynthesis?.getVoices() ?? [])
  )
  const [lang, setLang] = useState<string | undefined>()

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
      <TextToSpeech {...args} lang={lang}>
        The voice should sound appropriate to the selected locale.
      </TextToSpeech>
    </>
  )
}
const LangES_ES: ComponentStory<typeof TextToSpeech> = (args) => {
  const esVoices = voices.filter((voice) => voice.lang === 'es-ES')
  const voice = esVoices.find((voice) => voice.name === 'Monica') ?? esVoices[0]

  return (
    <TextToSpeech {...args} lang="es-ES" voice={voice}>
      <p>¿Hola, cómo estás hoy?</p>
    </TextToSpeech>
  )
}
const Android: ComponentStory<typeof TextToSpeech> = (args) => {
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
const ImageText: ComponentStory<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args} position={Positions.TL}>
      <figure style={{ margin: 0, paddingTop: 60 }}>
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
const RandomText: ComponentStory<typeof TextToSpeech> = (args) => {
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
const SpeakComponent: ComponentStory<typeof TextToSpeech> = (args) => {
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
const Hook: ComponentStory<typeof TextToSpeech> = (args) => {
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [voices, setVoices] = useState(window.speechSynthesis?.getVoices() ?? [])
  const [voice, setVoice] = useState<SpeechSynthesisVoice | undefined>()
  const prevVolume = useRef(volume)
  const { ttsChildren, state, set, onPlay, onPause, onReset, onStop, onToggleMute } =
    useTts({
      ...args,
      voice,
      children: 'The hook can be used to create custom controls.',
      onVolumeChange: useMemo(() => action('onVolumeChange'), []),
      onPitchChange: useMemo(() => action('onPitchChange'), []),
      onRateChange: useMemo(() => action('onRateChange'), [])
    })
  const onMuteChanged = useCallback(() => {
    onToggleMute((wasMuted) => {
      setVolume(wasMuted ? prevVolume.current : 0)
      set.volume(wasMuted ? prevVolume.current : 0)
    })
  }, [onToggleMute, set])
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
            <select value={voice?.name} onChange={onSelectVoice}>
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
        <button disabled={state.isPlaying} onClick={onPlay}>
          Play
        </button>
        <button disabled={state.isPaused} onClick={onPause}>
          Pause
        </button>
        <button onClick={onStop}>Stop</button>
        <button onClick={onReset}>Replay</button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          marginTop: '15px'
        }}>
        <label>
          Mute: <input type="checkbox" onChange={onMuteChanged} />
        </label>
        <Label>
          <span style={{ width: 70 }}>Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
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
const Component: ComponentStory<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args} position={Positions.TL} align="vertical">
      <div style={{ minWidth: '300px', paddingLeft: '60px' }}>
        <p>During their day, workers in this cluster might:</p>
        <ul>
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
const DangerouslySetInnerHTML: ComponentStory<typeof TextToSpeech> = (args) => {
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
const ErrorExample: ComponentStory<typeof TextToSpeech> = (args) => {
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
const AmazonPolly: ComponentStory<typeof TextToSpeech> = (args) => {
  const fetchAudioData = () =>
    Promise.resolve({
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

Component.argTypes = {
  voice: {
    control: false
  },
  position: {
    control: false
  },
  align: {
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
Languages.argTypes = {
  voice: {
    control: false
  },
  lang: {
    control: false
  }
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
    position: Positions.TR,
    markTextAsSpoken: true,
    markColor: 'white',
    markBackgroundColor: '#55AD66',
    useStopOverPause: /android/i.test(navigator?.userAgent)
  },
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
      action: 'onError'
    },
    size: {
      options: [Sizes.SMALL, Sizes.MEDIUM, Sizes.LARGE],
      control: {
        type: 'radio'
      }
    },
    position: {
      options: [Positions.TR, Positions.TL, Positions.BL, Positions.BR],
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
} as ComponentMeta<typeof TextToSpeech>

export {
  Hook,
  Component,
  SpeakComponent,
  Languages,
  LangES_ES,
  AmazonPolly,
  ImageText,
  Android,
  DangerouslySetInnerHTML,
  Sentence,
  RandomSentence,
  RandomText,
  ErrorExample
}
