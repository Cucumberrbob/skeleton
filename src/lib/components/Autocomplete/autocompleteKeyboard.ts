// Action: Focus Trap

import type { CssClasses } from '@skeletonlabs/skeleton';

export type AutocompleteKeyboardArgs = {
	target: string;
	highlightClass: CssClasses;
};

export function autocompleteKeyboard(node: HTMLElement, args: AutocompleteKeyboardArgs) {
	let focusIndex = 0;

	const el = document.querySelector(`[data-autocomplete="${args.target}"]`) as HTMLElement;
	if (!el) {
		throw new Error(
			`Autocomplete target "${args.target}" not found. Make sure you set the data-autocomplete attribute on the Autocomplete component.`
		);
	}

	function calculateListLength() {
		if (el) {
			return el.children.length;
		}
		return 1;
	}

	function clickOption(focusIndex: number) {
		const currentOption = el.children.item(focusIndex) as HTMLElement & { click(): void };
		currentOption.click();
	}
	function highlightOption(focusIndex: number) {
		const currentOption = el.children.item(focusIndex) as HTMLElement;
		if (!currentOption) return;
		// since we expect a space separated list of classes, we need to split them and add them individually
		args.highlightClass.split(' ').forEach((c) => currentOption.classList.add(c));
	}
	function unhighlightOption(focusIndex: number) {
		const currentOption = el.children.item(focusIndex) as HTMLElement;
		if (!currentOption) return;
		// since we expect a space separated list of classes, we need to split them and remove them individually
		args.highlightClass.split(' ').forEach((c) => currentOption.classList.remove(c));
	}

	function onKeyUp(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			unhighlightOption(focusIndex);
			focusIndex = (focusIndex + 1) % calculateListLength();
			highlightOption(focusIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			unhighlightOption(focusIndex);
			focusIndex = (focusIndex - 1 + calculateListLength()) % calculateListLength();
			highlightOption(focusIndex);
		} else if (e.key === 'Enter') {
			// this stops the form from submitting - is this desired?
			e.preventDefault();
			clickOption(focusIndex);
		} else {
			// we want to reset the highlight back to the top whenever the search term changes
			focusIndex === 0 && highlightOption(focusIndex);
			focusIndex = 0;
		}
	}
	node.addEventListener('keyup', onKeyUp);

	// set the first option as highlighted initially
	highlightOption(focusIndex);

	// Lifecycle
	return {
		destroy() {
			node.removeEventListener('keyup', onKeyUp);
		}
	};
}
