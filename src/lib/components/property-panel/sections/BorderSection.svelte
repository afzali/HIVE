<script>
	import { Input } from '$lib/components/ui/input';
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
	let borderWidth = '';
	/** @type {string} */
	let borderStyle = '';
	/** @type {string} */
	let borderColor = '';

	// Unit selector
	/** @type {string} */
	let borderWidthUnit = 'px';

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Extract numeric value and unit from CSS value
	 */
	function parseValue(value) {
		if (!value || value === '0') return { number: '0', unit: 'px' };
		const match = value.match(/^(-?\d*\.?\d+)(.*)$/);
		if (match) {
			return { number: match[1], unit: match[2] || 'px' };
		}
		return { number: '', unit: 'px' };
	}

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
		
		// Parse border width
		const borderWidthValue = getStyleValue(element.style.borderWidth, styles.borderWidth);
		const bwParsed = parseValue(borderWidthValue);
		borderWidth = bwParsed.number;
		borderWidthUnit = bwParsed.unit;
		
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

	// Watch for unit changes
	$: if (borderWidthUnit) {
		handleUnitChange(borderWidthUnit);
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

	/**
	 * Handle border width change
	 */
	function handleBorderWidthChange(value, unit) {
		if ($selectedElement && value !== '') {
			const processedValue = value === '0' ? '0' : `${value}${unit}`;
			
			const element = $selectedElement;
			applyStyleProperty(element, 'borderWidth', processedValue);
			onPropertyChange('borderWidth', processedValue);
			// Don't sync here - changes are applied directly to DOM
		}
	}

	/**
	 * Handle unit change
	 */
	function handleUnitChange(unit) {
		borderWidthUnit = unit;
		if (borderWidth !== '') handleBorderWidthChange(borderWidth, unit);
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
			
			if (property === 'borderColor') borderColor = '';
			// Don't sync here - changes are applied directly to DOM
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium"></h3>
	
	<!-- Border Width -->
	<div class="space-y-2">
		<Label class="text-xs">Width</Label>
		<div class="flex gap-2">
			<Input
				bind:value={borderWidth}
				oninput={() => handleBorderWidthChange(borderWidth, borderWidthUnit)}
				placeholder="0"
				class="flex-1"
				type="number"
			/>
			<Select.Root type="single" bind:value={borderWidthUnit}>
				<Select.Trigger class="w-20 h-9 text-xs">
					{borderWidthUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="%" label="%">%</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- Border Style -->
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