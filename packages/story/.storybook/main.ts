import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
  stories: ['../src/story.tsx', '../src/count.story.tsx'],
  addons: [
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-webpack5-compiler-babel'
  ],
  framework: '@storybook/react-webpack5',
  docs: {
    autodocs: 'tag',
  },
}

export default config
