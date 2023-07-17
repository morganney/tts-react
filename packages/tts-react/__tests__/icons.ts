import { describe } from '@jest/globals'

import { icons, Sizes } from '../src/icons.js'

describe('icons', () => {
  it('is a map of functions returning svg strings', () => {
    expect(icons.play(Sizes.MEDIUM)).toContain('<svg')
    expect(icons.stop(Sizes.MEDIUM)).toContain('<svg')
    expect(icons.pause(Sizes.MEDIUM)).toContain('<svg')
    expect(icons.replay(Sizes.MEDIUM)).toContain('<svg')
    expect(icons.volumeDown(Sizes.MEDIUM)).toContain('<svg')
    expect(icons.volumeUp(Sizes.MEDIUM)).toContain('<svg')
    expect(icons.volumeOff(Sizes.MEDIUM)).toContain('<svg')
  })
})
