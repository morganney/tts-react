import { describe } from '@jest/globals'

import { icons } from '../src/icons'

describe('icons', () => {
  it('is a map of functions returning svg strings', () => {
    expect(icons.play({ size: undefined })).toContain('svg')
    expect(icons.stop({ size: undefined })).toContain('svg')
    expect(icons.pause({ size: undefined })).toContain('svg')
    expect(icons.replay({ size: undefined })).toContain('svg')
    expect(icons.volumeDown({ size: undefined })).toContain('svg')
    expect(icons.volumeUp({ size: undefined })).toContain('svg')
    expect(icons.volumeOff({ size: undefined })).toContain('svg')
  })
})
