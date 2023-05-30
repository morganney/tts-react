import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
  stories: ['../src/story.tsx'],
  addons: [
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options : {}
  },
  docs: {
    autodocs: 'tag',
  },
  babel: async (options) => {
    return {...options, rootMode: 'upward'}
  }
}

export default config
