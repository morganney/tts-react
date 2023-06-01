# Examples

### UMD

Using `tts-react` from a CDN:

```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>tts-react UMD example</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/tts-react@3.0.0/dist/umd/tts-react.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      const root = ReactDOM.createRoot(document.getElementById('root'))
      const { TextToSpeech, useTts } = TTSReact
      const CustomTTS = ({ children }) => {
        const { play, ttsChildren } = useTts({ children })

        return (
          <>
            <button onClick={() => play()}>Play</button>
            <div>{ttsChildren}</div>
          </>
        )
      }

      root.render(
        <>
          <CustomTTS>
            <p><code>useTts</code> as a UMD module.</p>
          </CustomTTS>
          <TextToSpeech>
            <p><code>TextToSpeech</code> as a UMD module.</p>
          </TextToSpeech>
        </>
      )
    </script>
  </body>
</html>
```

### Hook

Counting on command:

```tsx
import { useState, useCallback } from 'react'
import { useTts } from 'tts-reat'

const CountOnEnd = () => {
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
```
