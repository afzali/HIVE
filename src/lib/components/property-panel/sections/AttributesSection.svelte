<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { AutocompleteInput } from '$lib/components/ui/autocomplete-input';
	import { selectedElement } from '$lib/stores.js';
	import { debounce } from '$lib/dom-utils.js';
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
	/** @type {string[]} */
	let tailwindClasses = [];

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	// Load Tailwind classes on component mount
	async function loadTailwindClasses() {
		try {
			const response = await fetch('/classes.json');
			if (response.ok) {
				tailwindClasses = await response.json();
			}
		} catch (error) {
			console.warn('Could not load Tailwind classes:', error);
		}
	}

	// Load classes when component mounts
	loadTailwindClasses();

	/**
	 * Update local state when selected element changes
	 */
	function updateElementProperties(element) {
		if (!element || !element.isConnected) return;

		elementId = element.id || '';
		// Handle className - it can be a string or SVGAnimatedString
		const className = typeof element.className === 'string' 
			? element.className 
			: (element.className?.baseVal || '');
		elementClasses = className ? className.split(' ').filter(Boolean) : [];
		textContent = element.textContent || '';
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
	function addClass(className = newClass) {
		if (className && $selectedElement && !elementClasses.includes(className)) {
			elementClasses = [...elementClasses, className];
			
			// Handle both regular elements and SVG elements
			if (typeof $selectedElement.className === 'string') {
				$selectedElement.className = elementClasses.join(' ');
			} else if ($selectedElement.className?.baseVal !== undefined) {
				$selectedElement.className.baseVal = elementClasses.join(' ');
			}
			onPropertyChange('className', elementClasses.join(' '));
			syncHTMLSource();
			newClass = '';
		}
	}

	/**
	 * Remove a class
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
			syncHTMLSource();
		}
	}

	/**
	 * Handle text content change (debounced)
	 */
	const debouncedTextChange = debounce(() => {
		if ($selectedElement) {
			const element = $selectedElement;
			element.textContent = textContent;
			onPropertyChange('textContent', textContent);
			syncHTMLSource();
		}
	}, 300);

	/**
	 * Handle text content change on focusout (immediate)
	 */
	function handleTextFocusOut() {
		if ($selectedElement) {
			const element = $selectedElement;
			element.textContent = textContent;
			onPropertyChange('textContent', textContent);
			syncHTMLSource();
		}
	}
</script>

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
			<AutocompleteInput
				bind:value={newClass}
				suggestions={tailwindClasses}
				onSelect={(className) => addClass(className)}
				onkeydown={(e) => e.key === 'Enter' && addClass()}
				placeholder="Add Tailwind class"
				class="flex-1"
			/>
			<button
				onclick={() => addClass()}
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
	{#if $selectedElement && $selectedElement.children.length === 0}
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