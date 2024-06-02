'use strict';

import {
  commands,
  workspace,
  ExtensionContext,
  Range,
  window,
  TextEditor,
  TextEditorEdit,
} from 'vscode';
import {
  sortClassString,
  processNestedRegexMatches,
  buildMatchers,
} from './utils';
import { spawn } from 'node:child_process';
import { rustyWindPath } from 'rustywind';
import { LangConfigValue, Matcher, Options } from './types';
import { SortwindConfig } from './constants/sortwind';
import { LANGUAGE_CONFIG } from './constants/language';
import { RustywindArgs } from './constants/rustywind';

const config = workspace.getConfiguration();

const sortwindConfig = {
  langConfig: (config.get(SortwindConfig.CLASS_REGEX) || {}) as Record<
    string,
    LangConfigValue | LangConfigValue[]
  >,
  sortOrder: config.get(SortwindConfig.DEFAULT_SORT_ORDER),
  customTailwindPrefix: config.get(SortwindConfig.CUSTOM_TAILWIND_PREFIX),
  shouldRemoveDuplicates: config.get(SortwindConfig.REMOVE_DUPLICATES),
  shouldPrependCustomClasses: config.get(SortwindConfig.PREPEND_CUSTOM_CLASSES),
  runOnSave: config.get(SortwindConfig.RUN_ON_SAVE),
} as const;

type SortwindConfigKeys = keyof typeof sortwindConfig;

const sortwindConfigValues = {
  sortOrder: Array.isArray(sortwindConfig.sortOrder)
    ? sortwindConfig.sortOrder
    : [],

  customTailwindPrefix:
    typeof sortwindConfig.customTailwindPrefix === 'string'
      ? sortwindConfig.customTailwindPrefix
      : '',

  shouldRemoveDuplicates:
    typeof sortwindConfig.shouldRemoveDuplicates === 'boolean'
      ? sortwindConfig.shouldRemoveDuplicates
      : true,

  shouldPrependCustomClasses:
    typeof sortwindConfig.shouldPrependCustomClasses === 'boolean'
      ? sortwindConfig.shouldPrependCustomClasses
      : false,
} satisfies Partial<Record<SortwindConfigKeys, unknown>>;

function getRange(editor: TextEditor, startPosition: number, text: string) {
  const endPosition = startPosition + text.length;
  const range = new Range(
    editor.document.positionAt(startPosition),
    editor.document.positionAt(endPosition),
  );

  return range;
}

function getOptions(matcher: Matcher): Options {
  return {
    shouldRemoveDuplicates: sortwindConfigValues.shouldRemoveDuplicates,
    shouldPrependCustomClasses: sortwindConfigValues.shouldPrependCustomClasses,
    customTailwindPrefix: sortwindConfigValues.customTailwindPrefix,
    separator: matcher.separator,
    replacement: matcher.replacement,
  };
}

function replaceAndSortTextInEditor(
  matchers: Matcher[],
  editor: TextEditor,
  edit: TextEditorEdit,
) {
  const editorText = editor.document.getText();

  for (const matcher of matchers) {
    processNestedRegexMatches(
      matcher.regex,
      editorText,
      (text, startPosition) => {
        const range = getRange(editor, startPosition, text);
        const sortedStringCssClasses = sortClassString(
          text,
          sortwindConfigValues.sortOrder,
          getOptions(matcher),
        );

        edit.replace(range, sortedStringCssClasses);
      },
    );
  }
}

function resolveLangConfig(editorLangId: string) {
  return (
    sortwindConfig.langConfig[editorLangId] ||
    sortwindConfig.langConfig[LANGUAGE_CONFIG.HTML]
  );
}

export function activate(context: ExtensionContext) {
  const disposable = commands.registerTextEditorCommand(
    SortwindConfig.SORT_TAILWIND_CLASSES,
    function (editor, edit) {
      const editorLangId = editor.document.languageId;

      const matchers: Matcher[] = buildMatchers(
        resolveLangConfig(editorLangId),
      );

      replaceAndSortTextInEditor(matchers, editor, edit);
    },
  );

  const runOnProject = commands.registerCommand(
    SortwindConfig.SORT_TAILWIND_CLASSES_ON_WORKSPACE,
    () => {
      const workspaceFolder = workspace.workspaceFolders || [];
      if (workspaceFolder[0]) {
        window.showInformationMessage(
          `Running Sortwind on: ${workspaceFolder[0].uri.fsPath}`,
        );

        const rustyWindArgs = [
          workspaceFolder[0].uri.fsPath,
          RustywindArgs.WRITE,
          sortwindConfigValues.shouldRemoveDuplicates
            ? ''
            : RustywindArgs.ALLOW_DUPLICATES,
        ].filter((argument) => argument !== '');

        const rustyWindProc = spawn(rustyWindPath, rustyWindArgs);

        rustyWindProc.stdout.on(
          'data',
          (data) =>
            data?.toString() !== '' &&
            console.log('rustywind stdout:\n', data.toString()),
        );

        rustyWindProc.stderr.on('data', (data) => {
          if (data?.toString() !== '') {
            console.log('rustywind stderr:\n', data.toString());
            window.showErrorMessage(`Sortwind error: ${data.toString()}`);
          }
        });
      }
    },
  );

  context.subscriptions.push(runOnProject, disposable);

  // if runOnSave is enabled organize tailwind classes before saving
  if (sortwindConfig.runOnSave) {
    context.subscriptions.push(
      workspace.onWillSaveTextDocument((_textDocumentWillSaveEvent) => {
        commands.executeCommand(SortwindConfig.SORT_TAILWIND_CLASSES);
      }),
    );
  }
}
