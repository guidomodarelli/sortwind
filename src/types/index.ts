type MatcherReplacement = {
	replacement?: string;
};

type MatcherSeparator<T extends string | RegExp = RegExp> = {
	separator?: T;
};

type MatcherString = MatcherReplacement &
	MatcherSeparator<string> & {
		regex?: string | string[];
	};

export type LangConfig = string | string[] | MatcherString | undefined;

export type Options = MatcherReplacement &
	MatcherSeparator & {
		shouldRemoveDuplicates: boolean;
		shouldPrependCustomClasses: boolean;
		customTailwindPrefix: string;
	};

export type Matcher = MatcherReplacement &
	MatcherSeparator & {
		regex: RegExp[];
	};

export type TextMatchCallback = (text: string, startPosition: number) => void;
