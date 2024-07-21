# Examples

### Import Map

Using `tts-react` with ESM from a CDN and [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@rc",
          "react-dom/": "https://esm.sh/react-dom@rc/",
          "react/jsx-runtime": "https://esm.sh/react@rc/jsx-runtime",
          "tts-react": "https://esm.sh/tts-react@next"
        }
      }
    </script>
    <title>ESM / CDN / Import Map</title>
  </head>
  <body>
    <script type="module">
      import { createElement } from 'react'
      import { createRoot } from 'react-dom/client'
      import { TextToSpeech } from 'tts-react'

      createRoot(document.body).render(
        createElement(TextToSpeech, { markTextAsSpoken: true }, 'Hello from tts-react.')
      )
    </script>
  </body>
</html>
```

### Hook

Counting on command:

```jsx
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
