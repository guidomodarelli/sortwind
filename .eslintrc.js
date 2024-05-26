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
	],
};
