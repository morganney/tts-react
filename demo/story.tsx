import type { ComponentMeta, ComponentStory } from '@storybook/react'
import { faker } from '@faker-js/faker'
import { useState, useEffect } from 'react'

import { audiosrc } from './assets'
import { TextToSpeech, Positions, Sizes, useTts } from '../src'

let voices: SpeechSynthesisVoice[] = []

if (window.speechSynthesis) {
  voices = window.speechSynthesis.getVoices()

  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis?.addEventListener('voiceschanged', () => {
      voices = window.speechSynthesis.getVoices()
    })
  }
}
const capitalize = (text: string) => {
  return `${text[0].toUpperCase()}${text.substring(1)}`
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
    toLocales(speechSynthesis?.getVoices() ?? [])
  )
  const [lang, setLang] = useState<string | undefined>()

  useEffect(() => {
    if (typeof window.speechSynthesis?.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        setLocales(toLocales(window.speechSynthesis.getVoices()))
      })
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
        Select a lang (locale):&nbsp;
        <select
          onChange={(evt) => {
            setLang(voices.find((voice) => voice.lang === evt.target.value)?.lang)
          }}>
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
const Hook: ComponentStory<typeof TextToSpeech> = (args) => {
  const [voices, setVoices] = useState(window.speechSynthesis?.getVoices() ?? [])
  const [voice, setVoice] = useState<SpeechSynthesisVoice | undefined>()
  const { ttsChildren, state, onPlay, onPause, onReset, onStop } = useTts({
    ...args,
    voice,
    children: 'The hook can be used to create custom controls.'
  })

  useEffect(() => {
    if (state.voices) {
      setVoices(state.voices)
    }
  }, [state.voices])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {voices.length > 0 ? (
        <>
          <label>
            Select a voice:&nbsp;
            <select
              onChange={(evt) => {
                setVoice(voices.find((voice) => voice.name === evt.target.value))
              }}>
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} [{voice.lang}]
                </option>
              ))}
            </select>
          </label>
          <p style={{ marginTop: 0 }}>
            <small>
              <em>(Some voices may create skewed word boundaries for the given text.)</em>
            </small>
          </p>
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
        <button onClick={onPlay}>Play</button>
        <button onClick={onPause}>Pause</button>
        <button onClick={onStop}>Stop</button>
        <button onClick={onReset}>Reset</button>
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
        {
          time: 6,
          type: 'word',
          start: 0,
          end: 4,
          value: 'Text'
        },
        {
          time: 286,
          type: 'word',
          start: 5,
          end: 7,
          value: 'to'
        },
        {
          time: 347,
          type: 'word',
          start: 8,
          end: 10,
          value: 'be'
        },
        {
          time: 479,
          type: 'word',
          start: 11,
          end: 21,
          value: 'translated'
        },
        {
          time: 1162,
          type: 'word',
          start: 22,
          end: 24,
          value: 'to'
        },
        {
          time: 1244,
          type: 'word',
          start: 25,
          end: 31,
          value: 'speech'
        },
        {
          time: 1599,
          type: 'word',
          start: 32,
          end: 34,
          value: 'by'
        },
        {
          time: 1719,
          type: 'word',
          start: 35,
          end: 40,
          value: 'Polly'
        },
        {
          time: 2064,
          type: 'word',
          start: 41,
          end: 44,
          value: 'for'
        },
        {
          time: 2219,
          type: 'word',
          start: 45,
          end: 50,
          value: 'Story'
        }
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
        <p>Text to be translated to speech by Polly for Story</p>
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
  Languages,
  LangES_ES,
  AmazonPolly,
  ImageText,
  Android,
  Sentence,
  RandomSentence,
  RandomText,
  ErrorExample
}
