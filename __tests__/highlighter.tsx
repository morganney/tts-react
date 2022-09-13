import { describe } from '@jest/globals'
import { render } from '@testing-library/react'

import { Highlighter } from '../src/highlighter'

describe('Highlighter', () => {
  it('wraps substrings of text with a <mark> when found', () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <Highlighter text="This is only a test." mark="only" />
    )

    expect(getByTestId('tts-react-mark').textContent).toBe('only')

    rerender(<Highlighter text="There is no substring to mark." mark="xyz" />)
    expect(queryByTestId('tts-react-mark')).not.toBeInTheDocument()
    rerender(<Highlighter text="There is no substring to mark." mark="" />)
    expect(queryByTestId('tts-react-mark')).not.toBeInTheDocument()
  })
})
