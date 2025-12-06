<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { selectedElement } from '$lib/stores.js';
	import { applyStyleProperty } from '$lib/dom-utils.js';
	// syncHTMLSource removed - changes are applied directly to DOM

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	/** @type {string} */
	let backgroundColor = '';

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
		
		// Convert background color to hex for color input
		const rawBackgroundColor = getStyleValue(element.style.backgroundColor, styles.backgroundColor);
		backgroundColor = rgbToHex(rawBackgroundColor);
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	/**
	 * Handle color change
	 */
	function handleColorChange(property, value) {
		if ($selectedElement && value) {
			const element = $selectedElement;
			applyStyleProperty(element, property, value);
			onPropertyChange(property, value);
			
			if (property === 'backgroundColor') backgroundColor = value;
			// Don't sync here - changes are applied directly to DOM
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
			
			if (property === 'backgroundColor') backgroundColor = '';
			// Don't sync here - changes are applied directly to DOM
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium"></h3>
	
	<div class="space-y-2">
		<Label for="background-color">Background Color</Label>
		<div class="flex gap-2">
			<Input
				id="background-color"
				bind:value={backgroundColor}
				oninput={() => handleColorChange('backgroundColor', backgroundColor)}
				placeholder="#ffffff"
				type="color"
				class="flex-1"
			/>
			<button
				onclick={() => clearColor('backgroundColor')}
				class="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-xs"
				title="Clear background color"
			>
				Clear
			</button>
		</div>
		{#if backgroundColor}
			<div class="text-xs text-muted-foreground">Current: {backgroundColor}</div>
		{/if}
	</div>
</div>