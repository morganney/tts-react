import type { ComponentMeta, ComponentStory } from '@storybook/react'
import { faker } from '@faker-js/faker'

import { audiosrc, imgsrc } from './assets'
import { TextToSpeech, Positions, Sizes, useTts } from '../dist'

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
const LocaleEsES: ComponentStory<typeof TextToSpeech> = (args) => {
  const esVoices = voices.filter((voice) => voice.lang === 'es-ES')
  const voice = esVoices.find((voice) => voice.name === 'Monica') ?? esVoices[0]

  return (
    <>
      <p>
        The <code>lang</code> prop only works for SpeechSynthesis.
      </p>
      <TextToSpeech {...args} lang="es-ES" voice={voice}>
        <p>¿Hola, cómo estás hoy?</p>
      </TextToSpeech>
    </>
  )
}
const ImageText: ComponentStory<typeof TextToSpeech> = (args) => {
  return (
    <TextToSpeech {...args} position={Positions.TL}>
      <figure>
        <img
          src={imgsrc}
          style={{ aspectRatio: '16 / 9', width: '35%' }}
          alt="smiley face drawing"
        />
        <figcaption>Here is an image of a smiley face canvas drawing.</figcaption>
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
const Hook: ComponentStory<typeof TextToSpeech> = () => {
  const { ttsChildren, onPlay, onPause, onReset, onStop } = useTts({
    children: 'Use the hook to create controls with custom styling.',
    autoPlay: false,
    markTextAsSpoken: true,
    lang: 'es-ES'
    //voice: voices.find((voice) => voice.lang === 'en-GB')
  })

  return (
    <div>
      <button onClick={onPlay}>Play</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={onStop}>Stop</button>
      <button onClick={onReset}>Reset</button>
      <div>{ttsChildren}</div>
    </div>
  )
}
const StandardExample: ComponentStory<typeof TextToSpeech> = (args) => {
  const voice = voices.find((voice) => voice.name === 'Samantha') ?? voices[0]

  return (
    <TextToSpeech {...args} voice={voice} position={Positions.TL} align="vertical">
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
    <TextToSpeech {...args} fetchAudioData={fetchAudioData}>
      <p>Text to be translated to speech by Polly for Story</p>
    </TextToSpeech>
  )
}

StandardExample.argTypes = {
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
  voice: {
    control: false
  }
}

export default {
  title: 'Demo/TextToSpeech',
  component: TextToSpeech,
  args: {
    autoPlay: false,
    size: Sizes.MEDIUM,
    allowMuting: true,
    align: 'horizontal',
    position: Positions.TR,
    markTextAsSpoken: true,
    markColor: 'white',
    markBackgroundColor: '#55AD66'
  },
  argTypes: {
    lang: {
      options: voices.length ? voices.map((voice) => voice.lang) : ['en-US', 'es-ES'],
      control: {
        type: 'select'
      }
    },
    voiceName: {
      options: voices.length ? voices.map((voice) => voice.name) : ['Alex', 'Samantha'],
      control: {
        type: 'select'
      }
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
  StandardExample,
  AmazonPolly,
  Sentence,
  RandomSentence,
  RandomText,
  LocaleEsES,
  Hook,
  ImageText,
  ErrorExample
}
