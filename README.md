<p align="center">
  <img src="./images/banner.png" alt="Explainer" width="750px">
</p>

Sortwind is an opinionated Tailwind CSS class sorter for Visual Studio Code. It enforces consistent ordering of classes by parsing your code and reprinting class tags to follow a given order.

> [!IMPORTANT]
> This project is a fork of [Headwind](https://github.com/heybourn/headwind), created by [Ryan Heybourn](https://github.com/heybourn).

<!-- [![CircleCI](https://circleci.com/gh/heybourn/headwind.svg?style=svg)](https://circleci.com/gh/heybourn/headwind) -->

> [!NOTE]
> Sortwind runs on save, will remove duplicate classes and can even sort entire workspaces.

<!--
**[Get it from the VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=heybourn.headwind)** -->

**Table of contents**

<!-- vscode-markdown-toc -->
* 1. [Demo](#Demo)
* 2. [Usage](#Usage)
* 3. [Customisation](#Customisation)
  * 3.1. [`sortwind.classRegex`](#sortwind.classRegex)
    * 3.1.1. [Multi-step Regex](#Multi-stepRegex)
    * 3.1.2. [Configuration Object](#ConfigurationObject)
    * 3.1.3. [Debugging Custom Regex](#DebuggingCustomRegex)
  * 3.2. [`sortwind.defaultSortOrder`](#sortwind.defaultSortOrder)
  * 3.3. [`sortwind.removeDuplicates`](#sortwind.removeDuplicates)
  * 3.4. [`sortwind.prependCustomClasses`](#sortwind.prependCustomClasses)
  * 3.5. [`sortwind.runOnSave`](#sortwind.runOnSave)
* 4. [Contributing](#Contributing)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

##  1. <a name='Demo'></a>Demo

<p align="center">
  <img src="./images/explainer.gif" alt="Explainer" width="750px">
</p>

##  2. <a name='Usage'></a>Usage

You can install Sortwind via the VS Code Marketplace, or package it yourself using [vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension). Sortwind works globally once installed and will run on save if a `tailwind.config.js` file is present within your working directory.

You can also trigger Sortwind by:

* Pressing ALT + Shift + T on Mac
* Pressing CTRL + ALT + T on Windows
* Pressing CTRL + ALT + T on Linux

Sortwind can sort individual files by running 'Sort Tailwind CSS Classes' via the Command Palette. Workspaces can also be sorted by running 'Sort Tailwind CSS Classes on Entire Workspace'.

Any breakpoints or unknown classes will be moved to the end of the class list, whilst duplicate classes will be removed.

##  3. <a name='Customisation'></a>Customisation

Sortwind ships with a default class order (located in [package.json](package.json)). You can edit this (and other settings) to your liking on the extension settings page.

###  3.1. <a name='sortwind.classRegex'></a>`sortwind.classRegex`

An object with language IDs as keys and their values determining the regex to search for Tailwind CSS classes.
The default is located in [package.json](package.json) but this can be customized to suit your needs.

There can be multiple capturing groups, that should only contain a string with Tailwind CSS classes (without any apostrophies etc.). If a new group, which doesn't contain the `class` string, is created, ensure that it is non-capturing by using `(?:)`.

Example from `package.json`:

```json
"sortwind.classRegex": {
    "html": "\\bclass\\s*=\\s*[\\\"\\']([_a-zA-Z0-9\\s\\-\\:\\/]+)[\\\"\\']",
    "javascriptreact": "(?:\\bclassName\\s*=\\s*[\\\"\\']([_a-zA-Z0-9\\s\\-\\:\\/]+)[\\\"\\'])|(?:\\btw\\s*`([_a-zA-Z0-9\\s\\-\\:\\/]*)`)"
}
```

####  3.1.1. <a name='Multi-stepRegex'></a>Multi-step Regex

A multi-step regex can be specified by using an array of regexes to be executed in order.

Example from `package.json`:

```js
"sortwind.classRegex": {
    "javascript": [
        "(?:\\bclass(?:Name)?\\s*=\\s*(?:{([\\w\\d\\s_\\-:/${}()[\\]\"'`,]+)})|([\"'`][\\w\\d\\s_\\-:/]+[\"'`]))|(?:\\btw\\s*(`[\\w\\d\\s_\\-:/]+`))",
        "(?:[\"'`]([\\w\\d\\s_\\-:/${}()[\\]\"']+)[\"'`])"
    ],
}
```

The first regex will look for JSX `class` or `className` attributes or [twin.macro](https://github.com/ben-rogerson/twin.macro) usage.

The second regex will then look for class names to be sorted within these matches.

####  3.1.2. <a name='ConfigurationObject'></a>Configuration Object

Optionally a configuration object can be passed to specify additional options for sorting class names.

* `regex` - specifies the regex to be used to find class names
* `separator` - regex pattern that is used to separate class names (default: `"\\s+"`)
* `replacement` - string used to replace separator matches (default: `" "`)

Example from `package.json`:

```js
"sortwind.classRegex": {
    "jade": [
        {
            "regex": "\\.([\\._a-zA-Z0-9\\-]+)",
            "separator": "\\.",
            "replacement": "."
        },
        "\\bclass\\s*=\\s*[\\\"\\']([_a-zA-Z0-9\\s\\-\\:\\/]+)[\\\"\\']"
    ],
}
```

####  3.1.3. <a name='DebuggingCustomRegex'></a>Debugging Custom Regex

To debug custom `classRegex`, you can use the code below:

```js
// Your test string here
const editorText = `
  export const Layout = ({ children }) => (
    <div class="h-screen">
      <div className="w-64 h-full bg-blue-400 relative"></div>
      <div>{children}</div>
    </div>
  )
`
// Your Regex here
const regex = /(?:\b(?:class|className)?\s*=\s*{?[\"\']([_a-zA-Z0-9\s\-\:/]+)[\"\']}?)/
const classWrapperRegex = new RegExp(regex, 'gi')

let classWrapper
while ((classWrapper = classWrapperRegex.exec(editorText)) !== null) {
  const wrapperMatch = classWrapper[0]
  const valueMatchIndex = classWrapper.findIndex((match, idx) => idx !== 0 && match)
  const valueMatch = classWrapper[valueMatchIndex]

  console.log('classWrapper', classWrapper)
  console.log('wrapperMatch', wrapperMatch)
  console.log('valueMatchIndex', valueMatchIndex)
  console.log('valueMatch', valueMatch)
}
```

The result of `valueMatch` should be the class text _exactly_, with no other characters.

Good example value: `valueMatch w-64 h-full bg-blue-400 relative`

**Note**: Changes made to Sortwind's JSON configuration options may not take effect immediately. When experimenting with custom `classRegex`, after each change you should open the control pallete (Ctrl/Cmd + Shift + P) and run `Developer: Reload Window` to ensure changes are applied.

<hr>

###  3.2. <a name='sortwind.defaultSortOrder'></a>`sortwind.defaultSortOrder`

An array that determines Sortwind's default sort order.

###  3.3. <a name='sortwind.removeDuplicates'></a>`sortwind.removeDuplicates`

Sortwind will remove duplicate class names by default. This can be toggled on or off.

`"sortwind.removeDuplicates": true`

###  3.4. <a name='sortwind.prependCustomClasses'></a>`sortwind.prependCustomClasses`

Sortwind will append custom class names by default. They can be prepended instead.

`"sortwind.prependCustomClasses": true`

###  3.5. <a name='sortwind.runOnSave'></a>`sortwind.runOnSave`

Sortwind will run on save by default (if a `tailwind.config.js` file is present within your working directory). This can be toggled on or off.

`"sortwind.runOnSave": true`

##  4. <a name='Contributing'></a>Contributing

Sortwind is open-source and contributions are always welcome. If you're interested in submitting a pull request, please take a moment to review [CONTRIBUTING.md](.github/CONTRIBUTING.md).

<!-- ## Contributors -->
<!--
###  4.1. <a name='FinancialContributors'></a>Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/headwind/contribute)] -->

<!-- #### Individuals

<a href="https://opencollective.com/headwind"><img src="https://opencollective.com/headwind/individuals.svg?width=890"></a>

####  4.1.1. <a name='Organizations'></a>Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/headwind/contribute)]

<a href="https://opencollective.com/headwind/organization/0/website"><img src="https://opencollective.com/headwind/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/headwind/organization/1/website"><img src="https://opencollective.com/headwind/organization/1/avatar.svg"></a> -->
