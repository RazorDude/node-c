import js from '@eslint/js';

import type { Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import * as importPlugin from 'eslint-plugin-import';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from '@typescript-eslint/eslint-plugin';

export const config: Linter.Config[] = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  importPlugin.configs?.errors,
  importPlugin.configs?.warnings,
  (importPlugin.configs?.typescript || {}),
  {
    env: {
      node: true
    },
    ignorePatterns: ['dist', 'node_modules'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 7,
      sourceType: 'module'
    },
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      'class-methods-use-this': 'off',
      'comma-dangle': 'off',
      eqeqeq: 'error',
      'indent-legacy': 0,
      'import/no-unresolved': 0,
      'import/named': 0,
      'import/namespace': 0,
      'import/default': 0,
      'import/no-cycle': 'error',
      'import/no-named-as-default-member': 0,
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'unknown',
            'external',
            'internal',
            'sibling'
          ],
          pathGroups: [
            {
              'pattern': 'react',
              'group': 'builtin',
              'position': 'before'
            }
          ],
          pathGroupsExcludedImportTypes: [
            'react'
          ],
          'newlines-between': 'always-and-inside-groups',
          alphabetize: {
            order: 'asc',
            caseInsensitive: false
          }
        }
      ],
      indent: 0,
      'no-param-reassign': [
        2,
        {
          props: false
        }
      ],
      'no-tabs': [
        'error',
        {
          allowIndentationTabs: false
        }
      ],
      'no-use-before-define': 'off',
      'no-unused-vars': [1, { 'argsIgnorePattern': '^_' }],
      'prettier/prettier': [
        'error',
        {
          arrowParens: 'avoid',
          printWidth: 120,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'none',
          useTabs: false
        }
      ],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true
        }
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: [
            'none',
            'all',
            'multiple',
            'single'
          ]
        }
      ],
      'turbo/no-undeclared-env-vars': 'warn'
    }
  }
];
