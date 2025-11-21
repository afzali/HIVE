<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { selectedElement } from '$lib/stores.js';
	import { applyStyleProperty } from '$lib/dom-utils.js';
	import { syncHTMLSource } from '$lib/html-sync.js';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	/** @type {string} */
	let boxShadow = '';
	/** @type {number} */
	let opacity = 1;

	// CSS Filter properties
	/** @type {number} */
	let blur = 0;
	/** @type {number} */
	let brightness = 100;
	/** @type {number} */
	let contrast = 100;
	/** @type {number} */
	let saturate = 100;
	/** @type {number} */
	let invert = 0;
	/** @type {number} */
	let grayscale = 0;
	/** @type {number} */
	let sepia = 0;
	/** @type {number} */
	let hueRotate = 0;

	// Slider arrays for binding
	let blurValue = [0];
	let brightnessValue = [100];
	let contrastValue = [100];
	let saturateValue = [100];
	let invertValue = [0];
	let grayscaleValue = [0];
	let sepiaValue = [0];
	let hueRotateValue = [0];

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Parse filter string to extract individual filter values
	 */
	function parseFilters(filterString) {
		if (!filterString || filterString === 'none') {
			return {
				blur: 0,
				brightness: 100,
				contrast: 100,
				saturate: 100,
				invert: 0,
				grayscale: 0,
				sepia: 0,
				hueRotate: 0
			};
		}

		const filters = {
			blur: 0,
			brightness: 100,
			contrast: 100,
			saturate: 100,
			invert: 0,
			grayscale: 0,
			sepia: 0,
			hueRotate: 0
		};

		// Extract blur
		const blurMatch = filterString.match(/blur\((\d*\.?\d+)px\)/);
		if (blurMatch) filters.blur = parseFloat(blurMatch[1]);

		// Extract brightness
		const brightnessMatch = filterString.match(/brightness\((\d*\.?\d+)%?\)/);
		if (brightnessMatch) filters.brightness = parseFloat(brightnessMatch[1]) * (brightnessMatch[0].includes('%') ? 1 : 100);

		// Extract contrast
		const contrastMatch = filterString.match(/contrast\((\d*\.?\d+)%?\)/);
		if (contrastMatch) filters.contrast = parseFloat(contrastMatch[1]) * (contrastMatch[0].includes('%') ? 1 : 100);

		// Extract saturate
		const saturateMatch = filterString.match(/saturate\((\d*\.?\d+)%?\)/);
		if (saturateMatch) filters.saturate = parseFloat(saturateMatch[1]) * (saturateMatch[0].includes('%') ? 1 : 100);

		// Extract invert
		const invertMatch = filterString.match(/invert\((\d*\.?\d+)%?\)/);
		if (invertMatch) filters.invert = parseFloat(invertMatch[1]) * (invertMatch[0].includes('%') ? 1 : 100);

		// Extract grayscale
		const grayscaleMatch = filterString.match(/grayscale\((\d*\.?\d+)%?\)/);
		if (grayscaleMatch) filters.grayscale = parseFloat(grayscaleMatch[1]) * (grayscaleMatch[0].includes('%') ? 1 : 100);

		// Extract sepia
		const sepiaMatch = filterString.match(/sepia\((\d*\.?\d+)%?\)/);
		if (sepiaMatch) filters.sepia = parseFloat(sepiaMatch[1]) * (sepiaMatch[0].includes('%') ? 1 : 100);

		// Extract hue-rotate
		const hueRotateMatch = filterString.match(/hue-rotate\((\d*\.?\d+)deg\)/);
		if (hueRotateMatch) filters.hueRotate = parseFloat(hueRotateMatch[1]);

		return filters;
	}

	/**
	 * Build filter string from individual values
	 */
	function buildFilterString() {
		const filters = [];
		
		if (blur > 0) filters.push(`blur(${blur}px)`);
		if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
		if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
		if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
		if (invert > 0) filters.push(`invert(${invert}%)`);
		if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
		if (sepia > 0) filters.push(`sepia(${sepia}%)`);
		if (hueRotate !== 0) filters.push(`hue-rotate(${hueRotate}deg)`);
		
		return filters.length > 0 ? filters.join(' ') : 'none';
	}

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
		
		// Parse opacity
		const opacityValue = getStyleValue(element.style.opacity, styles.opacity);
		opacity = opacityValue ? parseFloat(opacityValue) : 1;

		// Parse filters
		const filterValue = getStyleValue(element.style.filter, styles.filter);
		const parsedFilters = parseFilters(filterValue);
		
		blur = parsedFilters.blur;
		brightness = parsedFilters.brightness;
		contrast = parsedFilters.contrast;
		saturate = parsedFilters.saturate;
		invert = parsedFilters.invert;
		grayscale = parsedFilters.grayscale;
		sepia = parsedFilters.sepia;
		hueRotate = parsedFilters.hueRotate;

		// Update slider arrays
		blurValue = [blur];
		brightnessValue = [brightness];
		contrastValue = [contrast];
		saturateValue = [saturate];
		invertValue = [invert];
		grayscaleValue = [grayscale];
		sepiaValue = [sepia];
		hueRotateValue = [hueRotate];
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
	 * Handle opacity change
	 */
	function handleOpacityChange(value) {
		if ($selectedElement) {
			const opacityValue = value[0];
			opacity = opacityValue;
			handleStyleChange('opacity', opacityValue.toString());
		}
	}

	/**
	 * Handle filter change
	 */
	function handleFilterChange() {
		if ($selectedElement) {
			const filterString = buildFilterString();
			handleStyleChange('filter', filterString);
		}
	}

	/**
	 * Handle individual filter changes
	 */
	function handleBlurChange(value) {
		blur = value[0];
		handleFilterChange();
	}

	function handleBrightnessChange(value) {
		brightness = value[0];
		handleFilterChange();
	}

	function handleContrastChange(value) {
		contrast = value[0];
		handleFilterChange();
	}

	function handleSaturateChange(value) {
		saturate = value[0];
		handleFilterChange();
	}

	function handleInvertChange(value) {
		invert = value[0];
		handleFilterChange();
	}

	function handleGrayscaleChange(value) {
		grayscale = value[0];
		handleFilterChange();
	}

	function handleSepiaChange(value) {
		sepia = value[0];
		handleFilterChange();
	}

	function handleHueRotateChange(value) {
		hueRotate = value[0];
		handleFilterChange();
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-medium"></h3>
	
	<!-- Opacity -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Opacity</Label>
			<span class="text-xs text-muted-foreground">{opacity}</span>
		</div>
		<Slider
			value={[opacity]}
			onValueChange={handleOpacityChange}
			min={0}
			max={1}
			step={0.01}
			class="w-full"
		/>
	</div>

	<!-- Blur -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Blur</Label>
			<span class="text-xs text-muted-foreground">{blur}px</span>
		</div>
		<Slider
			value={blurValue}
			onValueChange={handleBlurChange}
			min={0}
			max={20}
			step={0.1}
			class="w-full"
		/>
	</div>

	<!-- Brightness -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Brightness</Label>
			<span class="text-xs text-muted-foreground">{brightness}%</span>
		</div>
		<Slider
			value={brightnessValue}
			onValueChange={handleBrightnessChange}
			min={0}
			max={200}
			step={1}
			class="w-full"
		/>
	</div>

	<!-- Contrast -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Contrast</Label>
			<span class="text-xs text-muted-foreground">{contrast}%</span>
		</div>
		<Slider
			value={contrastValue}
			onValueChange={handleContrastChange}
			min={0}
			max={200}
			step={1}
			class="w-full"
		/>
	</div>

	<!-- Saturate -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Saturate</Label>
			<span class="text-xs text-muted-foreground">{saturate}%</span>
		</div>
		<Slider
			value={saturateValue}
			onValueChange={handleSaturateChange}
			min={0}
			max={200}
			step={1}
			class="w-full"
		/>
	</div>

	<!-- Invert -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Invert</Label>
			<span class="text-xs text-muted-foreground">{invert}%</span>
		</div>
		<Slider
			value={invertValue}
			onValueChange={handleInvertChange}
			min={0}
			max={100}
			step={1}
			class="w-full"
		/>
	</div>

	<!-- Grayscale -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Grayscale</Label>
			<span class="text-xs text-muted-foreground">{grayscale}%</span>
		</div>
		<Slider
			value={grayscaleValue}
			onValueChange={handleGrayscaleChange}
			min={0}
			max={100}
			step={1}
			class="w-full"
		/>
	</div>

	<!-- Sepia -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Sepia</Label>
			<span class="text-xs text-muted-foreground">{sepia}%</span>
		</div>
		<Slider
			value={sepiaValue}
			onValueChange={handleSepiaChange}
			min={0}
			max={100}
			step={1}
			class="w-full"
		/>
	</div>

	<!-- Hue Rotate -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<Label class="text-xs">Hue Rotate</Label>
			<span class="text-xs text-muted-foreground">{hueRotate}°</span>
		</div>
		<Slider
			value={hueRotateValue}
			onValueChange={handleHueRotateChange}
			min={0}
			max={360}
			step={1}
			class="w-full"
		/>
	</div>

	<!-- Box Shadow -->
	<div class="space-y-2">
		<Label for="box-shadow" class="text-xs">Box Shadow</Label>
		<Input
			id="box-shadow"
			bind:value={boxShadow}
			oninput={() => handleStyleChange('boxShadow', boxShadow)}
			placeholder="0 2px 4px rgba(0,0,0,0.1)"
			class="text-xs"
		/>
	</div>
</div>