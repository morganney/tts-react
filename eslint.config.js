import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

const config = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2015
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'no-console': 'error',
      'react/react-in-jsx-scope': 'off'
    }
  },
  {
    files: ['**/__tests__/*'],
    rules: {
      '@typescript-eslint/unbound-method': 'off'
    }
  },
  {
    files: ['**/__tests__/hook.tsx', '**/__tests__/component.tsx'],
    rules: {
      /**
       * Turn off until @types/react supports v19. Possibly will fix this issue.
       * Need to use await act(async) but triggers lint error.
       */
      '@typescript-eslint/require-await': 'off'
    }
  },
  {
    files: ['**/src/component.tsx', '**/src/story.tsx', '**/src/update.story.tsx'],
    rules: {
      /**
       * Allow onClick handlers for the player controls to return Promise<void>.
       */
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false
          }
        }
      ]
    }
  },
  {
    ignores: ['dist', 'build', 'coverage'],
  }
)

export default config
