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
		borderColor = getStyleValue(element.style.borderColor, styles.borderColor);
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
			
			if (property === 'borderColor') borderColor = value;
			
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
			<Select.Root type="single"
				value={borderStyle}
				onValueChange={(value) => handleStyleChange('borderStyle', value)}
			>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="None" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="none">None</Select.Item>
					<Select.Item value="solid">Solid</Select.Item>
					<Select.Item value="dashed">Dashed</Select.Item>
					<Select.Item value="dotted">Dotted</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="space-y-2">
		<Label for="border-color">Border Color</Label>
		<Input
			id="border-color"
			bind:value={borderColor}
			oninput={() => handleColorChange('borderColor', borderColor)}
			placeholder="#000000"
			type="color"
		/>
	</div>
</div>