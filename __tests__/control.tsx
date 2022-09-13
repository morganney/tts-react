import { describe, jest } from '@jest/globals'
import { render, act, fireEvent } from '@testing-library/react'

import { Control } from '../src/control'

describe('Control', () => {
  it('is a button used by TextToSpeech component', () => {
    const onClick = jest.fn()
    const { getByRole, rerender } = render(
      <Control title="Test" type="play" onClick={onClick} />
    )

    expect(getByRole('button', { name: 'Test' })).toBeInTheDocument()

    // Check mouseenter on the button changes background color
    act(() => {
      fireEvent.mouseEnter(getByRole('button', { name: 'Test' }))
    })
    expect(getByRole('button', { name: 'Test' })).toHaveStyle({ background: '#ebeaeaa6' })

    // Check that mouseleave on the button removes the background color
    act(() => {
      fireEvent.mouseLeave(getByRole('button', { name: 'Test' }))
    })
    expect(getByRole('button', { name: 'Test' })).toHaveStyle({
      background: 'transparent'
    })

    // Check onClick
    fireEvent.click(getByRole('button', { name: 'Test' }))
    expect(onClick).toHaveBeenCalled()

    // Check that the size defaults correctly
    rerender(<Control title="NoSize" type="play" onClick={onClick} size={undefined} />)
    expect(getByRole('button', { name: 'NoSize' })).toHaveStyle({ padding: '5px' })
  })
})
