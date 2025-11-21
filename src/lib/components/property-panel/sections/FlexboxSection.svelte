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
		<h3 class="text-sm font-medium">Flexbox</h3>
		
		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-2">
				<Label>Justify Content</Label>
				<Select.Root type="single"
					value={justifyContent}
					onValueChange={(value) => handleStyleChange('justifyContent', value)}
				>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Start" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="flex-start">Start</Select.Item>
						<Select.Item value="center">Center</Select.Item>
						<Select.Item value="flex-end">End</Select.Item>
						<Select.Item value="space-between">Space Between</Select.Item>
						<Select.Item value="space-around">Space Around</Select.Item>
						<Select.Item value="space-evenly">Space Evenly</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<Label>Align Items</Label>
				<Select.Root type="single"
					value={alignItems}
					onValueChange={(value) => handleStyleChange('alignItems', value)}
				>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Stretch" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="stretch">Stretch</Select.Item>
						<Select.Item value="flex-start">Start</Select.Item>
						<Select.Item value="center">Center</Select.Item>
						<Select.Item value="flex-end">End</Select.Item>
						<Select.Item value="baseline">Baseline</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-2">
				<Label>Direction</Label>
				<Select.Root type="single"
					value={flexDirection}
					onValueChange={(value) => handleStyleChange('flexDirection', value)}
				>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Row" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="row">Row</Select.Item>
						<Select.Item value="column">Column</Select.Item>
						<Select.Item value="row-reverse">Row Reverse</Select.Item>
						<Select.Item value="column-reverse">Column Reverse</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<Label>Wrap</Label>
				<Select.Root type="single"
					value={flexWrap}
					onValueChange={(value) => handleStyleChange('flexWrap', value)}
				>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="No Wrap" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="nowrap">No Wrap</Select.Item>
						<Select.Item value="wrap">Wrap</Select.Item>
						<Select.Item value="wrap-reverse">Wrap Reverse</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>
{/if}