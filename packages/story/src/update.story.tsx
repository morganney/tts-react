import { useState } from 'react'
import { useTts } from 'tts-react'

import type { StoryFn } from '@storybook/react'

const Speak = ({ text }: { text: string }) => {
  const { play } = useTts({
    children: <p>{text}</p>
  })

  return <button onClick={play}>play</button>
}
const UpdateText: StoryFn<typeof useTts> = () => {
  const [text, setText] = useState('Hello')

  return (
    <form onSubmit={(evt) => evt.preventDefault()}>
      <input
        type="text"
        value={text}
        onChange={(evt) => {
          setText(evt.target.value)
        }}
      />
      <Speak text={text} />
    </form>
  )
}

export default {
  title: 'tts-react/update',
  component: useTts
}
export { UpdateText }
