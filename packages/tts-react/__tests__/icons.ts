import { describe } from '@jest/globals'

import { icons, Sizes } from '../src/icons.js'

describe('icons', () => {
  it('is a map of functions returning svg strings', () => {
    expect(icons.play({ size: Sizes.MEDIUM })).toContain('svg')
    expect(icons.stop({ size: Sizes.MEDIUM })).toContain('svg')
    expect(icons.pause({ size: Sizes.MEDIUM })).toContain('svg')
    expect(icons.replay({ size: Sizes.MEDIUM })).toContain('svg')
    expect(icons.volumeDown({ size: Sizes.MEDIUM })).toContain('svg')
    expect(icons.volumeUp({ size: Sizes.MEDIUM })).toContain('svg')
    expect(icons.volumeOff({ size: Sizes.MEDIUM })).toContain('svg')
  })

  it('uses a default size of medium', () => {
    const missing: unknown = undefined

    expect(icons.play({ size: Sizes.MEDIUM })).toContain('height="24px"')

    expect(icons.play({ size: missing as Sizes })).toContain('height="24px"')
    expect(icons.stop({ size: missing as Sizes })).toContain('width="24px"')
    expect(icons.pause({ size: missing as Sizes })).toContain('height="24px"')
    expect(icons.replay({ size: missing as Sizes })).toContain('width="24px"')
    expect(icons.volumeDown({ size: missing as Sizes })).toContain('height="24px"')
    expect(icons.volumeUp({ size: missing as Sizes })).toContain('height="24px"')
    expect(icons.volumeOff({ size: missing as Sizes })).toContain('height="24px"')
  })
})
