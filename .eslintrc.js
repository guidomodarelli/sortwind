module.exports = {
	root: true,
	env: {
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		requireConfigFile: false,
	},
	overrides: [
		{
			files: ['**/*.{ts,js}'],
			extends: [
				'plugin:import/recommended',
				'eslint:recommended',
				'plugin:@typescript-eslint/recommended',
				'plugin:unicorn/recommended'
			],
			plugins: [
				'unicorn',
			],
			settings: {
				allow: [
					'warn',
					'error'
				],
				'import/core-modules': [
					'vscode'
				],
				'import/resolver': {
					node: {
						extensions: [
							'.js',
							'.jsx',
							'.ts',
							'.tsx',
							'.json'
						],
						paths: [
							'src'
						]
					}
				}
			},
			rules: {
				'no-useless-escape': "off",
				"no-unused-vars": "off",
				"@typescript-eslint/no-unused-vars": [
					"error",
					{
						"args": "all",
						"argsIgnorePattern": "^_",
						"caughtErrors": "all",
						"caughtErrorsIgnorePattern": "^_",
						"destructuredArrayIgnorePattern": "^_",
						"varsIgnorePattern": "^_",
						"ignoreRestSiblings": true
					}
				],
				'unicorn/prevent-abbreviations': [
					2,
					{
						checkProperties: true,
						checkVariables: true,
						checkDefaultAndNamespaceImports: 'internal',
						checkShorthandImports: 'internal',
						checkShorthandProperties: true,
						checkFilenames: true,
						extendDefaultReplacements: true,
						extendDefaultAllowList: true,
						replacements: {},
						ignore: [ 'i' ],
					},
				],
				'unicorn/prefer-module': "off",
				'unicorn/better-regex': "off",
			}
		},
		{
			files: ['**/*.json'],
			plugins: ['json-format'],
			settings: {
				'json/sort-package-json': [
					'name',
					'displayName',
					'version',
					'description',
					'author',
					'publisher',
					'license',
					'repository',
					'scripts',
					'dependencies',
					'devDependencies',
					'categories',
					'keywords',
					'icon',
					'galleryBanner',
					'main',
					'activationEvents',
					'engines',
					'contributes',
				],
				'json/json-with-comments-files': ['**/tsconfig.json', '.vscode/**'],
			},
		},
	],
};
