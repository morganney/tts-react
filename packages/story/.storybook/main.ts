import type { StorybookConfig } from '@storybook/react-webpack5'
import type { TransformOptions } from '@babel/core'

const config: StorybookConfig = {
  stories: ['../src/story.tsx', '../src/count.story.tsx', '../src/update.story.tsx'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-webpack5-compiler-babel'
  ],
  framework: '@storybook/react-webpack5',
  babel: async (options: TransformOptions) => {
    return {...options, rootMode: 'upward'}
  }
}

export default config
