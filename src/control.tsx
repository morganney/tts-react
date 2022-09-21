import { useMemo, useEffect } from 'react'
import type { MouseEventHandler } from 'react'

import { Sizes, icons, iconSizes } from './icons'

interface ControlProps {
  title: string
  size?: `${Sizes}`
  align?: 'vertical' | 'horizontal'
  type: 'play' | 'stop' | 'pause' | 'replay' | 'volumeDown' | 'volumeOff' | 'volumeUp'
  onClick: MouseEventHandler<HTMLButtonElement>
}

const padding = {
  [Sizes.SMALL]: 5,
  [Sizes.MEDIUM]: 5,
  [Sizes.LARGE]: 5
}
const Control = ({
  title,
  type,
  onClick,
  size = Sizes.MEDIUM,
  align = 'horizontal',
  ...rest
}: ControlProps) => {
  const svg = useMemo(() => {
    return icons[type]({ size })
  }, [type, size])

  useEffect(() => {
    const styleDataId = 'tts-react-controls'
    const shift = iconSizes[size] + 2 * padding[size] + 5
    const trbl = align === 'horizontal' ? `right: -${shift}px` : `bottom: -${shift}px`
    let style = document.querySelector(`style[data-id="${styleDataId}"]`)

    if (!style) {
      style = document.createElement('style')
      style.setAttribute('data-id', styleDataId)
      document.head.appendChild(style)
    }

    style.innerHTML = `
      button[data-tts-react-control] {
        margin: 0;
        padding: ${padding[size]}px;
        border: none;
        border-radius: ${iconSizes[size]}px;
        color: black;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
      }
      button[data-tts-react-control]:hover {
        background-color: #ebeaeaa6;
      }
      button[data-id="tts-react-replay"] {
        position: absolute;
        background: #f2f1f1a6;
        z-index: 9999;
        ${trbl};
      }
      button[data-id="tts-react-replay"]:hover {
        background: #ebeaeaa6;
      }
    `
  }, [align, size])

  return (
    <button
      title={title}
      data-tts-react-control
      data-id={`tts-react-${type}`}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: svg }}
      {...rest}
    />
  )
}

export { Control, padding }
export type { ControlProps }
