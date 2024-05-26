'use strict';

import { commands, workspace, ExtensionContext, Range, window } from 'vscode';
import { sortClassString, getTextMatch, buildMatchers } from './utils';
import { spawn } from 'node:child_process';
import { rustyWindPath } from 'rustywind';
import { LangConfig, Options } from "./types";
import { SortwindConfig } from "./constants/sortwind";

const config = workspace.getConfiguration();
const langConfig: { [key: string]: LangConfig | LangConfig[] } =
	config.get(SortwindConfig.CLASS_REGEX) || {};

const sortOrder = config.get(SortwindConfig.DEFAULT_SORT_ORDER);

const customTailwindPrefixConfig = config.get(SortwindConfig.CUSTOM_TAILWIND_PREFIX);
const customTailwindPrefix =
	typeof customTailwindPrefixConfig === 'string'
		? customTailwindPrefixConfig
		: '';

const shouldRemoveDuplicatesConfig = config.get(SortwindConfig.REMOVE_DUPLICATES);
const shouldRemoveDuplicates =
	typeof shouldRemoveDuplicatesConfig === 'boolean'
		? shouldRemoveDuplicatesConfig
		: true;

const shouldPrependCustomClassesConfig = config.get(
	SortwindConfig.PREPEND_CUSTOM_CLASSES
);
const shouldPrependCustomClasses =
	typeof shouldPrependCustomClassesConfig === 'boolean'
		? shouldPrependCustomClassesConfig
		: false;

export function activate(context: ExtensionContext) {
	const disposable = commands.registerTextEditorCommand(
		SortwindConfig.SORT_TAILWIND_CLASSES,
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
		SortwindConfig.SORT_TAILWIND_CLASSES_ON_WORKSPACE,
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
	if (config.get(SortwindConfig.RUN_ON_SAVE)) {
		context.subscriptions.push(
			workspace.onWillSaveTextDocument((_textDocumentWillSaveEvent) => {
				commands.executeCommand(SortwindConfig.SORT_TAILWIND_CLASSES);
			})
		);
	}
}
