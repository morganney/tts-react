import { describe, jest } from '@jest/globals'
import { render, fireEvent } from '@testing-library/react'

import { Control } from '../src/control'

describe('Control', () => {
  it('is a button used by TextToSpeech component', () => {
    const onClick = jest.fn()
    const { getByRole, rerender } = render(
      <Control title="Test" type="play" onClick={onClick} />
    )

    expect(getByRole('button', { name: 'Test' })).toBeInTheDocument()

    // Check onClick
    fireEvent.click(getByRole('button', { name: 'Test' }))
    expect(onClick).toHaveBeenCalled()

    // Check that styles correspond to alignment correctly
    rerender(<Control title="Align" type="replay" align="vertical" onClick={onClick} />)
    expect(getByRole('button', { name: 'Align' })).toHaveStyle({ bottom: '-39px' })
  })
})
