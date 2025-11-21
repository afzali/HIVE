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

	// Typography variables
	/** @type {string} */
	let fontFamily = '';
	/** @type {string} */
	let fontSize = '';
	/** @type {string} */
	let fontWeight = '';
	/** @type {string} */
	let lineHeight = '';
	/** @type {string} */
	let letterSpacing = '';
	/** @type {string} */
	let textAlign = '';
	/** @type {string} */
	let textDecoration = '';
	/** @type {string} */
	let color = '';

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Update local state when selected element changes
	 */
	function updateElementProperties(element) {
		if (!element || !element.isConnected) return;

		const styles = window.getComputedStyle(element);
		
		// Helper function to clean up style values - prioritize inline styles
		const getStyleValue = (inlineValue, computedValue) => {
			if (inlineValue && inlineValue !== '') {
				return inlineValue;
			}
			return computedValue || '';
		};
		
		fontFamily = getStyleValue(element.style.fontFamily, styles.fontFamily);
		fontSize = getStyleValue(element.style.fontSize, styles.fontSize);
		fontWeight = getStyleValue(element.style.fontWeight, styles.fontWeight);
		lineHeight = getStyleValue(element.style.lineHeight, styles.lineHeight);
		letterSpacing = getStyleValue(element.style.letterSpacing, styles.letterSpacing);
		textAlign = getStyleValue(element.style.textAlign, styles.textAlign);
		textDecoration = getStyleValue(element.style.textDecoration, styles.textDecoration);
		
		// Convert color to hex for color input
		const rawColor = getStyleValue(element.style.color, styles.color);
		color = rgbToHex(rawColor);
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	// Watch for changes from Select components
	$: if (fontWeight && $selectedElement) {
		handleStyleChange('fontWeight', fontWeight);
	}

	$: if (textAlign && $selectedElement) {
		handleStyleChange('textAlign', textAlign);
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
	 * Get font weight label
	 */
	function getFontWeightLabel(weight) {
		const labels = {
			'100': 'Thin',
			'200': 'Extra Light',
			'300': 'Light',
			'400': 'Normal',
			'500': 'Medium',
			'600': 'Semi Bold',
			'700': 'Bold',
			'800': 'Extra Bold',
			'900': 'Black'
		};
		return labels[weight] || 'Normal';
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
	 * Handle color change
	 */
	function handleColorChange(property, value) {
		if ($selectedElement && value) {
			const element = $selectedElement;
			applyStyleProperty(element, property, value);
			onPropertyChange(property, value);
			
			// Update local state
			if (property === 'color') color = value;
			
			syncHTMLSource();
		}
	}

	/**
	 * Clear color (set to transparent)
	 */
	function clearColor(property) {
		if ($selectedElement) {
			const element = $selectedElement;
			element.style.removeProperty(property);
			onPropertyChange(property, '');
			
			// Update local state
			if (property === 'color') color = '';
			
			syncHTMLSource();
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium">Typography</h3>
	
	<div class="grid grid-cols-2 gap-2">
		<div class="space-y-2">
			<Label for="font-size">Font Size</Label>
			<Input
				id="font-size"
				bind:value={fontSize}
				oninput={() => handleStyleChange('fontSize', fontSize)}
				placeholder="16px"
			/>
		</div>
		<div class="space-y-2">
			<Label>Font Weight</Label>
			<Select.Root type="single" bind:value={fontWeight}>
				<Select.Trigger class="w-full">
					{fontWeight ? `${fontWeight} - ${getFontWeightLabel(fontWeight)}` : 'Normal'}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="100" label="100 - Thin">100 - Thin</Select.Item>
					<Select.Item value="200" label="200 - Extra Light">200 - Extra Light</Select.Item>
					<Select.Item value="300" label="300 - Light">300 - Light</Select.Item>
					<Select.Item value="400" label="400 - Normal">400 - Normal</Select.Item>
					<Select.Item value="500" label="500 - Medium">500 - Medium</Select.Item>
					<Select.Item value="600" label="600 - Semi Bold">600 - Semi Bold</Select.Item>
					<Select.Item value="700" label="700 - Bold">700 - Bold</Select.Item>
					<Select.Item value="800" label="800 - Extra Bold">800 - Extra Bold</Select.Item>
					<Select.Item value="900" label="900 - Black">900 - Black</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-2">
		<div class="space-y-2">
			<Label for="line-height">Line Height</Label>
			<Input
				id="line-height"
				bind:value={lineHeight}
				oninput={() => handleStyleChange('lineHeight', lineHeight)}
				placeholder="normal"
			/>
		</div>
		<div class="space-y-2">
			<Label for="letter-spacing">Letter Spacing</Label>
			<Input
				id="letter-spacing"
				bind:value={letterSpacing}
				oninput={() => handleStyleChange('letterSpacing', letterSpacing)}
				placeholder="normal"
			/>
		</div>
	</div>

	<div class="space-y-2">
		<Label>Text Align</Label>
		<Select.Root type="single" bind:value={textAlign}>
			<Select.Trigger class="w-full">
				{textAlign ? textAlign.charAt(0).toUpperCase() + textAlign.slice(1) : 'Left'}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="left" label="Left">Left</Select.Item>
				<Select.Item value="center" label="Center">Center</Select.Item>
				<Select.Item value="right" label="Right">Right</Select.Item>
				<Select.Item value="justify" label="Justify">Justify</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="space-y-2">
		<Label for="color">Text Color</Label>
		<div class="flex gap-2">
			<Input
				id="color"
				bind:value={color}
				oninput={() => handleColorChange('color', color)}
				placeholder="#000000"
				type="color"
				class="flex-1"
			/>
			<button
				onclick={() => clearColor('color')}
				class="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-xs"
				title="Clear color"
			>
				Clear
			</button>
		</div>
		{#if color}
			<div class="text-xs text-muted-foreground">Current: {color}</div>
		{/if}
	</div>
</div>