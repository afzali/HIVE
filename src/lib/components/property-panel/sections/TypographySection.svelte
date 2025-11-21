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

	// Unit selectors
	/** @type {string} */
	let fontSizeUnit = 'px';
	/** @type {string} */
	let lineHeightUnit = 'px';
	/** @type {string} */
	let letterSpacingUnit = 'px';

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Extract numeric value and unit from CSS value
	 */
	function parseValue(value) {
		if (!value || value === 'normal' || value === 'auto') return { number: '', unit: 'px' };
		if (value === '0') return { number: '0', unit: 'px' };
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
		
		// Helper function to clean up style values - prioritize inline styles
		const getStyleValue = (inlineValue, computedValue) => {
			if (inlineValue && inlineValue !== '') {
				return inlineValue;
			}
			return computedValue || '';
		};
		
		fontFamily = getStyleValue(element.style.fontFamily, styles.fontFamily);
		
		// Parse font size
		const fontSizeValue = getStyleValue(element.style.fontSize, styles.fontSize);
		const fsParsed = parseValue(fontSizeValue);
		fontSize = fsParsed.number;
		fontSizeUnit = fsParsed.unit;
		
		fontWeight = getStyleValue(element.style.fontWeight, styles.fontWeight);
		
		// Parse line height
		const lineHeightValue = getStyleValue(element.style.lineHeight, styles.lineHeight);
		const lhParsed = parseValue(lineHeightValue);
		lineHeight = lhParsed.number;
		lineHeightUnit = lhParsed.unit;
		
		// Parse letter spacing
		const letterSpacingValue = getStyleValue(element.style.letterSpacing, styles.letterSpacing);
		const lsParsed = parseValue(letterSpacingValue);
		letterSpacing = lsParsed.number;
		letterSpacingUnit = lsParsed.unit;
		
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

	// Watch for unit changes
	$: if (fontSizeUnit) {
		handleUnitChange('fontSize', fontSizeUnit);
	}

	$: if (lineHeightUnit) {
		handleUnitChange('lineHeight', lineHeightUnit);
	}

	$: if (letterSpacingUnit) {
		handleUnitChange('letterSpacing', letterSpacingUnit);
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
	 * Handle typography dimension change
	 */
	function handleTypographyChange(property, value, unit) {
		if ($selectedElement && value !== '') {
			const processedValue = value === '0' ? '0' : unit === 'normal' ? 'normal' : `${value}${unit}`;
			
			const element = $selectedElement;
			applyStyleProperty(element, property, processedValue);
			onPropertyChange(property, processedValue);
			syncHTMLSource();
		}
	}

	/**
	 * Handle unit change
	 */
	function handleUnitChange(property, unit) {
		if (property === 'fontSize') {
			fontSizeUnit = unit;
			if (fontSize !== '') handleTypographyChange('fontSize', fontSize, unit);
		} else if (property === 'lineHeight') {
			lineHeightUnit = unit;
			if (lineHeight !== '') handleTypographyChange('lineHeight', lineHeight, unit);
		} else if (property === 'letterSpacing') {
			letterSpacingUnit = unit;
			if (letterSpacing !== '') handleTypographyChange('letterSpacing', letterSpacing, unit);
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
	<h3 class="text-sm font-medium"></h3>
	
	<!-- Font Size -->
	<div class="space-y-2">
		<Label class="text-xs">Font Size</Label>
		<div class="flex gap-2">
			<Input
				bind:value={fontSize}
				oninput={() => handleTypographyChange('fontSize', fontSize, fontSizeUnit)}
				placeholder="16"
				class="flex-1"
				type="number"
			/>
			<Select.Root type="single" bind:value={fontSizeUnit}>
				<Select.Trigger class="w-20 h-9 text-xs">
					{fontSizeUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="%" label="%">%</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
					<Select.Item value="pt" label="pt">pt</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- Font Weight -->
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

	<!-- Line Height -->
	<div class="space-y-2">
		<Label class="text-xs">Line Height</Label>
		<div class="flex gap-2">
			<Input
				bind:value={lineHeight}
				oninput={() => handleTypographyChange('lineHeight', lineHeight, lineHeightUnit)}
				placeholder="1.5"
				class="flex-1"
				type="number"
				step="0.1"
			/>
			<Select.Root type="single" bind:value={lineHeightUnit}>
				<Select.Trigger class="w-20 h-9 text-xs">
					{lineHeightUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="normal" label="normal">normal</Select.Item>
					<Select.Item value="" label="unitless">unitless</Select.Item>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="%" label="%">%</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- Letter Spacing -->
	<div class="space-y-2">
		<Label class="text-xs">Letter Spacing</Label>
		<div class="flex gap-2">
			<Input
				bind:value={letterSpacing}
				oninput={() => handleTypographyChange('letterSpacing', letterSpacing, letterSpacingUnit)}
				placeholder="0"
				class="flex-1"
				type="number"
				step="0.1"
			/>
			<Select.Root type="single" bind:value={letterSpacingUnit}>
				<Select.Trigger class="w-20 h-9 text-xs">
					{letterSpacingUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="normal" label="normal">normal</Select.Item>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
				</Select.Content>
			</Select.Root>
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