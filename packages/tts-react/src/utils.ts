import type { ReactNode } from 'react'

const punctuationRgx = /[^\P{P}'/-]+/gu
const isStringOrNumber = (value: ReactNode): boolean => {
  return typeof value === 'string' || typeof value === 'number'
}
const stripPunctuation = (text: string): string => {
  return text.replace(punctuationRgx, '')
}
const isPunctuation = (text: string): boolean => {
  const trimmed = text.trim()

  return punctuationRgx.test(trimmed) && trimmed.length === 1
}
const noop = (): void => {}

export { isStringOrNumber, stripPunctuation, isPunctuation, noop, punctuationRgx }
