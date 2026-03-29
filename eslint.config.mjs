import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    stylistic: true
  }
}).append({
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 3
      },
      multiline: {
        max: 1
      }
    }],
    'vue/comma-dangle': ['error', 'never'],
    'vue/multi-word-component-names': 'off'
  }
})
