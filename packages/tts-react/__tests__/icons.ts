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
})
