/**
 * Defaulting to `modules: false` in @babel/preset-env caused
 * default exports to stop working in storybook.
 *
 * Consequently, babel env config uses 'esm' instead of 'production',
 * for instance, because running build-storybook somehow triggers
 * a 'production' env for babel (could also use `module.exports` here).
 *
 * Not very descriptive but here is the issue:
 * @see https://github.com/storybookjs/storybook/issues/18063
 */
export default {
  framework: '@storybook/react',
  stories: ['../story.tsx'],
  addons: [
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ]
}
