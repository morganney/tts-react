import type { Meta, StoryFn } from '@storybook/react'
import type { ReactNode } from 'react'

import { TextToSpeech, Positions, Sizes } from 'tts-react'

/**
 * Custom highlight component with gradient background
 */
const GradientHighlight = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      color: 'white',
      padding: '2px 4px',
      borderRadius: '4px',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
    {children}
  </span>
)

/**
 * Custom highlight component with pulsing animation
 */
const PulsingHighlight = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      backgroundColor: '#ffeb3b',
      color: '#333',
      padding: '2px 6px',
      borderRadius: '6px',
      animation: 'pulse 1s infinite',
      fontWeight: 'bold'
    }}>
    {children}
    <style>
      {`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}
    </style>
  </span>
)

/**
 * Custom highlight component with border styling
 */
const BorderHighlight = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      border: '2px solid #e91e63',
      borderRadius: '8px',
      padding: '4px 8px',
      backgroundColor: 'rgba(233, 30, 99, 0.1)',
      color: '#e91e63',
      fontWeight: 'bold',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
    }}>
    {children}
  </span>
)

/**
 * Basic render prop example with custom highlighting
 */
const BasicRenderProp: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <div>
      <h3>Basic Custom Render Prop</h3>
      <p>This example demonstrates a custom render prop that applies gradient highlighting to spoken words.</p>
      <TextToSpeech
        {...args}
        text="This text will be highlighted with a custom gradient background as it's spoken."
        render={({ children, boundary, markTextAsSpoken }) => {
          if (!markTextAsSpoken || !boundary.word) {
            return children
          }
          
          // Extract the spoken word and apply custom highlighting
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const text = typeof children === 'string' ? children : String(children)
          const { startChar, endChar } = boundary
          const before = text.substring(0, startChar)
          const spoken = text.substring(startChar, endChar)
          const after = text.substring(endChar)
          
          return (
            <>
              {before}
              <GradientHighlight>{spoken}</GradientHighlight>
              {after}
            </>
          )
        }}
      />
    </div>
  )
}

/**
 * Animated render prop example
 */
const AnimatedRenderProp: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <div>
      <h3>Animated Custom Highlighting</h3>
      <p>This example shows how to create animated highlighting effects using the render prop.</p>
      <TextToSpeech
        {...args}
        text="Watch this text pulse and animate as each word is spoken!"
        render={({ children, boundary, markTextAsSpoken }) => {
          if (!markTextAsSpoken || !boundary.word) {
            return children
          }
          
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const text = typeof children === 'string' ? children : String(children)
          const { startChar, endChar } = boundary
          const before = text.substring(0, startChar)
          const spoken = text.substring(startChar, endChar)
          const after = text.substring(endChar)
          
          return (
            <>
              {before}
              <PulsingHighlight>{spoken}</PulsingHighlight>
              {after}
            </>
          )
        }}
      />
    </div>
  )
}

/**
 * Border style render prop example
 */
const BorderStyleRenderProp: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <div>
      <h3>Border Style Custom Highlighting</h3>
      <p>This example demonstrates custom border-based highlighting using the render prop.</p>
      <TextToSpeech
        {...args}
        text="Each word gets a custom border highlight as it's being spoken."
        render={({ children, boundary, markTextAsSpoken }) => {
          if (!markTextAsSpoken || !boundary.word) {
            return children
          }
          
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const text = typeof children === 'string' ? children : String(children)
          const { startChar, endChar } = boundary
          const before = text.substring(0, startChar)
          const spoken = text.substring(startChar, endChar)
          const after = text.substring(endChar)
          
          return (
            <>
              {before}
              <BorderHighlight>{spoken}</BorderHighlight>
              {after}
            </>
          )
        }}
      />
    </div>
  )
}

/**
 * Complex content with render prop
 */
const ComplexContentRenderProp: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <div>
      <h3>Complex Content with Custom Rendering</h3>
      <p>This example shows how the render prop works with more complex JSX content.</p>
      <TextToSpeech
        {...args}
        render={({ children, boundary, markTextAsSpoken }) => {
          if (!markTextAsSpoken || !boundary.word) {
            return children
          }
          
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const text = typeof children === 'string' ? children : String(children)
          const { startChar, endChar } = boundary
          const before = text.substring(0, startChar)
          const spoken = text.substring(startChar, endChar)
          const after = text.substring(endChar)
          
          return (
            <>
              {before}
              <span
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  padding: '3px 6px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1.1em'
                }}>
                {spoken}
              </span>
              {after}
            </>
          )
        }}>
        <div>
          <h4>A Complex Example</h4>
          <p>This paragraph contains <strong>bold text</strong> and <em>italic text</em> to demonstrate how the render prop handles complex content.</p>
          <ul>
            <li>First list item with some text</li>
            <li>Second list item with more content</li>
          </ul>
        </div>
      </TextToSpeech>
    </div>
  )
}

/**
 * Conditional highlighting render prop
 */
const ConditionalRenderProp: StoryFn<typeof TextToSpeech> = (args) => {
  return (
    <div>
      <h3>Conditional Custom Highlighting</h3>
      <p>This example demonstrates conditional highlighting based on word length or content.</p>
      <TextToSpeech
        {...args}
        text="Short words get different highlighting than longer words in this example."
        render={({ children, boundary, markTextAsSpoken }) => {
          if (!markTextAsSpoken || !boundary.word) {
            return children
          }
          
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const text = typeof children === 'string' ? children : String(children)
          const { startChar, endChar } = boundary
          const before = text.substring(0, startChar)
          const spoken = text.substring(startChar, endChar)
          const after = text.substring(endChar)
          
          // Apply different styles based on word length
          const style = spoken.length > 5
            ? {
                backgroundColor: '#f44336',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '8px',
                fontWeight: 'bold',
                textTransform: 'uppercase' as const
              }
            : {
                backgroundColor: '#2196f3',
                color: 'white',
                padding: '2px 4px',
                borderRadius: '4px',
                fontStyle: 'italic'
              }
          
          return (
            <>
              {before}
              <span style={style}>{spoken}</span>
              {after}
            </>
          )
        }}
      />
    </div>
  )
}

/**
 * Multi-color render prop example
 */
const MultiColorRenderProp: StoryFn<typeof TextToSpeech> = (args) => {
  const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50']
  let colorIndex = 0
  
  return (
    <div>
      <h3>Multi-Color Custom Highlighting</h3>
      <p>This example cycles through different colors for each word that&apos;s spoken.</p>
      <TextToSpeech
        {...args}
        text="Every single word in this sentence will be highlighted with a different vibrant color!"
        render={({ children, boundary, markTextAsSpoken }) => {
          if (!markTextAsSpoken || !boundary.word) {
            return children
          }
          
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const text = typeof children === 'string' ? children : String(children)
          const { startChar, endChar } = boundary
          const before = text.substring(0, startChar)
          const spoken = text.substring(startChar, endChar)
          const after = text.substring(endChar)
          
          // Get the next color in the cycle
          const color = colors[colorIndex % colors.length]
          colorIndex++
          
          return (
            <>
              {before}
              <span
                style={{
                  backgroundColor: color,
                  color: 'white',
                  padding: '3px 6px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  margin: '0 1px'
                }}>
                {spoken}
              </span>
              {after}
            </>
          )
        }}
      />
    </div>
  )
}

// Configure story arguments
BasicRenderProp.args = {
  markTextAsSpoken: true,
  position: Positions.LC,
  size: Sizes.MEDIUM
}

AnimatedRenderProp.args = {
  markTextAsSpoken: true,
  position: Positions.LC,
  size: Sizes.MEDIUM
}

BorderStyleRenderProp.args = {
  markTextAsSpoken: true,
  position: Positions.LC,
  size: Sizes.MEDIUM
}

ComplexContentRenderProp.args = {
  markTextAsSpoken: true,
  position: Positions.TC,
  size: Sizes.MEDIUM
}

ConditionalRenderProp.args = {
  markTextAsSpoken: true,
  position: Positions.LC,
  size: Sizes.MEDIUM
}

MultiColorRenderProp.args = {
  markTextAsSpoken: true,
  position: Positions.LC,
  size: Sizes.MEDIUM
}

// Disable certain controls for render prop stories since they're handled by the render function
const commonArgTypes = {
  markColor: { control: false },
  markBackgroundColor: { control: false },
  render: { control: false },
  markTextAsSpoken: { control: false }
}

BasicRenderProp.argTypes = commonArgTypes
AnimatedRenderProp.argTypes = commonArgTypes
BorderStyleRenderProp.argTypes = commonArgTypes
ComplexContentRenderProp.argTypes = commonArgTypes
ConditionalRenderProp.argTypes = commonArgTypes
MultiColorRenderProp.argTypes = commonArgTypes

export default {
  title: 'tts-react/render-prop',
  component: TextToSpeech,
  parameters: {
    docs: {
      description: {
        component: 'Examples demonstrating how to use the render prop feature for custom text highlighting during speech synthesis.'
      }
    }
  }
} as Meta<typeof TextToSpeech>

export {
  BasicRenderProp,
  AnimatedRenderProp,
  BorderStyleRenderProp,
  ComplexContentRenderProp,
  ConditionalRenderProp,
  MultiColorRenderProp
}