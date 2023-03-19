import { render, type RenderResult } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Autocomplete from './Autocomplete.svelte';
import { autocompleteKeyboard } from './autocompleteKeyboard';

interface TestContext {
	inputEl: HTMLInputElement;
	renderedComponent: RenderResult<Autocomplete, typeof import('@testing-library/dom/types/queries')>;
}
const testProps = {
	input: '',
	options: [
		{ label: 'foo', value: 'foo' },
		{ label: 'Foobar', value: 'Foobar' },
		{ label: 'Bar', value: 'Bar' },
		{ label: 'Buzz', value: 'Buzz' },
		{ label: 'Barney', value: 'Barney' }
	],
	'data-autocomplete': 'test'
};

describe<TestContext>('Actions: autocompleteKeyboard', () => {
	beforeEach<TestContext>((context) => {
		context.inputEl = document.createElement('input');
		context.renderedComponent = render(Autocomplete, {
			props: testProps
		});
		autocompleteKeyboard(context.inputEl, {
			target: 'test',
			highlightClass: 'variant-ringed-tertiary'
		});
	});
	it<TestContext>('renders with the first option selected to start', async (context) => {
		const { renderedComponent } = context;

		const firstOption = renderedComponent.getByText('foo');
		expect(firstOption.parentElement?.classList.contains('variant-ringed-tertiary')).toBe(true);
	});
	it<TestContext>('Moves the ring to the second element when the down arrow is pressed', async (context) => {
		const { inputEl, renderedComponent } = context;

		inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
		const secondOption = renderedComponent.getByText('Foobar');
		expect(secondOption.parentElement?.classList.contains('variant-ringed-tertiary')).toBe(true);
	});
	it<TestContext>('Moves the ring back to the first element when another key is pressed (the input changes)', async (context) => {
		const { inputEl, renderedComponent } = context;

		renderedComponent.rerender({
			props: { ...testProps, input: 'bar' }
		});
		//we also need to re-initialise the action, since the inputEL it has access to has changed
		autocompleteKeyboard(inputEl, {
			target: 'test',
			highlightClass: 'variant-ringed-tertiary'
		});
		const expectedOption = renderedComponent.getByText('Bar');
		expect(expectedOption.parentElement?.classList.contains('variant-ringed-tertiary')).toBe(true);
	});
	it<TestContext>('Only loops through visible options', (context) => {
		const { inputEl, renderedComponent } = context;

		renderedComponent.rerender({
			props: { ...testProps, input: 'bar' }
		});
		//we also need to re-initialise the action, since the inputEL it has access to has changed
		autocompleteKeyboard(inputEl, {
			target: 'test',
			highlightClass: 'variant-ringed-tertiary'
		});

		inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
		const expectedOption = renderedComponent.getByText('Barney');
		expect(expectedOption.parentElement?.classList.contains('variant-ringed-tertiary')).toBe(true);
	});
	it<TestContext>('Moves the ring to the last element when the up arrow is pressed and the first option is ringed', async (context) => {
		const { inputEl, renderedComponent } = context;

		inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
		const expectedOption = renderedComponent.getByText('Barney');
		expect(expectedOption.parentElement?.classList.contains('variant-ringed-tertiary')).toBe(true);
	});
	it<TestContext>('Fires the on:selection event with the selected option when the enter key is pressed', async (context) => {
		const { inputEl, renderedComponent } = context;

		let selected: (typeof testProps.options)[number] | undefined = { label: '', value: '' };
		const selectHandler = vi.fn((e) => (selected = e.detail.selection));
		renderedComponent.component.$on('selection', selectHandler);

		inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
		inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
		expect(selected.value).toBe('Foobar');
	});
});
