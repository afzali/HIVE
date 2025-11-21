<script>
	import { Input } from '$lib/components/ui/input';
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
	let borderWidth = '';
	/** @type {string} */
	let borderStyle = '';
	/** @type {string} */
	let borderColor = '';

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
		
		borderWidth = getStyleValue(element.style.borderWidth, styles.borderWidth);
		borderStyle = getStyleValue(element.style.borderStyle, styles.borderStyle);
		
		// Convert border color to hex for color input
		const rawBorderColor = getStyleValue(element.style.borderColor, styles.borderColor);
		borderColor = rgbToHex(rawBorderColor);
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	// Watch for changes from Select component
	$: if (borderStyle && $selectedElement) {
		handleStyleChange('borderStyle', borderStyle);
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

	/**
	 * Handle color change
	 */
	function handleColorChange(property, value) {
		if ($selectedElement && value) {
			const element = $selectedElement;
			applyStyleProperty(element, property, value);
			onPropertyChange(property, value);
			
			if (property === 'borderColor') borderColor = value;
			
			syncHTMLSource();
		}
	}

	/**
	 * Convert RGB color to hex format for color input
	 */
	function rgbToHex(rgb) {
		if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '';
		
		// If already hex, return as is
		if (rgb.startsWith('#')) return rgb;
		
		// Extract RGB values
		const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (!match) return rgb;
		
		const r = parseInt(match[1]);
		const g = parseInt(match[2]);
		const b = parseInt(match[3]);
		
		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}

	/**
	 * Clear color (remove property)
	 */
	function clearColor(property) {
		if ($selectedElement) {
			const element = $selectedElement;
			element.style.removeProperty(property);
			onPropertyChange(property, '');
			
			if (property === 'borderColor') borderColor = '';
			
			syncHTMLSource();
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium">Border</h3>
	
	<div class="grid grid-cols-2 gap-2">
		<div class="space-y-2">
			<Label for="border-width">Width</Label>
			<Input
				id="border-width"
				bind:value={borderWidth}
				oninput={() => handleStyleChange('borderWidth', borderWidth)}
				placeholder="0px"
			/>
		</div>
		<div class="space-y-2">
			<Label>Style</Label>
			<Select.Root type="single" bind:value={borderStyle}>
				<Select.Trigger class="w-full">
					{borderStyle ? borderStyle.charAt(0).toUpperCase() + borderStyle.slice(1) : 'None'}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="none" label="None">None</Select.Item>
					<Select.Item value="solid" label="Solid">Solid</Select.Item>
					<Select.Item value="dashed" label="Dashed">Dashed</Select.Item>
					<Select.Item value="dotted" label="Dotted">Dotted</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="space-y-2">
		<Label for="border-color">Border Color</Label>
		<div class="flex gap-2">
			<Input
				id="border-color"
				bind:value={borderColor}
				oninput={() => handleColorChange('borderColor', borderColor)}
				placeholder="#000000"
				type="color"
				class="flex-1"
			/>
			<button
				onclick={() => clearColor('borderColor')}
				class="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-xs"
				title="Clear border color"
			>
				Clear
			</button>
		</div>
		{#if borderColor}
			<div class="text-xs text-muted-foreground">Current: {borderColor}</div>
		{/if}
	</div>
</div>