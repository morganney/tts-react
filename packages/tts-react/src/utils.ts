import type { ReactNode } from 'react'
import { isValidElement } from 'react'

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

/**
 * Extracts text content from React children without using Children.map
 * This is an alternative to the legacy Children.map API
 */
const extractTextFromChildren = (children: ReactNode): string => {
  if (!children) {
    return ''
  }

  // Handle string and number primitives
  if (typeof children === 'string' || typeof children === 'number') {
    return children.toString()
  }

  // Handle arrays of children
  if (Array.isArray(children)) {
    return children.map((child: ReactNode) => extractTextFromChildren(child)).join(' ')
  }

  // Handle React elements
  if (isValidElement(children) && children.props && 'children' in children.props) {
    // For React elements, recursively extract text from their children
    return extractTextFromChildren(children.props.children as ReactNode)
  }

  // Handle other types (null, undefined, boolean, etc.)
  return ''
}

export { isStringOrNumber, stripPunctuation, isPunctuation, noop, punctuationRgx, extractTextFromChildren }
