module.exports = {
	root: true,
	parserOptions: {
		parser: '@typescript-eslint/parser',
		requireConfigFile: false,
	},
	overrides: [
		{
			files: ['**/*.{ts,js}'],
			extends: [
				'plugin:import/errors',
				'plugin:import/warnings'
			],
			settings: {
				allow: [
					'warn',
					'error'
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
			rules: {}
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
