<script>
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { selectedElement } from '$lib/stores.js';
	import { applyStyleProperty } from '$lib/dom-utils.js';
	import { syncHTMLSource } from '$lib/html-sync.js';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	/** @type {string} */
	export let display = '';

	/** @type {string} */
	let justifyContent = '';
	/** @type {string} */
	let alignItems = '';
	/** @type {string} */
	let flexDirection = '';
	/** @type {string} */
	let flexWrap = '';

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Update local state when selected element changes
	 */
	function updateElementProperties(element) {
		if (!element || !element.isConnected) return;

		const styles = window.getComputedStyle(element);
		
		const getStyleValue = (inlineValue, computedValue) => {
			if (inlineValue && inlineValue !== '') {
				return inlineValue;
			}
			return computedValue || '';
		};
		
		justifyContent = getStyleValue(element.style.justifyContent, styles.justifyContent);
		alignItems = getStyleValue(element.style.alignItems, styles.alignItems);
		flexDirection = getStyleValue(element.style.flexDirection, styles.flexDirection);
		flexWrap = getStyleValue(element.style.flexWrap, styles.flexWrap);
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	// Watch for changes from Select components
	$: if (justifyContent && $selectedElement) {
		handleStyleChange('justifyContent', justifyContent);
	}

	$: if (alignItems && $selectedElement) {
		handleStyleChange('alignItems', alignItems);
	}

	$: if (flexDirection && $selectedElement) {
		handleStyleChange('flexDirection', flexDirection);
	}

	$: if (flexWrap && $selectedElement) {
		handleStyleChange('flexWrap', flexWrap);
	}

	/**
	 * Get justify content label
	 */
	function getJustifyContentLabel(value) {
		const labels = {
			'flex-start': 'Start',
			'center': 'Center',
			'flex-end': 'End',
			'space-between': 'Space Between',
			'space-around': 'Space Around',
			'space-evenly': 'Space Evenly'
		};
		return labels[value] || 'Start';
	}

	/**
	 * Get align items label
	 */
	function getAlignItemsLabel(value) {
		const labels = {
			'stretch': 'Stretch',
			'flex-start': 'Start',
			'center': 'Center',
			'flex-end': 'End',
			'baseline': 'Baseline'
		};
		return labels[value] || 'Stretch';
	}

	/**
	 * Get flex direction label
	 */
	function getFlexDirectionLabel(value) {
		const labels = {
			'row': 'Row',
			'column': 'Column',
			'row-reverse': 'Row Reverse',
			'column-reverse': 'Column Reverse'
		};
		return labels[value] || 'Row';
	}

	/**
	 * Get flex wrap label
	 */
	function getFlexWrapLabel(value) {
		const labels = {
			'nowrap': 'No Wrap',
			'wrap': 'Wrap',
			'wrap-reverse': 'Wrap Reverse'
		};
		return labels[value] || 'No Wrap';
	}

	/**
	 * Handle style change
	 */
	function handleStyleChange(property, value) {
		if ($selectedElement) {
			const element = $selectedElement;
			applyStyleProperty(element, property, value);
			onPropertyChange(property, value);
			syncHTMLSource();
		}
	}
</script>

{#if display === 'flex'}
	<div class="space-y-4">
		<h3 class="text-sm font-medium"></h3>
		
		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-2">
				<Label>Justify Content</Label>
				<Select.Root type="single" bind:value={justifyContent}>
					<Select.Trigger class="w-full">
						{getJustifyContentLabel(justifyContent)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="flex-start" label="Start">Start</Select.Item>
						<Select.Item value="center" label="Center">Center</Select.Item>
						<Select.Item value="flex-end" label="End">End</Select.Item>
						<Select.Item value="space-between" label="Space Between">Space Between</Select.Item>
						<Select.Item value="space-around" label="Space Around">Space Around</Select.Item>
						<Select.Item value="space-evenly" label="Space Evenly">Space Evenly</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<Label>Align Items</Label>
				<Select.Root type="single" bind:value={alignItems}>
					<Select.Trigger class="w-full">
						{getAlignItemsLabel(alignItems)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="stretch" label="Stretch">Stretch</Select.Item>
						<Select.Item value="flex-start" label="Start">Start</Select.Item>
						<Select.Item value="center" label="Center">Center</Select.Item>
						<Select.Item value="flex-end" label="End">End</Select.Item>
						<Select.Item value="baseline" label="Baseline">Baseline</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-2">
				<Label>Direction</Label>
				<Select.Root type="single" bind:value={flexDirection}>
					<Select.Trigger class="w-full">
						{getFlexDirectionLabel(flexDirection)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="row" label="Row">Row</Select.Item>
						<Select.Item value="column" label="Column">Column</Select.Item>
						<Select.Item value="row-reverse" label="Row Reverse">Row Reverse</Select.Item>
						<Select.Item value="column-reverse" label="Column Reverse">Column Reverse</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<Label>Wrap</Label>
				<Select.Root type="single" bind:value={flexWrap}>
					<Select.Trigger class="w-full">
						{getFlexWrapLabel(flexWrap)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="nowrap" label="No Wrap">No Wrap</Select.Item>
						<Select.Item value="wrap" label="Wrap">Wrap</Select.Item>
						<Select.Item value="wrap-reverse" label="Wrap Reverse">Wrap Reverse</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>
{/if}