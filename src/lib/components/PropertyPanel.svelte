<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import { selectedElement } from '$lib/stores.js';
	import { applyStyleProperty } from '$lib/dom-utils.js';

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
	let width = '';

	/** @type {string} */
	let height = '';

	/** @type {string} */
	let display = '';

	/**
	 * Update local state when selected element changes
	 */
	$: if ($selectedElement) {
		elementId = $selectedElement.id || '';
		// Handle className - it can be a string or SVGAnimatedString
		const className = typeof $selectedElement.className === 'string' 
			? $selectedElement.className 
			: ($selectedElement.className?.baseVal || '');
		elementClasses = className ? className.split(' ').filter(Boolean) : [];
		textContent = $selectedElement.textContent || '';

		// Get computed styles
		const styles = window.getComputedStyle($selectedElement);
		paddingTop = $selectedElement.style.paddingTop || styles.paddingTop || '';
		paddingRight = $selectedElement.style.paddingRight || styles.paddingRight || '';
		paddingBottom = $selectedElement.style.paddingBottom || styles.paddingBottom || '';
		paddingLeft = $selectedElement.style.paddingLeft || styles.paddingLeft || '';
		width = $selectedElement.style.width || '';
		height = $selectedElement.style.height || '';
		display = $selectedElement.style.display || styles.display || '';
	}

	/**
	 * Handle ID change
	 */
	function handleIdChange() {
		if ($selectedElement) {
			$selectedElement.id = elementId;
			onPropertyChange('id', elementId);
		}
	}

	/**
	 * Add a new class
	 */
	function addClass() {
		if (newClass && $selectedElement && !elementClasses.includes(newClass)) {
			elementClasses = [...elementClasses, newClass];
			// Handle both regular elements and SVG elements
			if (typeof $selectedElement.className === 'string') {
				$selectedElement.className = elementClasses.join(' ');
			} else if ($selectedElement.className?.baseVal !== undefined) {
				$selectedElement.className.baseVal = elementClasses.join(' ');
			}
			onPropertyChange('className', elementClasses.join(' '));
			newClass = '';
		}
	}

	/**
	 * Remove a class
	 * @param {string} className
	 */
	function removeClass(className) {
		if ($selectedElement) {
			elementClasses = elementClasses.filter((c) => c !== className);
			// Handle both regular elements and SVG elements
			if (typeof $selectedElement.className === 'string') {
				$selectedElement.className = elementClasses.join(' ');
			} else if ($selectedElement.className?.baseVal !== undefined) {
				$selectedElement.className.baseVal = elementClasses.join(' ');
			}
			onPropertyChange('className', elementClasses.join(' '));
		}
	}

	/**
	 * Handle text content change
	 */
	function handleTextChange() {
		if ($selectedElement) {
			$selectedElement.textContent = textContent;
			onPropertyChange('textContent', textContent);
		}
	}

	/**
	 * Handle padding change
	 * @param {string} side
	 * @param {string} value
	 */
	function handlePaddingChange(side, value) {
		if ($selectedElement) {
			const property = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
			applyStyleProperty($selectedElement, property, value);
			onPropertyChange(property, value);
		}
	}

	/**
	 * Handle width change
	 */
	function handleWidthChange() {
		if ($selectedElement) {
			applyStyleProperty($selectedElement, 'width', width);
			onPropertyChange('width', width);
		}
	}

	/**
	 * Handle height change
	 */
	function handleHeightChange() {
		if ($selectedElement) {
			applyStyleProperty($selectedElement, 'height', height);
			onPropertyChange('height', height);
		}
	}

	/**
	 * Handle display change
	 * @param {any} selected
	 */
	function handleDisplayChange(selected) {
		if ($selectedElement && selected?.value) {
			display = selected.value;
			applyStyleProperty($selectedElement, 'display', display);
			onPropertyChange('display', display);
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
						on:blur={handleIdChange}
						placeholder="element-id"
					/>
				</div>

				<!-- Classes -->
				<div class="space-y-2">
					<Label>Classes</Label>
					<div class="flex gap-2">
						<Input
							bind:value={newClass}
							on:keydown={(e) => e.key === 'Enter' && addClass()}
							placeholder="Add class"
							class="flex-1"
						/>
						<button
							on:click={addClass}
							class="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
						>
							Add
						</button>
					</div>
					<div class="flex flex-wrap gap-2 mt-2">
						{#each elementClasses as className}
							<Badge variant="secondary" class="cursor-pointer" on:click={() => removeClass(className)}>
								{className}
								<span class="ml-1">×</span>
							</Badge>
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
							on:blur={handleTextChange}
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
					<Label>Padding</Label>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<Input
								bind:value={paddingTop}
								on:blur={() => handlePaddingChange('top', paddingTop)}
								placeholder="Top"
								class="text-sm"
							/>
						</div>
						<div>
							<Input
								bind:value={paddingRight}
								on:blur={() => handlePaddingChange('right', paddingRight)}
								placeholder="Right"
								class="text-sm"
							/>
						</div>
						<div>
							<Input
								bind:value={paddingBottom}
								on:blur={() => handlePaddingChange('bottom', paddingBottom)}
								placeholder="Bottom"
								class="text-sm"
							/>
						</div>
						<div>
							<Input
								bind:value={paddingLeft}
								on:blur={() => handlePaddingChange('left', paddingLeft)}
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
							on:blur={handleWidthChange}
							placeholder="auto"
						/>
					</div>
					<div class="space-y-2">
						<Label for="height">Height</Label>
						<Input
							id="height"
							bind:value={height}
							on:blur={handleHeightChange}
							placeholder="auto"
						/>
					</div>
				</div>

				<!-- Display -->
				<div class="space-y-2">
					<Label>Display</Label>
					<Select.Root onSelectedChange={handleDisplayChange}>
						<Select.Trigger class="w-full">
							<span>{display || 'Select display'}</span>
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
