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
	let paddingTop = '0';
	/** @type {string} */
	let paddingRight = '0';
	/** @type {string} */
	let paddingBottom = '0';
	/** @type {string} */
	let paddingLeft = '0';
	/** @type {string} */
	let marginTop = '0';
	/** @type {string} */
	let marginRight = '0';
	/** @type {string} */
	let marginBottom = '0';
	/** @type {string} */
	let marginLeft = '0';

	// Unit selectors
	/** @type {string} */
	let paddingUnit = 'px';
	/** @type {string} */
	let marginUnit = 'px';

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Extract numeric value and unit from CSS value
	 */
	function parseValue(value) {
		if (!value || value === '0' || value === 'auto') return { number: '0', unit: 'px' };
		const match = value.match(/^(-?\d*\.?\d+)(.*)$/);
		if (match) {
			return { number: match[1], unit: match[2] || 'px' };
		}
		return { number: '0', unit: 'px' };
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
			return computedValue || '0px';
		};
		
		const ptValue = getStyleValue(element.style.paddingTop, styles.paddingTop);
		const prValue = getStyleValue(element.style.paddingRight, styles.paddingRight);
		const pbValue = getStyleValue(element.style.paddingBottom, styles.paddingBottom);
		const plValue = getStyleValue(element.style.paddingLeft, styles.paddingLeft);
		
		const mtValue = getStyleValue(element.style.marginTop, styles.marginTop);
		const mrValue = getStyleValue(element.style.marginRight, styles.marginRight);
		const mbValue = getStyleValue(element.style.marginBottom, styles.marginBottom);
		const mlValue = getStyleValue(element.style.marginLeft, styles.marginLeft);

		// Parse values
		const ptParsed = parseValue(ptValue);
		const prParsed = parseValue(prValue);
		const pbParsed = parseValue(pbValue);
		const plParsed = parseValue(plValue);
		
		const mtParsed = parseValue(mtValue);
		const mrParsed = parseValue(mrValue);
		const mbParsed = parseValue(mbValue);
		const mlParsed = parseValue(mlValue);

		paddingTop = ptParsed.number;
		paddingRight = prParsed.number;
		paddingBottom = pbParsed.number;
		paddingLeft = plParsed.number;
		paddingUnit = ptParsed.unit;

		marginTop = mtParsed.number;
		marginRight = mrParsed.number;
		marginBottom = mbParsed.number;
		marginLeft = mlParsed.number;
		marginUnit = mtParsed.unit;
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	/**
	 * Handle padding change
	 */
	function handlePaddingChange(side, value) {
		if ($selectedElement && value !== '') {
			const property = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
			const processedValue = value === '0' ? '0' : `${value}${paddingUnit}`;
			
			const element = $selectedElement;
			applyStyleProperty(element, property, processedValue);
			onPropertyChange(property, processedValue);
			syncHTMLSource();
		}
	}

	/**
	 * Handle margin change
	 */
	function handleMarginChange(side, value) {
		if ($selectedElement && value !== '') {
			const property = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
			const processedValue = value === '0' ? '0' : value === 'auto' ? 'auto' : `${value}${marginUnit}`;
			
			const element = $selectedElement;
			applyStyleProperty(element, property, processedValue);
			onPropertyChange(property, processedValue);
			syncHTMLSource();
		}
	}

	/**
	 * Handle unit change
	 */
	function handleUnitChange(type, unit) {
		if (type === 'padding') {
			paddingUnit = unit;
			// Re-apply all padding values with new unit
			if (paddingTop !== '0') handlePaddingChange('top', paddingTop);
			if (paddingRight !== '0') handlePaddingChange('right', paddingRight);
			if (paddingBottom !== '0') handlePaddingChange('bottom', paddingBottom);
			if (paddingLeft !== '0') handlePaddingChange('left', paddingLeft);
		} else if (type === 'margin') {
			marginUnit = unit;
			// Re-apply all margin values with new unit
			if (marginTop !== '0') handleMarginChange('top', marginTop);
			if (marginRight !== '0') handleMarginChange('right', marginRight);
			if (marginBottom !== '0') handleMarginChange('bottom', marginBottom);
			if (marginLeft !== '0') handleMarginChange('left', marginLeft);
		}
	}

	// Watch for unit changes
	$: if (paddingUnit) {
		handleUnitChange('padding', paddingUnit);
	}

	$: if (marginUnit) {
		handleUnitChange('margin', marginUnit);
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium"></h3>
	
	<!-- Visual Box Model -->
	<div class="relative bg-orange-50 border-2 border-dashed border-orange-200 p-4 rounded-lg">
		<!-- Margin Label -->
		<div class="absolute -top-2 left-2 bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded">
			Margin
		</div>
		
		<!-- Margin Top -->
		<div class="flex justify-center mb-2">
			<div class="flex items-center gap-1">
				<Input
					bind:value={marginTop}
					oninput={() => handleMarginChange('top', marginTop)}
					placeholder="0"
					class="w-14 h-6 text-xs text-center"
					type="number"
				/>
			</div>
		</div>
		
		<!-- Margin Left/Right and Padding Box -->
		<div class="flex items-center gap-2">
			<!-- Margin Left -->
			<div class="flex items-center">
				<Input
					bind:value={marginLeft}
					oninput={() => handleMarginChange('left', marginLeft)}
					placeholder="0"
					class="w-14 h-6 text-xs text-center"
					type="number"
				/>
			</div>
			
			<!-- Padding Box -->
			<div class="flex-1 bg-blue-50 border-2 border-dashed border-blue-200 p-4 rounded relative">
				<!-- Padding Label -->
				<div class="absolute -top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
					Padding
				</div>
				
				<!-- Padding Top -->
				<div class="flex justify-center mb-2">
					<Input
						bind:value={paddingTop}
						oninput={() => handlePaddingChange('top', paddingTop)}
						placeholder="0"
						class="w-14 h-6 text-xs text-center"
						type="number"
					/>
				</div>
				
				<!-- Padding Left/Right and Content -->
				<div class="flex items-center gap-2">
					<Input
						bind:value={paddingLeft}
						oninput={() => handlePaddingChange('left', paddingLeft)}
						placeholder="0"
						class="w-14 h-6 text-xs text-center"
						type="number"
					/>
					
					<!-- Content Box -->
					<div class="flex-1 bg-gray-100 border border-gray-300 p-4 rounded text-center text-xs text-gray-600">
						Content
					</div>
					
					<Input
						bind:value={paddingRight}
						oninput={() => handlePaddingChange('right', paddingRight)}
						placeholder="0"
						class="w-14 h-6 text-xs text-center"
						type="number"
					/>
				</div>
				
				<!-- Padding Bottom -->
				<div class="flex justify-center mt-2">
					<Input
						bind:value={paddingBottom}
						oninput={() => handlePaddingChange('bottom', paddingBottom)}
						placeholder="0"
						class="w-14 h-6 text-xs text-center"
						type="number"
					/>
				</div>
			</div>
			
			<!-- Margin Right -->
			<div class="flex items-center">
				<Input
					bind:value={marginRight}
					oninput={() => handleMarginChange('right', marginRight)}
					placeholder="0"
					class="w-14 h-6 text-xs text-center"
					type="number"
				/>
			</div>
		</div>
		
		<!-- Margin Bottom -->
		<div class="flex justify-center mt-2">
			<div class="flex items-center gap-1">
				<Input
					bind:value={marginBottom}
					oninput={() => handleMarginChange('bottom', marginBottom)}
					placeholder="0"
					class="w-14 h-6 text-xs text-center"
					type="number"
				/>
			</div>
		</div>
	</div>
	
	<!-- Unit Selectors -->
	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label class="text-xs">Padding Unit</Label>
			<Select.Root type="single" bind:value={paddingUnit}>
				<Select.Trigger class="h-8 text-xs">
					{paddingUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="%" label="%">%</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
					<Select.Item value="vw" label="vw">vw</Select.Item>
					<Select.Item value="vh" label="vh">vh</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		
		<div class="space-y-2">
			<Label class="text-xs">Margin Unit</Label>
			<Select.Root type="single" bind:value={marginUnit}>
				<Select.Trigger class="h-8 text-xs">
					{marginUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="%" label="%">%</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
					<Select.Item value="vw" label="vw">vw</Select.Item>
					<Select.Item value="vh" label="vh">vh</Select.Item>
					<Select.Item value="auto" label="auto">auto</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>
</div>