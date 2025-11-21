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
	let boxShadow = '';
	/** @type {string} */
	let opacity = '';

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
		
		boxShadow = getStyleValue(element.style.boxShadow, styles.boxShadow);
		opacity = getStyleValue(element.style.opacity, styles.opacity);
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
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium">Effects</h3>
	
	<div class="space-y-2">
		<Label for="opacity">Opacity</Label>
		<Input
			id="opacity"
			bind:value={opacity}
			oninput={() => handleStyleChange('opacity', opacity)}
			placeholder="1"
			type="number"
			min="0"
			max="1"
			step="0.1"
		/>
	</div>

	<div class="space-y-2">
		<Label for="box-shadow">Box Shadow</Label>
		<Input
			id="box-shadow"
			bind:value={boxShadow}
			oninput={() => handleStyleChange('boxShadow', boxShadow)}
			placeholder="0 2px 4px rgba(0,0,0,0.1)"
		/>
	</div>
</div>