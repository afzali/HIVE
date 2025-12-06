<script>
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { selectedElement } from '$lib/stores.js';
	import { applyStyleProperty } from '$lib/dom-utils.js';
	// syncHTMLSource removed - changes are applied directly to DOM

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
	 * Get display label
	 */
	function getDisplayLabel(displayValue) {
		const labels = {
			'block': 'Block',
			'inline': 'Inline',
			'inline-block': 'Inline Block',
			'flex': 'Flex',
			'grid': 'Grid',
			'none': 'None'
		};
		return labels[displayValue] || 'Block';
	}

	/**
	 * Handle display change
	 */
	function handleDisplayChange(newDisplay) {
		if ($selectedElement && newDisplay) {
			const element = $selectedElement;
			applyStyleProperty(element, 'display', newDisplay);
			onPropertyChange('display', newDisplay);
			// Don't sync here - changes are applied directly to DOM
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
			// Don't sync here - changes are applied directly to DOM
		}
	}

	// Watch for display changes from Select component
	$: if (display && $selectedElement) {
		handleDisplayChange(display);
	}

	// Watch for position changes from Select component  
	$: if (position && $selectedElement) {
		handleStyleChange('position', position);
	}

	// Export display for FlexboxSection
	export { display };
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium"></h3>
	
	<div class="space-y-2">
		<Label>Display</Label>
		<Select.Root type="single" bind:value={display}>
			<Select.Trigger class="w-full">
				{getDisplayLabel(display)}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="block" label="Block">Block</Select.Item>
				<Select.Item value="inline" label="Inline">Inline</Select.Item>
				<Select.Item value="inline-block" label="Inline Block">Inline Block</Select.Item>
				<Select.Item value="flex" label="Flex">Flex</Select.Item>
				<Select.Item value="grid" label="Grid">Grid</Select.Item>
				<Select.Item value="none" label="None">None</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="space-y-2">
		<Label>Position</Label>
		<Select.Root type="single" bind:value={position}>
			<Select.Trigger class="w-full">
				{position ? position.charAt(0).toUpperCase() + position.slice(1) : 'Static'}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="static" label="Static">Static</Select.Item>
				<Select.Item value="relative" label="Relative">Relative</Select.Item>
				<Select.Item value="absolute" label="Absolute">Absolute</Select.Item>
				<Select.Item value="fixed" label="Fixed">Fixed</Select.Item>
				<Select.Item value="sticky" label="Sticky">Sticky</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
</div>