import React, { useMemo } from 'react'
import type { CSSProperties } from 'react'

interface HighliterProps {
  text: string
  mark: string
  color?: string
  backgroundColor?: string
}

const markStyles = ({
  color,
  backgroundColor
}: Pick<HighliterProps, 'color' | 'backgroundColor'>): CSSProperties => ({
  color,
  backgroundColor
})
const Highlighter = ({ text, mark, color, backgroundColor }: HighliterProps) => {
  const markStyle = useMemo(
    () => markStyles({ color, backgroundColor }),
    [color, backgroundColor]
  )
  if (text && mark) {
    const textStr = text.toString()
    const escapedMark = mark.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    const regex = new RegExp(`(${escapedMark})`, 'gi')
    const parts = textStr.split(regex)

    if (parts.length > 1) {
      return (
        <span>
          {parts.map((part, idx) => {
            const key = `${part}-${idx}`

            if (!part) {
              // Happens when the entire text matches the mark
              return null
            }

            if (regex.test(part)) {
              return (
                <mark key={key} style={markStyle} data-testid="tts-react-mark">
                  {part}
                </mark>
              )
            }

            return <span key={key}>{part}</span>
          })}
        </span>
      )
    }
  }

  return <>{text}</>
}

export { Highlighter }
