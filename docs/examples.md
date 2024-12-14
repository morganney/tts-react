# Examples

### CDN + ESM

Using `tts-react` with ESM from a CDN:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ESM + CDN</title>
  </head>
  <body>
    <script type="module">
      import { createElement } from 'https://esm.sh/react'
      import { createRoot } from 'https://esm.sh/react-dom/client'
      import { TextToSpeech } from 'https://esm.sh/tts-react'

      createRoot(document.body).render(
        createElement(TextToSpeech, { markTextAsSpoken: true }, 'Hello from tts-react.')
      )
    </script>
  </body>
</html>
```

#### `htm`

Use [`htm`](https://github.com/developit/htm) for JSX-like syntax:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ESM + CDN + htm</title>
  </head>
  <body>
    <script type="module">
      import { createElement } from 'https://esm.sh/react'
      import { createRoot } from 'https://esm.sh/react-dom/client'
      import { TextToSpeech } from 'https://esm.sh/tts-react'
      import htm from 'https://esm.sh/htm'

      const html = htm.bind(createElement)

      createRoot(document.body).render(
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

#### Import Map

You can also use an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) if you prefer bare specifiers in your import statements:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react",
          "react-dom/client": "https://esm.sh/react-dom/client",
          "tts-react": "https://esm.sh/tts-react",
          "htm": "https://esm.sh/htm"
        }
      }
    </script>
    <title>ESM + CDN + Import Map + htm</title>
  </head>
  <body>
    <script type="module">
      import { createElement } from 'react'
      import { createRoot } from 'react-dom/client'
      import { TextToSpeech } from 'tts-react'
      import htm from 'htm'

      const html = htm.bind(createElement)

      createRoot(document.body).render(
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
