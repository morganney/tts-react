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
          <TextToSpeech markTextAsSpoken>
            <p><code>TextToSpeech</code> as a UMD module.</p>
          </TextToSpeech>
        </>
      )
    </script>
  </body>
</html>
```

### Import Map

Uses [htm](https://github.com/developit/htm) and [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react",
          "react-dom/": "https://esm.sh/react-dom/",
          "tts-react": "https://esm.sh/tts-react",
          "htm/": "https://esm.sh/htm/"
        }
      }
    </script>
    <title>Import Map (no build): tts-react</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import { createRoot } from 'react-dom/client'
      import { TextToSpeech } from 'tts-react'
      import { html } from 'htm/react'

      createRoot(document.getElementById('root')).render(
        html`
          <${TextToSpeech} markTextAsSpoken>
            <p>Hello from tts-react.</p>
          </${TextToSpeech}>
        `
      )
    </script>
  </body>
</html>
```

### Hook

Counting on command:

```tsx
import { useState, useCallback, useEffect } from 'react'
import { useTts } from 'tts-react'

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
