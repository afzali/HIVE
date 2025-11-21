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
		color = getStyleValue(element.style.color, styles.color);
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
			<Select.Root type="single"
				value={fontWeight}
				onValueChange={(value) => handleStyleChange('fontWeight', value)}
			>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Normal" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="100">100 - Thin</Select.Item>
					<Select.Item value="200">200 - Extra Light</Select.Item>
					<Select.Item value="300">300 - Light</Select.Item>
					<Select.Item value="400">400 - Normal</Select.Item>
					<Select.Item value="500">500 - Medium</Select.Item>
					<Select.Item value="600">600 - Semi Bold</Select.Item>
					<Select.Item value="700">700 - Bold</Select.Item>
					<Select.Item value="800">800 - Extra Bold</Select.Item>
					<Select.Item value="900">900 - Black</Select.Item>
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
		<Select.Root type="single"
			value={textAlign}
			onValueChange={(value) => handleStyleChange('textAlign', value)}
		>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Left" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="left">Left</Select.Item>
				<Select.Item value="center">Center</Select.Item>
				<Select.Item value="right">Right</Select.Item>
				<Select.Item value="justify">Justify</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="space-y-2">
		<Label for="color">Text Color</Label>
		<Input
			id="color"
			bind:value={color}
			oninput={() => handleColorChange('color', color)}
			placeholder="#000000"
			type="color"
		/>
	</div>
</div>