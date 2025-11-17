<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import { selectedElement } from '$lib/stores.js';
	import { applyStyleProperty, debounce } from '$lib/dom-utils.js';
	import { syncHTMLSource } from '$lib/html-sync.js';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	/** @type {string} */
	let elementId = '';

	/** @type {string[]} */
	let elementClasses = [];

	/** @type {string} */
	let newClass = '';

	/** @type {string} */
	let textContent = '';

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

	/** @type {string} */
	let width = '';

	/** @type {string} */
	let height = '';

	/** @type {string} */
	let display = '';

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Update local state when selected element changes
	 */
	function updateElementProperties(element) {
		if (!element || !element.isConnected) {
			console.warn('🔄 Selected element is not connected to DOM');
			return;
		}

		console.log('🔄 PropertyPanel: Selected element changed:', element);
		console.log('🔄 Element tag:', element.tagName);
		
		elementId = element.id || '';
		// Handle className - it can be a string or SVGAnimatedString
		const className = typeof element.className === 'string' 
			? element.className 
			: (element.className?.baseVal || '');
		elementClasses = className ? className.split(' ').filter(Boolean) : [];
		textContent = element.textContent || '';

		// Get computed styles
		const styles = window.getComputedStyle(element);
		console.log('🔄 Computed styles:', {
			paddingTop: styles.paddingTop,
			paddingRight: styles.paddingRight,
			paddingBottom: styles.paddingBottom,
			paddingLeft: styles.paddingLeft,
			width: styles.width,
			height: styles.height,
			display: styles.display
		});
		
		// Helper function to clean up style values - prioritize inline styles
		const getStyleValue = (inlineValue, computedValue) => {
			// If there's an inline style, use it (this is what the user set)
			if (inlineValue && inlineValue !== '') {
				return inlineValue;
			}
			// Otherwise show computed value for reference
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
		width = getStyleValue(element.style.width, '');
		height = getStyleValue(element.style.height, '');
		display = getStyleValue(element.style.display, styles.display);
		
		console.log('🔄 Final values:', {
			paddingTop, paddingRight, paddingBottom, paddingLeft,
			marginTop, marginRight, marginBottom, marginLeft,
			width, height, display, textContent
		});
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	/**
	 * Handle ID change
	 */
	function handleIdChange() {
		if ($selectedElement) {
			$selectedElement.id = elementId;
			onPropertyChange('id', elementId);
			syncHTMLSource();
		}
	}

	/**
	 * Add a new class
	 */
	function addClass() {
		console.log('addClass called with:', newClass);
		console.log('selectedElement:', $selectedElement);
		console.log('current classes:', elementClasses);
		
		if (newClass && $selectedElement && !elementClasses.includes(newClass)) {
			elementClasses = [...elementClasses, newClass];
			console.log('new classes array:', elementClasses);
			
			// Handle both regular elements and SVG elements
			if (typeof $selectedElement.className === 'string') {
				$selectedElement.className = elementClasses.join(' ');
				console.log('Updated className to:', $selectedElement.className);
			} else if ($selectedElement.className?.baseVal !== undefined) {
				$selectedElement.className.baseVal = elementClasses.join(' ');
				console.log('Updated SVG className to:', $selectedElement.className.baseVal);
			}
			onPropertyChange('className', elementClasses.join(' '));
			syncHTMLSource();
			newClass = '';
		}
	}

	/**
	 * Remove a class
	 * @param {string} className
	 */
	function removeClass(className) {
		console.log('removeClass called with:', className);
		console.log('selectedElement:', $selectedElement);
		
		if ($selectedElement) {
			elementClasses = elementClasses.filter((c) => c !== className);
			console.log('classes after removal:', elementClasses);
			
			// Handle both regular elements and SVG elements
			if (typeof $selectedElement.className === 'string') {
				$selectedElement.className = elementClasses.join(' ');
				console.log('Updated className to:', $selectedElement.className);
			} else if ($selectedElement.className?.baseVal !== undefined) {
				$selectedElement.className.baseVal = elementClasses.join(' ');
				console.log('Updated SVG className to:', $selectedElement.className.baseVal);
			}
			onPropertyChange('className', elementClasses.join(' '));
			syncHTMLSource();
		}
	}

	/**
	 * Handle text content change (debounced)
	 */
	const debouncedTextChange = debounce(() => {
		console.log('📝 debouncedTextChange called');
		console.log('📝 textContent value:', textContent);
		console.log('📝 selectedElement:', $selectedElement);
		
		if ($selectedElement) {
			console.log('📝 Before update - element textContent:', $selectedElement.textContent);
			
			// Store element reference before applying changes
			const element = $selectedElement;
			element.textContent = textContent;
			
			console.log('📝 After update - element textContent:', element.textContent);
			onPropertyChange('textContent', textContent);
			syncHTMLSource();
		} else {
			console.log('📝 No selected element!');
		}
	}, 300);

	/**
	 * Handle text content change on focusout (immediate)
	 */
	function handleTextFocusOut() {
		console.log('📝 handleTextFocusOut called');
		if ($selectedElement) {
			const element = $selectedElement;
			element.textContent = textContent;
			onPropertyChange('textContent', textContent);
			syncHTMLSource();
		}
	}

	/**
	 * Handle padding change (immediate)
	 * @param {string} side
	 * @param {string} value
	 */
	function handlePaddingChange(side, value) {
		console.log(`📏 handlePaddingChange called for ${side}:`, value);
		console.log('📏 selectedElement:', $selectedElement);
		console.log('📏 selectedElement.isConnected:', $selectedElement?.isConnected);
		console.log('📏 selectedElement.ownerDocument:', $selectedElement?.ownerDocument);
		
		if ($selectedElement) {
			const property = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
			// Add 'px' unit if value is just a number
			const processedValue = value && !isNaN(value) && !value.includes('px') && !value.includes('%') && !value.includes('em') && !value.includes('rem') 
				? `${value}px` 
				: value;
			console.log(`📏 Setting ${property} to:`, processedValue);
			console.log('📏 Before style:', $selectedElement.style[property]);
			
			// Store element reference before applying changes
			const element = $selectedElement;
			applyStyleProperty(element, property, processedValue);
			
			console.log('📏 After style:', $selectedElement.style[property]);
			console.log('📏 Full cssText:', $selectedElement.style.cssText);
			
			onPropertyChange(property, processedValue);
			
			// Update the local state immediately to reflect the change
			if (side === 'top') paddingTop = processedValue;
			else if (side === 'right') paddingRight = processedValue;
			else if (side === 'bottom') paddingBottom = processedValue;
			else if (side === 'left') paddingLeft = processedValue;
			
			syncHTMLSource();
		}
	}

	/**
	 * Handle margin change (immediate)
	 * @param {string} side
	 * @param {string} value
	 */
	function handleMarginChange(side, value) {
		console.log(`📐 handleMarginChange called for ${side}:`, value);
		console.log('📐 selectedElement:', $selectedElement);
		
		if ($selectedElement) {
			const property = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
			// Add 'px' unit if value is just a number
			const processedValue = value && !isNaN(value) && !value.includes('px') && !value.includes('%') && !value.includes('em') && !value.includes('rem') && !value.includes('auto')
				? `${value}px` 
				: value;
			console.log(`📐 Setting ${property} to:`, processedValue);
			
			// Store element reference before applying changes
			const element = $selectedElement;
			applyStyleProperty(element, property, processedValue);
			
			onPropertyChange(property, processedValue);
			
			// Update the local state immediately to reflect the change
			if (side === 'top') marginTop = processedValue;
			else if (side === 'right') marginRight = processedValue;
			else if (side === 'bottom') marginBottom = processedValue;
			else if (side === 'left') marginLeft = processedValue;
			
			syncHTMLSource();
		}
	}

	/**
	 * Handle width change (debounced to avoid px issue while typing)
	 */
	const debouncedWidthChange = debounce(() => {
		if ($selectedElement && width) {
			// Add 'px' unit if value is just a number
			const processedValue = !isNaN(width) && !width.includes('px') && !width.includes('%') && !width.includes('em') && !width.includes('rem') && !width.includes('auto') 
				? `${width}px` 
				: width;
			console.log('Setting width to:', processedValue);
			
			// Store element reference before applying changes
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
			
			// Update display value
			width = processedValue;
		}
	}

	/**
	 * Handle height change (debounced to avoid px issue while typing)
	 */
	const debouncedHeightChange = debounce(() => {
		if ($selectedElement && height) {
			// Add 'px' unit if value is just a number
			const processedValue = !isNaN(height) && !height.includes('px') && !height.includes('%') && !height.includes('em') && !height.includes('rem') && !height.includes('auto') 
				? `${height}px` 
				: height;
			console.log('Setting height to:', processedValue);
			
			// Store element reference before applying changes
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
			
			// Update display value
			height = processedValue;
		}
	}

	/**
	 * Handle display change
	 * @param {string} newDisplay
	 */
	function handleDisplayChange(newDisplay) {
		console.log('Display change:', newDisplay);
		if ($selectedElement && newDisplay) {
			console.log('Setting display to:', newDisplay);
			
			// Store element reference before applying changes
			const element = $selectedElement;
			applyStyleProperty(element, 'display', newDisplay);
			
			// Update local state immediately
			display = newDisplay;
			
			onPropertyChange('display', newDisplay);
			syncHTMLSource();
		}
	}
</script>

{#if $selectedElement}
	<div class="fixed right-0 top-0 h-full w-80 bg-background border-l border-border overflow-y-auto z-30 shadow-xl">
		<div class="p-4 space-y-6">
			<!-- Header -->
			<div class="border-b border-border pb-4">
				<h2 class="text-lg font-semibold">Properties</h2>
				<p class="text-sm text-muted-foreground mt-1">
					{$selectedElement.tagName.toLowerCase()}
				</p>
			</div>

			<!-- HTML Properties -->
			<div class="space-y-4">
				<h3 class="text-sm font-medium">HTML Attributes</h3>

				<!-- ID -->
				<div class="space-y-2">
					<Label for="element-id">ID</Label>
					<Input
						id="element-id"
						bind:value={elementId}
						oninput={handleIdChange}
						placeholder="element-id"
					/>
				</div>

				<!-- Classes -->
				<div class="space-y-2">
					<Label>Classes</Label>
					<div class="flex gap-2">
						<Input
							bind:value={newClass}
							onkeydown={(e) => e.key === 'Enter' && addClass()}
							placeholder="Add class"
							class="flex-1"
						/>
						<button
							onclick={addClass}
							class="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
						>
							Add
						</button>
					</div>
					<div class="flex flex-wrap gap-2 mt-2">
						{#each elementClasses as className}
							<div class="inline-flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
								{className}
								<button 
									onclick={() => removeClass(className)}
									class="ml-2 text-secondary-foreground hover:text-destructive"
								>
									×
								</button>
							</div>
						{/each}
					</div>
				</div>

				<!-- Text Content -->
				{#if $selectedElement.children.length === 0}
					<div class="space-y-2">
						<Label for="text-content">Text Content</Label>
						<Textarea
							id="text-content"
							bind:value={textContent}
							oninput={debouncedTextChange}
							onblur={handleTextFocusOut}
							placeholder="Element text"
							rows={3}
						/>
					</div>
				{/if}
			</div>

			<!-- Style Properties -->
			<div class="space-y-4">
				<h3 class="text-sm font-medium">Styles</h3>

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

				<!-- Width & Height -->
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

				<!-- Display -->
				<div class="space-y-2">
					<Label>Display</Label>
					<Select.Root type="single"
						value={display}
						onValueChange={handleDisplayChange}
					>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select display" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="block">Block</Select.Item>
							<Select.Item value="inline">Inline</Select.Item>
							<Select.Item value="inline-block">Inline Block</Select.Item>
							<Select.Item value="flex">Flex</Select.Item>
							<Select.Item value="grid">Grid</Select.Item>
							<Select.Item value="none">None</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>
	</div>
{/if}
