import { useState, useCallback, useEffect } from 'react'
import { useTts } from 'tts-react'

import type { StoryFn } from '@storybook/react'

const CountOnEnd: StoryFn<typeof useTts> = () => {
  const [count, setCount] = useState(1)
  const [counting, setCounting] = useState(false)
  const { ttsChildren, play } = useTts({
    children: count,
    markTextAsSpoken: true,
    onEnd: useCallback(() => {
      setCount((prev) => prev + 1)
    }, [])
  })

  useEffect(() => {
    const doCount = async () => {
      if (counting) {
        await play()
      }
    }

    void doCount()
  }, [count, counting, play])

  return (
    <>
      <p>
        Example counter. Use a timeout in <code>onEnd</code> to control the rate.
      </p>
      <button
        disabled={counting}
        onClick={() => {
          setCounting(true)
        }}>
        Start
      </button>
      <button
        onClick={() => {
          setCounting(false)
        }}>
        Stop
      </button>
      <p>{ttsChildren}</p>
    </>
  )
}

export default {
  title: 'tts-react/count',
  component: useTts
}
export { CountOnEnd }
