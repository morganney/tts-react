import { describe, test } from '@jest/globals'
import { createElement } from 'react'

import { isPunctuation, extractTextFromChildren } from '../src/utils.js'

describe('utils', () => {
  it('has isPunctuation', () => {
    expect(isPunctuation('?')).toBe(true)
  })

  describe('extractTextFromChildren', () => {
    test('extracts text from string children', () => {
      expect(extractTextFromChildren('hello world')).toBe('hello world')
    })

    test('extracts text from number children', () => {
      expect(extractTextFromChildren(42)).toBe('42')
    })

    test('extracts text from array of children', () => {
      expect(extractTextFromChildren(['hello', ' ', 'world'])).toBe('hello   world')
    })

    test('extracts text from React elements', () => {
      const element = createElement('p', {}, 'Hello from element')
      expect(extractTextFromChildren(element)).toBe('Hello from element')
    })

    test('extracts text from nested React elements', () => {
      const nested = createElement('span', {}, 'nested text')
      const element = createElement('p', {}, 'Hello ', nested, ' world')
      expect(extractTextFromChildren(element)).toBe('Hello  nested text  world')
    })

    test('handles null and undefined children', () => {
      expect(extractTextFromChildren(null)).toBe('')
      expect(extractTextFromChildren(undefined)).toBe('')
    })

    test('handles boolean children', () => {
      expect(extractTextFromChildren(true)).toBe('')
      expect(extractTextFromChildren(false)).toBe('')
    })

    test('handles empty array', () => {
      expect(extractTextFromChildren([])).toBe('')
    })
  })
})
