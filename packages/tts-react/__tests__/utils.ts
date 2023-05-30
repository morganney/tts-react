import { describe } from '@jest/globals'

import { isPunctuation } from '../src/utils.js'

describe('utils', () => {
  it('has isPunctuation', () => {
    expect(isPunctuation('?')).toBe(true)
  })
})
