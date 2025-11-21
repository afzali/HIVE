<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Slider } from '$lib/components/ui/slider';
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

	// Unit selectors
	/** @type {string} */
	let widthUnit = 'px';
	/** @type {string} */
	let heightUnit = 'px';
	/** @type {string} */
	let borderRadiusUnit = 'px';

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Extract numeric value and unit from CSS value
	 */
	function parseValue(value) {
		if (!value || value === 'auto') return { number: '', unit: 'auto' };
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
		
		const widthValue = getStyleValue(element.style.width, '');
		const heightValue = getStyleValue(element.style.height, '');
		const borderRadiusValue = getStyleValue(element.style.borderRadius, styles.borderRadius);

		// Parse values
		const wParsed = parseValue(widthValue);
		const hParsed = parseValue(heightValue);
		const brParsed = parseValue(borderRadiusValue);

		width = wParsed.number;
		widthUnit = wParsed.unit;
		
		height = hParsed.number;
		heightUnit = hParsed.unit;
		
		borderRadius = brParsed.number;
		borderRadiusUnit = brParsed.unit;
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	/**
	 * Handle dimension change
	 */
	function handleDimensionChange(property, value, unit) {
		if ($selectedElement && value !== '') {
			const processedValue = unit === 'auto' ? 'auto' : value === '0' ? '0' : `${value}${unit}`;
			
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
		if (property === 'width') {
			widthUnit = unit;
			if (width !== '') handleDimensionChange('width', width, unit);
		} else if (property === 'height') {
			heightUnit = unit;
			if (height !== '') handleDimensionChange('height', height, unit);
		} else if (property === 'borderRadius') {
			borderRadiusUnit = unit;
			if (borderRadius !== '') handleDimensionChange('borderRadius', borderRadius, unit);
		}
	}

	// Watch for unit changes
	$: if (widthUnit) {
		handleUnitChange('width', widthUnit);
	}

	$: if (heightUnit) {
		handleUnitChange('height', heightUnit);
	}

	$: if (borderRadiusUnit) {
		handleUnitChange('borderRadius', borderRadiusUnit);
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium">Dimensions</h3>
	
	<!-- Width -->
	<div class="space-y-2">
		<Label class="text-xs">Width</Label>
		<div class="flex gap-2">
			<Input
				bind:value={width}
				oninput={() => handleDimensionChange('width', width, widthUnit)}
				placeholder="auto"
				class="flex-1"
				type="number"
			/>
			<Select.Root type="single" bind:value={widthUnit}>
				<Select.Trigger class="w-20 h-9 text-xs">
					{widthUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="auto" label="auto">auto</Select.Item>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="%" label="%">%</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
					<Select.Item value="vw" label="vw">vw</Select.Item>
					<Select.Item value="vh" label="vh">vh</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- Height -->
	<div class="space-y-2">
		<Label class="text-xs">Height</Label>
		<div class="flex gap-2">
			<Input
				bind:value={height}
				oninput={() => handleDimensionChange('height', height, heightUnit)}
				placeholder="auto"
				class="flex-1"
				type="number"
			/>
			<Select.Root type="single" bind:value={heightUnit}>
				<Select.Trigger class="w-20 h-9 text-xs">
					{heightUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="auto" label="auto">auto</Select.Item>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="%" label="%">%</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
					<Select.Item value="vw" label="vw">vw</Select.Item>
					<Select.Item value="vh" label="vh">vh</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- Border Radius -->
	<div class="space-y-2">
		<Label class="text-xs">Border Radius</Label>
		<div class="flex gap-2">
			<Input
				bind:value={borderRadius}
				oninput={() => handleDimensionChange('borderRadius', borderRadius, borderRadiusUnit)}
				placeholder="0"
				class="flex-1"
				type="number"
			/>
			<Select.Root type="single" bind:value={borderRadiusUnit}>
				<Select.Trigger class="w-20 h-9 text-xs">
					{borderRadiusUnit}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="px" label="px">px</Select.Item>
					<Select.Item value="%" label="%">%</Select.Item>
					<Select.Item value="em" label="em">em</Select.Item>
					<Select.Item value="rem" label="rem">rem</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<!-- Slider for Border Radius (when unit is px) -->
		{#if borderRadiusUnit === 'px'}
			<div class="mt-2">
				<Slider
					value={[parseInt(borderRadius) || 0]}
					onValueChange={(values) => {
						borderRadius = values[0].toString();
						handleDimensionChange('borderRadius', borderRadius, borderRadiusUnit);
					}}
					min={0}
					max={50}
					step={1}
					class="w-full"
				/>
			</div>
		{/if}
	</div>
</div>