<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { selectedElement } from '$lib/stores.js';
	import { applyStyleProperty, debounce } from '$lib/dom-utils.js';
	import { syncHTMLSource } from '$lib/html-sync.js';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	/** @type {string} */
	let width = '';
	/** @type {string} */
	let height = '';
	/** @type {string} */
	let borderRadius = '';

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
		
		width = getStyleValue(element.style.width, '');
		height = getStyleValue(element.style.height, '');
		borderRadius = getStyleValue(element.style.borderRadius, styles.borderRadius);
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	/**
	 * Handle width change (debounced)
	 */
	const debouncedWidthChange = debounce(() => {
		if ($selectedElement && width) {
			const processedValue = !isNaN(width) && !width.includes('px') && !width.includes('%') && !width.includes('em') && !width.includes('rem') && !width.includes('auto') 
				? `${width}px` 
				: width;
			
			const element = $selectedElement;
			applyStyleProperty(element, 'width', processedValue);
			onPropertyChange('width', processedValue);
			syncHTMLSource();
		}
	}, 300);

	/**
	 * Handle width blur (immediate)
	 */
	function handleWidthBlur() {
		if ($selectedElement && width) {
			const processedValue = !isNaN(width) && !width.includes('px') && !width.includes('%') && !width.includes('em') && !width.includes('rem') && !width.includes('auto') 
				? `${width}px` 
				: width;
			
			const element = $selectedElement;
			applyStyleProperty(element, 'width', processedValue);
			onPropertyChange('width', processedValue);
			syncHTMLSource();
			
			width = processedValue;
		}
	}

	/**
	 * Handle height change (debounced)
	 */
	const debouncedHeightChange = debounce(() => {
		if ($selectedElement && height) {
			const processedValue = !isNaN(height) && !height.includes('px') && !height.includes('%') && !height.includes('em') && !height.includes('rem') && !height.includes('auto') 
				? `${height}px` 
				: height;
			
			const element = $selectedElement;
			applyStyleProperty(element, 'height', processedValue);
			onPropertyChange('height', processedValue);
			syncHTMLSource();
		}
	}, 300);

	/**
	 * Handle height blur (immediate)
	 */
	function handleHeightBlur() {
		if ($selectedElement && height) {
			const processedValue = !isNaN(height) && !height.includes('px') && !height.includes('%') && !height.includes('em') && !height.includes('rem') && !height.includes('auto') 
				? `${height}px` 
				: height;
			
			const element = $selectedElement;
			applyStyleProperty(element, 'height', processedValue);
			onPropertyChange('height', processedValue);
			syncHTMLSource();
			
			height = processedValue;
		}
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
	<h3 class="text-sm font-medium">Dimensions</h3>
	<div class="grid grid-cols-2 gap-2">
		<div class="space-y-2">
			<Label for="width">Width</Label>
			<Input
				id="width"
				bind:value={width}
				oninput={debouncedWidthChange}
				onblur={handleWidthBlur}
				placeholder="auto"
			/>
		</div>
		<div class="space-y-2">
			<Label for="height">Height</Label>
			<Input
				id="height"
				bind:value={height}
				oninput={debouncedHeightChange}
				onblur={handleHeightBlur}
				placeholder="auto"
			/>
		</div>
	</div>
	<div class="space-y-2">
		<Label for="border-radius">Border Radius</Label>
		<Input
			id="border-radius"
			bind:value={borderRadius}
			oninput={() => handleStyleChange('borderRadius', borderRadius)}
			placeholder="0px"
		/>
	</div>
</div>