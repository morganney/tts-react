import { useState, useMemo, useCallback } from 'react'
import type { MouseEventHandler, CSSProperties } from 'react'

import { Sizes, icons, iconSizes } from './icons'

interface ControlProps {
  title: string
  size?: `${Sizes}`
  type: 'play' | 'stop' | 'pause' | 'replay' | 'volumeDown' | 'volumeOff' | 'volumeUp'
  onClick: MouseEventHandler<HTMLButtonElement>
}

const padding = {
  [Sizes.SMALL]: 5,
  [Sizes.MEDIUM]: 5,
  [Sizes.LARGE]: 5
}
const button = (
  size: ControlProps['size'] = Sizes.MEDIUM,
  hovering: boolean
): CSSProperties => {
  return {
    padding: `${padding[size]}px`,
    margin: 0,
    border: 'none',
    background: hovering ? '#ebeaeaa6' : 'transparent',
    color: 'black',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${iconSizes[size]}px`
  }
}
const Control = ({ title, type, onClick, size, ...rest }: ControlProps) => {
  const [hovering, setHovering] = useState(false)
  const svg = useMemo(() => {
    return icons[type]({ size })
  }, [type, size])
  const onMouseEnter = useCallback(() => {
    setHovering(true)
  }, [])
  const onMouseLeave = useCallback(() => {
    setHovering(false)
  }, [])

  return (
    <button
      title={title}
      onClick={onClick}
      style={button(size, hovering)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      dangerouslySetInnerHTML={{ __html: svg }}
      {...rest}
    />
  )
}

export { Control, padding }
export type { ControlProps }
