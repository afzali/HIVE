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
	let paddingTop = '';
	/** @type {string} */
	let paddingRight = '';
	/** @type {string} */
	let paddingBottom = '';
	/** @type {string} */
	let paddingLeft = '';
	/** @type {string} */
	let marginTop = '';
	/** @type {string} */
	let marginRight = '';
	/** @type {string} */
	let marginBottom = '';
	/** @type {string} */
	let marginLeft = '';

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
		
		paddingTop = getStyleValue(element.style.paddingTop, styles.paddingTop);
		paddingRight = getStyleValue(element.style.paddingRight, styles.paddingRight);
		paddingBottom = getStyleValue(element.style.paddingBottom, styles.paddingBottom);
		paddingLeft = getStyleValue(element.style.paddingLeft, styles.paddingLeft);
		marginTop = getStyleValue(element.style.marginTop, styles.marginTop);
		marginRight = getStyleValue(element.style.marginRight, styles.marginRight);
		marginBottom = getStyleValue(element.style.marginBottom, styles.marginBottom);
		marginLeft = getStyleValue(element.style.marginLeft, styles.marginLeft);
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	/**
	 * Handle padding change
	 */
	function handlePaddingChange(side, value) {
		if ($selectedElement) {
			const property = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
			const processedValue = value && !isNaN(value) && !value.includes('px') && !value.includes('%') && !value.includes('em') && !value.includes('rem') 
				? `${value}px` 
				: value;
			
			const element = $selectedElement;
			applyStyleProperty(element, property, processedValue);
			onPropertyChange(property, processedValue);
			
			// Update local state
			if (side === 'top') paddingTop = processedValue;
			else if (side === 'right') paddingRight = processedValue;
			else if (side === 'bottom') paddingBottom = processedValue;
			else if (side === 'left') paddingLeft = processedValue;
			
			syncHTMLSource();
		}
	}

	/**
	 * Handle margin change
	 */
	function handleMarginChange(side, value) {
		if ($selectedElement) {
			const property = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
			const processedValue = value && !isNaN(value) && !value.includes('px') && !value.includes('%') && !value.includes('em') && !value.includes('rem') && !value.includes('auto')
				? `${value}px` 
				: value;
			
			const element = $selectedElement;
			applyStyleProperty(element, property, processedValue);
			onPropertyChange(property, processedValue);
			
			// Update local state
			if (side === 'top') marginTop = processedValue;
			else if (side === 'right') marginRight = processedValue;
			else if (side === 'bottom') marginBottom = processedValue;
			else if (side === 'left') marginLeft = processedValue;
			
			syncHTMLSource();
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium">Spacing</h3>
	
	<!-- Padding -->
	<div class="space-y-2">
		<Label class="flex items-center gap-2">
			<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Padding</span>
		</Label>
		<div class="grid grid-cols-2 gap-2">
			<div>
				<Input
					bind:value={paddingTop}
					oninput={() => handlePaddingChange('top', paddingTop)}
					placeholder="Top"
					class="text-sm"
				/>
			</div>
			<div>
				<Input
					bind:value={paddingRight}
					oninput={() => handlePaddingChange('right', paddingRight)}
					placeholder="Right"
					class="text-sm"
				/>
			</div>
			<div>
				<Input
					bind:value={paddingBottom}
					oninput={() => handlePaddingChange('bottom', paddingBottom)}
					placeholder="Bottom"
					class="text-sm"
				/>
			</div>
			<div>
				<Input
					bind:value={paddingLeft}
					oninput={() => handlePaddingChange('left', paddingLeft)}
					placeholder="Left"
					class="text-sm"
				/>
			</div>
		</div>
	</div>

	<!-- Margin -->
	<div class="space-y-2">
		<Label class="flex items-center gap-2">
			<span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Margin</span>
		</Label>
		<div class="grid grid-cols-2 gap-2">
			<div>
				<Input
					bind:value={marginTop}
					oninput={() => handleMarginChange('top', marginTop)}
					placeholder="Top"
					class="text-sm"
				/>
			</div>
			<div>
				<Input
					bind:value={marginRight}
					oninput={() => handleMarginChange('right', marginRight)}
					placeholder="Right"
					class="text-sm"
				/>
			</div>
			<div>
				<Input
					bind:value={marginBottom}
					oninput={() => handleMarginChange('bottom', marginBottom)}
					placeholder="Bottom"
					class="text-sm"
				/>
			</div>
			<div>
				<Input
					bind:value={marginLeft}
					oninput={() => handleMarginChange('left', marginLeft)}
					placeholder="Left"
					class="text-sm"
				/>
			</div>
		</div>
	</div>
</div>