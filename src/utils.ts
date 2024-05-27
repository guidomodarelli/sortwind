import { LangConfig, Matcher, Options, TextMatchCallback } from './types';

/**
 * Sorts a string of CSS classes according to a predefined order.
 * @param classString The string to sort
 * @param sortOrder The default order to sort the array at
 *
 * @returns The sorted string
 */
export function sortClassString(
	classString: string,
	sortOrder: string[],
	options: Options
): string {
	let classArray = classString.split(options.separator || /\s+/g);

	if (options.shouldRemoveDuplicates) {
		classArray = removeDuplicates(classArray);
	}

	// prepend custom tailwind prefix to all tailwind sortOrder-classes
	const sortOrderClone = [...sortOrder];
	if (options.customTailwindPrefix.length > 0) {
		for (let i = 0; i < sortOrderClone.length; i++) {
			sortOrderClone[i] = options.customTailwindPrefix + sortOrderClone[i];
		}
	}

	classArray = sortClassArray(
		classArray,
		sortOrderClone,
		options.shouldPrependCustomClasses
	);

	return classArray.join(options.replacement || ' ').trim();
}

/**
 * Sorts an array of CSS classes based on a specific sorting order and an
 * optional setting to include custom classes.
 * @param {string[]} classArray - The array of CSS classes to be sorted.
 * @param {string[]} sortOrder - The array defining the desired sorting order
 * for the CSS classes.
 * @param {boolean} shouldPrependCustomClasses - Indicates whether classes not
 * in the sortOrder should be added at the beginning (true) or at the end
 * (false) of the sorted array.
 * @returns {string[]} A new sorted array of CSS classes.
 */
function sortClassArray(
	classArray: string[],
	sortOrder: string[],
	shouldPrependCustomClasses: boolean
): string[] {
	const result: string[] = [];

	// append the classes that were not in the sort order if configured this way
	const customClassesToAppend = classArray.filter(
		(element) => shouldPrependCustomClasses && !sortOrder.includes(element)
	);

	const sortedClassesInOrder = classArray
		// take the classes that are in the sort order
		.filter((element) => sortOrder.includes(element))
		.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));

	// prepend the classes that were not in the sort order if configured this way
	const customClassesToPrepend = classArray.filter(
		(element) => !shouldPrependCustomClasses && !sortOrder.includes(element)
	);

	result.push(
		...customClassesToAppend,
		...sortedClassesInOrder,
		...customClassesToPrepend
	);

	return result;
}

/**
 * The `removeDuplicates` function takes an array of strings and returns a new
 * array with duplicate values removed.
 * @param {string[]} classArray - An array of strings containing class names.
 */
function removeDuplicates(classArray: string[]): string[] {
	return [...new Set(classArray)];
}

/**
 * The function `isArrayOfStrings` checks if a value is an array containing only
 * string elements.
 * @param {unknown} value - The `isArrayOfStrings` function checks if the
 * `value` is an array of strings by verifying if it is an array and if every
 * element in the array is of type `string`.
 * @returns The function `isArrayOfStrings` returns a boolean value indicating
 * whether the input `value` is an array of strings or not.
 */
function isArrayOfStrings(value: unknown): value is string[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === 'string')
	);
}

/**
 * The function `buildMatcher` takes a `LangConfig` value and returns a `Matcher`
 * object based on the type and properties of the input value.
 * @param {LangConfig} value - The input configuration to build a matcher from.
 * @returns The function `buildMatcher` returns an object `Matcher`.
 */
function buildMatcher(value: LangConfig): Matcher {
	if (typeof value === 'string') {
		return {
			regex: [new RegExp(value, 'gi')],
		};
	} else if (isArrayOfStrings(value)) {
		return {
			regex: value.map((value_) => new RegExp(value_, 'gi')),
		};
	} else if (value == undefined) {
		return {
			regex: [],
		};
	} else {
		let regex: RegExp[] = [];
		if (typeof value.regex === 'string') {
			regex = [new RegExp(value.regex, 'gi')];
		} else if (isArrayOfStrings(value.regex)) {
			regex = value.regex.map((value_) => new RegExp(value_, 'gi'));
		}

		let separator;
		if (typeof value.separator === 'string') {
			separator = new RegExp(value.separator, 'g');
		}

		return {
			regex,
			separator,
			replacement: value.replacement || value.separator,
		};
	}
}

/**
 * The function `buildMatchers` takes a value or an array of values, checks their
 * type, and returns an array of Matcher objects.
 * @param {LangConfig | LangConfig[]} value - The input configuration(s) to
 * build matchers from.
 * @returns An array of Matcher objects is being returned.
 */
export function buildMatchers(value: LangConfig | LangConfig[]): Matcher[] {
	if (value == undefined) {
		return [];
	} else if (Array.isArray(value)) {
		if (value.length === 0) {
			return [];
		} else if (!isArrayOfStrings(value)) {
			return value.map((value_) => buildMatcher(value_));
		}
	}
	return [buildMatcher(value)];
}

/**
 * The function `getTextMatch` takes an array of regular expressions, a text
 * string, a callback function, and an optional starting position, and
 * recursively matches the regular expressions in the text string, calling the
 * callback function with the matched text and its position.
 * @param {RegExp[]} regexes - it will be used to search for matches in the
 * `text` parameter.
 * @param {string} text - which you want to search for matches based on the
 * provided regular expressions.
 * @param callback - is a function that takes two arguments: `text` (a string)
 * and `startPosition` (a number). This callback function is called for each
 * match found in the `text` based on the provided regular expressions.
 * @param {number} [startPosition=0] - represents the starting index in the
 * `text` string from which the search for matches should begin. By default, it
 * is set to 0 if no value is provided when calling the function. This parameter
 * allows you to specify an initial position
 */
export function getTextMatch(
	regexes: RegExp[],
	text: string,
	callback: TextMatchCallback,
	startPosition: number = 0
): void {
	if (regexes.length <= 0) return;

	let wrapper: RegExpExecArray | null;
	while ((wrapper = regexes[0].exec(text)) !== null) {
		const wrapperMatch = wrapper[0];
		const valueMatchIndex = wrapper.findIndex(
			(match, index) => index !== 0 && match
		);
		const valueMatch = wrapper[valueMatchIndex];

		const newStartPosition =
			startPosition + wrapper.index + wrapperMatch.lastIndexOf(valueMatch);

		if (regexes.length === 1) {
			callback(valueMatch, newStartPosition);
		} else {
			getTextMatch(regexes.slice(1), valueMatch, callback, newStartPosition);
		}
	}
}
