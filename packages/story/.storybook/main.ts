import type { StorybookConfig } from '@storybook/react-webpack5'
import {fileURLToPath} from 'node:url'

const resolvePackageDir = (pkg: string): string => {
  return fileURLToPath(new URL('.', import.meta.resolve(`${pkg}/package.json`)))
}
const a11yAddonPath = resolvePackageDir('@storybook/addon-a11y')
const docsAddonPath = resolvePackageDir('@storybook/addon-docs')
const swcAddonPath = resolvePackageDir('@storybook/addon-webpack5-compiler-swc')
const frameworkPath = resolvePackageDir('@storybook/react-webpack5')

const config: StorybookConfig = {
  stories: ['../src/story.tsx', '../src/count.story.tsx', '../src/update.story.tsx'],
  addons: [
    a11yAddonPath,
    docsAddonPath,
    swcAddonPath
  ],
  framework: {
    name: frameworkPath,
    options: {},
  },
  core: {
    disableWhatsNewNotifications: true,
  },
}

export default config
