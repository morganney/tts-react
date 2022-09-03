import { useState } from 'react'
import type { ReactNode, MouseEventHandler, CSSProperties } from 'react'

import { Sizes, sizes as iconSizes } from './icons'
import type { SvgProps } from './icons'

const padding = {
  [Sizes.SMALL]: 3,
  [Sizes.MEDIUM]: 5,
  [Sizes.LARGE]: 5
}
const button = (size: SvgProps['size'], hovering: boolean): CSSProperties => {
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
const Button = ({
  size,
  children,
  title,
  onClick
}: {
  children: ReactNode
  size: SvgProps['size']
  title: string
  onClick: MouseEventHandler<HTMLButtonElement>
}) => {
  const [hovering, setHovering] = useState(false)

  return (
    <button
      style={button(size, hovering)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}
      title={title}>
      {children}
    </button>
  )
}

export { Button, padding }
