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
	let display = '';
	/** @type {string} */
	let position = '';

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
		
		display = getStyleValue(element.style.display, styles.display);
		position = getStyleValue(element.style.position, styles.position);
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	/**
	 * Handle display change
	 */
	function handleDisplayChange(newDisplay) {
		if ($selectedElement && newDisplay) {
			const element = $selectedElement;
			applyStyleProperty(element, 'display', newDisplay);
			display = newDisplay;
			onPropertyChange('display', newDisplay);
			syncHTMLSource();
		}
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

	// Export display for FlexboxSection
	export { display };
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium">Layout</h3>
	
	<div class="space-y-2">
		<Label>Display</Label>
		<Select.Root type="single"
			value={display}
			onValueChange={handleDisplayChange}
		>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Select display" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="block">Block</Select.Item>
				<Select.Item value="inline">Inline</Select.Item>
				<Select.Item value="inline-block">Inline Block</Select.Item>
				<Select.Item value="flex">Flex</Select.Item>
				<Select.Item value="grid">Grid</Select.Item>
				<Select.Item value="none">None</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="space-y-2">
		<Label>Position</Label>
		<Select.Root type="single"
			value={position}
			onValueChange={(value) => handleStyleChange('position', value)}
		>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Static" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="static">Static</Select.Item>
				<Select.Item value="relative">Relative</Select.Item>
				<Select.Item value="absolute">Absolute</Select.Item>
				<Select.Item value="fixed">Fixed</Select.Item>
				<Select.Item value="sticky">Sticky</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
</div>