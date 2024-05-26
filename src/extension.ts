'use strict';

import { commands, workspace, ExtensionContext, Range, window } from 'vscode';
import { sortClassString, getTextMatch, buildMatchers } from './utils';
import { spawn } from 'node:child_process';
import { rustyWindPath } from 'rustywind';
import { LangConfig, Options } from "./types";

const config = workspace.getConfiguration();
const langConfig: { [key: string]: LangConfig | LangConfig[] } =
	config.get('sortwind.classRegex') || {};

const sortOrder = config.get('sortwind.defaultSortOrder');

const customTailwindPrefixConfig = config.get('sortwind.customTailwindPrefix');
const customTailwindPrefix =
	typeof customTailwindPrefixConfig === 'string'
		? customTailwindPrefixConfig
		: '';

const shouldRemoveDuplicatesConfig = config.get('sortwind.removeDuplicates');
const shouldRemoveDuplicates =
	typeof shouldRemoveDuplicatesConfig === 'boolean'
		? shouldRemoveDuplicatesConfig
		: true;

const shouldPrependCustomClassesConfig = config.get(
	'sortwind.prependCustomClasses'
);
const shouldPrependCustomClasses =
	typeof shouldPrependCustomClassesConfig === 'boolean'
		? shouldPrependCustomClassesConfig
		: false;

export function activate(context: ExtensionContext) {
	const disposable = commands.registerTextEditorCommand(
		'sortwind.sortTailwindClasses',
		function (editor, edit) {
			const editorText = editor.document.getText();
			const editorLangId = editor.document.languageId;

			const matchers = buildMatchers(
				langConfig[editorLangId] || langConfig['html']
			);

			for (const matcher of matchers) {
				getTextMatch(matcher.regex, editorText, (text, startPosition) => {
					const endPosition = startPosition + text.length;
					const range = new Range(
						editor.document.positionAt(startPosition),
						editor.document.positionAt(endPosition)
					);

					const options: Options = {
						shouldRemoveDuplicates,
						shouldPrependCustomClasses,
						customTailwindPrefix,
						separator: matcher.separator,
						replacement: matcher.replacement,
					};

					edit.replace(
						range,
						sortClassString(
							text,
							Array.isArray(sortOrder) ? sortOrder : [],
							options
						)
					);
				});
			}
		}
	);

	const runOnProject = commands.registerCommand(
		'sortwind.sortTailwindClassesOnWorkspace',
		() => {
			const workspaceFolder = workspace.workspaceFolders || [];
			if (workspaceFolder[0]) {
				window.showInformationMessage(
					`Running Sortwind on: ${workspaceFolder[0].uri.fsPath}`
				);

				const rustyWindArgs = [
					workspaceFolder[0].uri.fsPath,
					'--write',
					shouldRemoveDuplicates ? '' : '--allow-duplicates',
				].filter((argument) => argument !== '');

				const rustyWindProc = spawn(rustyWindPath, rustyWindArgs);

				rustyWindProc.stdout.on(
					'data',
					(data) =>
						data &&
						data.toString() !== '' &&
						console.log('rustywind stdout:\n', data.toString())
				);

				rustyWindProc.stderr.on('data', (data) => {
					if (data && data.toString() !== '') {
						console.log('rustywind stderr:\n', data.toString());
						window.showErrorMessage(`Sortwind error: ${data.toString()}`);
					}
				});
			}
		}
	);

	context.subscriptions.push(runOnProject, disposable);

	// if runOnSave is enabled organize tailwind classes before saving
	if (config.get('sortwind.runOnSave')) {
		context.subscriptions.push(
			workspace.onWillSaveTextDocument((_textDocumentWillSaveEvent) => {
				commands.executeCommand('sortwind.sortTailwindClasses');
			})
		);
	}
}
