<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown, Plus, X } from 'lucide-svelte';
	import { selectedElement } from '$lib/stores.js';
	import { syncHTMLSource } from '$lib/html-sync.js';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	// Component annotation variables
	/** @type {string} */
	let componentType = 'none';
	
	// Component type options
	const componentTypes = [
		{ value: "none", label: "None" },
		{ value: "component", label: "Component" },
		{ value: "page", label: "Page" },
		{ value: "panel", label: "Panel" },
		{ value: "widget", label: "Widget" }
	];
	
	// Derived content for select trigger
	$: triggerContent = componentTypes.find((t) => t.value === componentType)?.label ?? "Select type";
	/** @type {string} */
	let componentName = '';
	/** @type {string} */
	let routePath = '';
	/** @type {string} */
	let loopExpression = '';
	/** @type {string} */
	let loopKey = '';
	/** @type {string} */
	let navigationPath = '';
	/** @type {Array<{id: string, name: string, value: string}>} */
	let componentProps = [];
	let propIdCounter = 0;
	/** @type {string} */
	let conditionalIf = '';
	/** @type {boolean} */
	let hasElse = false;

	// Advanced attributes
	/** @type {Array<{id: string, name: string, value: string}>} */
	let customAttributes = [];
	let attributeIdCounter = 0;

	// Accordion states
	let componentTypeOpen = true;
	let loopOpen = false;
	let propsOpen = false;
	let navigationOpen = false;
	let conditionalOpen = false;
	let advancedOpen = false;

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Update local state when selected element changes
	 */
	function updateElementProperties(element) {
		if (!element || !element.isConnected) return;

		// Reset all values
		componentType = 'none';
		componentName = '';
		routePath = '';
		loopExpression = '';
		loopKey = '';
		navigationPath = '';
		componentProps = [];
		conditionalIf = '';
		hasElse = false;
		propIdCounter = 0;
		customAttributes = [];
		attributeIdCounter = 0;

		// Read existing attributes
		if (element.hasAttribute('data-cmp')) {
			componentType = 'component';
			componentName = element.getAttribute('data-cmp') || '';
		} else if (element.hasAttribute('data-view-kind')) {
			const viewKind = element.getAttribute('data-view-kind');
			componentType = viewKind || 'component';
			componentName = element.getAttribute('data-view-name') || '';
			if (componentType === 'page') {
				routePath = element.getAttribute('data-route') || '';
			}
		}

		// Read loop attributes
		loopExpression = element.getAttribute('data-for') || '';
		loopKey = element.getAttribute('data-key') || '';

		// Read navigation
		navigationPath = element.getAttribute('data-nav') || '';

		// Read conditional
		conditionalIf = element.getAttribute('data-if') || '';
		hasElse = element.hasAttribute('data-else');

		// Read props
		const props = [];
		const customAttrs = [];
		for (let i = 0; i < element.attributes.length; i++) {
			const attr = element.attributes[i];
			if (attr.name.startsWith('data-prop-')) {
				const propName = attr.name.substring(10); // Remove 'data-prop-'
				props.push({ id: `prop-${propIdCounter++}`, name: propName, value: attr.value });
			} else if (!attr.name.startsWith('data-') && 
					   !['class', 'id', 'style'].includes(attr.name) &&
					   !attr.name.startsWith('on')) {
				// Custom attributes (excluding standard ones)
				customAttrs.push({ id: `attr-${attributeIdCounter++}`, name: attr.name, value: attr.value });
			}
		}
		componentProps = props;
		customAttributes = customAttrs;
	}

	$: if ($selectedElement && $selectedElement !== lastProcessedElement) {
		lastProcessedElement = $selectedElement;
		updateElementProperties($selectedElement);
	}

	// Handle component type changes
	let previousComponentType = componentType;
	$: if (componentType !== previousComponentType) {
		handleComponentTypeChange(componentType);
		previousComponentType = componentType;
	}

	/**
	 * Handle component type change
	 */
	function handleComponentTypeChange(type) {
		componentType = type;
		if (type === 'none') {
			removeComponentAnnotations();
		} else {
			applyComponentAnnotation();
		}
	}

	/**
	 * Apply component annotation to element
	 */
	function applyComponentAnnotation() {
		if (!$selectedElement) return;
		
		const element = $selectedElement;
		
		// Remove existing component attributes
		removeComponentAnnotations();
		
		// Apply based on component type
		if (componentType === 'component' && componentName) {
			element.setAttribute('data-cmp', componentName);
		} else if (componentType === 'page' && componentName) {
			element.setAttribute('data-view-kind', 'page');
			element.setAttribute('data-view-name', componentName);
			if (routePath) {
				element.setAttribute('data-route', routePath);
			}
		} else if (componentType === 'panel' && componentName) {
			element.setAttribute('data-view-kind', 'panel');
			element.setAttribute('data-view-name', componentName);
		} else if (componentType === 'widget' && componentName) {
			element.setAttribute('data-view-kind', 'widget');
			element.setAttribute('data-view-name', componentName);
		}
		
		// Apply loop annotation
		if (loopExpression) {
			element.setAttribute('data-for', loopExpression);
			if (loopKey) {
				element.setAttribute('data-key', loopKey);
			}
		}
		
		// Apply props
		componentProps.forEach(prop => {
			if (prop.name && prop.value) {
				element.setAttribute(`data-prop-${prop.name}`, prop.value);
			}
		});

		// Apply custom attributes
		customAttributes.forEach(attr => {
			if (attr.name && attr.value) {
				element.setAttribute(attr.name, attr.value);
			}
		});
		
		// Apply navigation
		if (navigationPath) {
			element.setAttribute('data-nav', navigationPath);
		}
		
		// Apply conditional
		if (conditionalIf) {
			element.setAttribute('data-if', conditionalIf);
		}
		if (hasElse) {
			element.setAttribute('data-else', '');
		}
		
		syncHTMLSource();
	}

	/**
	 * Remove component annotations from element
	 */
	function removeComponentAnnotations() {
		if (!$selectedElement) return;
		
		const element = $selectedElement;
		const attributesToRemove = [];
		
		// Collect all data-* attributes to remove
		for (let i = 0; i < element.attributes.length; i++) {
			const attr = element.attributes[i];
			if (attr.name.startsWith('data-cmp') || 
				attr.name.startsWith('data-view-') ||
				attr.name.startsWith('data-route') ||
				attr.name.startsWith('data-for') ||
				attr.name.startsWith('data-key') ||
				attr.name.startsWith('data-prop-') ||
				attr.name.startsWith('data-nav') ||
				attr.name.startsWith('data-if') ||
				attr.name.startsWith('data-else')) {
				attributesToRemove.push(attr.name);
			}
		}
		
		// Remove attributes
		attributesToRemove.forEach(attrName => {
			element.removeAttribute(attrName);
		});
	}

	/**
	 * Add new prop
	 */
	function addProp() {
		componentProps = [...componentProps, { id: `prop-${propIdCounter++}`, name: '', value: '' }];
	}

	/**
	 * Remove prop
	 */
	function removeProp(index) {
		componentProps = componentProps.filter((_, i) => i !== index);
		applyComponentAnnotation();
	}

	/**
	 * Update prop
	 */
	function updateProp(index, field, value) {
		componentProps[index][field] = value;
		applyComponentAnnotation();
	}

	/**
	 * Add new custom attribute
	 */
	function addCustomAttribute() {
		customAttributes = [...customAttributes, { id: `attr-${attributeIdCounter++}`, name: '', value: '' }];
	}

	/**
	 * Remove custom attribute
	 */
	function removeCustomAttribute(index) {
		const attrToRemove = customAttributes[index];
		if (attrToRemove.name && $selectedElement) {
			$selectedElement.removeAttribute(attrToRemove.name);
		}
		customAttributes = customAttributes.filter((_, i) => i !== index);
		syncHTMLSource();
	}

	/**
	 * Update custom attribute
	 */
	function updateCustomAttribute(index, field, value) {
		const oldName = customAttributes[index].name;
		customAttributes[index][field] = value;
		
		if ($selectedElement) {
			const element = $selectedElement;
			const attr = customAttributes[index];
			
			// Remove old attribute if name changed
			if (field === 'name' && oldName && oldName !== value) {
				element.removeAttribute(oldName);
			}
			
			// Set new attribute
			if (attr.name && attr.value) {
				element.setAttribute(attr.name, attr.value);
			}
			
			syncHTMLSource();
		}
	}


</script>

<Tabs.Content value="component" class="flex-1 overflow-y-auto mt-4 space-y-2">
	<!-- Element Status -->
	{#if !$selectedElement}
		<div class="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
			<div class="mb-2">No element selected</div>
			<div class="text-xs">Select an element to configure component properties</div>
		</div>
	{:else}
		<div class="p-3 bg-primary/5 border border-primary/20 rounded-lg">
			<div class="text-xs font-medium text-primary mb-1">Selected Element</div>
			<div class="text-xs text-muted-foreground">
				{$selectedElement.tagName.toLowerCase()}{$selectedElement.id ? `#${$selectedElement.id}` : ''}{$selectedElement.className ? `.${$selectedElement.className.split(' ').join('.')}` : ''}
			</div>
		</div>
	{/if}
	<!-- Component Type Section -->
	<Collapsible.Root bind:open={componentTypeOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Component Type</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {componentTypeOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label class="text-xs">Type</Label>
					<Select.Root type="single" name="componentType" bind:value={componentType}>
						<Select.Trigger class="w-full h-9 text-sm">
							{triggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each componentTypes as type (type.value)}
									<Select.Item
										value={type.value}
										label={type.label}
									>
										{type.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>

				{#if componentType !== 'none'}
					<div class="space-y-2">
						<Label for="component-name" class="text-xs">Name (PascalCase)</Label>
						<Input
							id="component-name"
							bind:value={componentName}
							oninput={applyComponentAnnotation}
							placeholder="ComponentName"
							class="h-9 text-sm"
						/>
					</div>

					{#if componentType === 'page'}
						<div class="space-y-2">
							<Label for="route-path" class="text-xs">Route Path</Label>
							<Input
								id="route-path"
								bind:value={routePath}
								oninput={applyComponentAnnotation}
								placeholder="/dashboard"
								class="h-9 text-sm"
							/>
						</div>
					{/if}
				{/if}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Loop Annotation Section -->
	<Collapsible.Root bind:open={loopOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Loop Annotation</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {loopOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="loop-expression" class="text-xs">Loop Expression</Label>
					<Input
						id="loop-expression"
						bind:value={loopExpression}
						oninput={applyComponentAnnotation}
						placeholder="item in items"
						class="h-9 text-sm"
					/>
				</div>
				<div class="space-y-2">
					<Label for="loop-key" class="text-xs">Key</Label>
					<Input
						id="loop-key"
						bind:value={loopKey}
						oninput={applyComponentAnnotation}
						placeholder="item.id"
						class="h-9 text-sm"
					/>
				</div>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Props Section -->
	<Collapsible.Root bind:open={propsOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Props (data-prop-*)</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {propsOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-xs text-muted-foreground">Component properties</span>
					<button
						onclick={addProp}
						class="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors"
					>
						<Plus class="h-3 w-3" />
						Add Prop
					</button>
				</div>
				
				{#if componentProps.length === 0}
					<div class="text-center py-4 text-xs text-muted-foreground">
						No properties added yet
					</div>
				{:else}
					{#each componentProps as prop, index (prop.id)}
						<div class="space-y-2 p-3 border rounded-lg bg-background/50">
							<div class="flex items-center justify-between">
								<span class="text-xs font-medium text-muted-foreground">Property {index + 1}</span>
								<button
									onclick={() => removeProp(index)}
									class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
								>
									<X class="h-3 w-3" />
								</button>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div class="space-y-1">
									<Label class="text-xs">Name</Label>
									<Input
										bind:value={prop.name}
										oninput={() => updateProp(index, 'name', prop.name)}
										placeholder="propName"
										class="h-8 text-sm"
									/>
								</div>
								<div class="space-y-1">
									<Label class="text-xs">Value</Label>
									<Input
										bind:value={prop.value}
										oninput={() => updateProp(index, 'value', prop.value)}
										placeholder="value"
										class="h-8 text-sm"
									/>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Navigation Section -->
	<Collapsible.Root bind:open={navigationOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Navigation</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {navigationOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<div class="space-y-2">
				<Label for="navigation-path" class="text-xs">Route Path (data-nav)</Label>
				<Input
					id="navigation-path"
					bind:value={navigationPath}
					oninput={applyComponentAnnotation}
					placeholder="/product/123"
					class="h-9 text-sm"
				/>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Conditional Rendering Section -->
	<Collapsible.Root bind:open={conditionalOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Conditional Rendering</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {conditionalOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="conditional-if" class="text-xs">Condition (data-if)</Label>
					<Input
						id="conditional-if"
						bind:value={conditionalIf}
						oninput={applyComponentAnnotation}
						placeholder="user.isLoggedIn"
						class="h-9 text-sm"
					/>
				</div>
				{#if conditionalIf}
					<div class="flex items-center space-x-2 p-2 bg-muted/30 rounded-md">
						<input
							type="checkbox"
							id="has-else"
							bind:checked={hasElse}
							onchange={applyComponentAnnotation}
							class="rounded border-border"
						/>
						<Label for="has-else" class="text-xs">Has else block (data-else)</Label>
					</div>
				{/if}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Advanced Section -->
	<Collapsible.Root bind:open={advancedOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Advanced Attributes</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {advancedOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-xs text-muted-foreground">Custom HTML attributes</span>
					<button
						onclick={addCustomAttribute}
						class="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors"
					>
						<Plus class="h-3 w-3" />
						Add Attribute
					</button>
				</div>
				
				{#if customAttributes.length === 0}
					<div class="text-center py-4 text-xs text-muted-foreground">
						No custom attributes added yet
					</div>
				{:else}
					{#each customAttributes as attr, index (attr.id)}
						<div class="space-y-2 p-3 border rounded-lg bg-background/50">
							<div class="flex items-center justify-between">
								<span class="text-xs font-medium text-muted-foreground">Attribute {index + 1}</span>
								<button
									onclick={() => removeCustomAttribute(index)}
									class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
								>
									<X class="h-3 w-3" />
								</button>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div class="space-y-1">
									<Label class="text-xs">Attribute Name</Label>
									<Input
										bind:value={attr.name}
										oninput={() => updateCustomAttribute(index, 'name', attr.name)}
										placeholder="data-custom"
										class="h-8 text-sm"
									/>
								</div>
								<div class="space-y-1">
									<Label class="text-xs">Value</Label>
									<Input
										bind:value={attr.value}
										oninput={() => updateCustomAttribute(index, 'value', attr.value)}
										placeholder="value"
										class="h-8 text-sm"
									/>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
</Tabs.Content>