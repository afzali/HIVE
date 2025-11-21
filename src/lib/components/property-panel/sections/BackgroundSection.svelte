<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { selectedElement } from '$lib/stores.js';
	import { applyStyleProperty } from '$lib/dom-utils.js';
	import { syncHTMLSource } from '$lib/html-sync.js';

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
		
		backgroundColor = getStyleValue(element.style.backgroundColor, styles.backgroundColor);
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
			
			syncHTMLSource();
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium">Background</h3>
	
	<div class="space-y-2">
		<Label for="background-color">Background Color</Label>
		<Input
			id="background-color"
			bind:value={backgroundColor}
			oninput={() => handleColorChange('backgroundColor', backgroundColor)}
			placeholder="#ffffff"
			type="color"
		/>
	</div>
</div>