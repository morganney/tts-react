# Examples

```tsx
import { useState, useCallback } from 'react'
import { useTts } from 'tts-reat'

const CountOnEnd = () => {
  const [count, setCount] = useState(1)
  const [counting, setCounting] = useState(false)
  const { ttsChildren, onPlay } = useTts({
    children: count,
    markTextAsSpoken: true,
    onEnd: useCallback(() => {
      setCount((prev) => prev + 1)
    }, [])
  })

  useEffect(() => {
    if (counting) {
      onPlay()
    }
  }, [count, counting, onPlay])

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
```
