/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/indent': ['warn', 4, { 'SwitchCase': 1 }],
        '@typescript-eslint/member-delimiter-style': ['warn', {
            'multiline': {
                'delimiter': 'none',
                'requireLast': true
            },
            'multilineDetection': 'brackets',
            'singleline': {
                'delimiter': 'semi',
                'requireLast': false
            }
        }],
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/prefer-function-type': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
        'arrow-parens': ['warn', 'as-needed'],
        'comma-dangle': ['warn', 'never'],
        'eol-last': ['warn', 'always'],
        'indent': ['warn', 4, { 'SwitchCase': 1 }],
        'jsx-quotes': ['warn', 'prefer-single'],
        'max-len': ['warn', 180],
        'multiline-ternary': 'off',
        'no-empty-pattern': 'off',
        'no-trailing-spaces': 'warn',
        'no-void': 'off',
        'no-whitespace-before-property': 'off',
        'padded-blocks': 'off',
        'prefer-arrow-callback': 'warn',
        'quotes': ['warn', 'single'],
        'semi': ['warn', 'never'],
        'no-mixed-operators': 'off'
    }
}
