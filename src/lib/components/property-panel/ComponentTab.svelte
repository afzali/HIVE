<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown, Plus, X, Copy } from 'lucide-svelte';
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

	// Component Template System
	/** @type {string} */
	let templateMode = 'new'; // 'new' or 'existing'
	/** @type {string} */
	let selectedTemplate = '';
	/** @type {Array<{name: string, type: string, props: Array<{name: string, value: string}>, customAttrs: Array<{name: string, value: string}>, route?: string, loop?: string, loopKey?: string, nav?: string, condition?: string, hasElse?: boolean}>} */
	let availableTemplates = [];

	// Accordion states
	let templateOpen = true;
	let componentTypeOpen = false;
	let loopOpen = false;
	let propsOpen = false;
	let navigationOpen = false;
	let conditionalOpen = false;
	let advancedOpen = false;

	// Track the last processed element to avoid reactive loops
	let lastProcessedElement = null;

	/**
	 * Get the iframe document where the HTML editor content is
	 */
	function getIframeDocument() {
		// Look for iframe in the page
		const iframe = document.querySelector('iframe');
		if (iframe && iframe.contentDocument) {
			return iframe.contentDocument;
		}
		
		// Fallback to main document if no iframe found
		return document;
	}

	/**
	 * Scan page for existing components and build templates
	 */
	function scanForExistingComponents() {
		console.log('Scanning for existing components...');
		
		// Check if we're in browser environment
		if (typeof document === 'undefined') {
			console.log('Document not available');
			return;
		}
		
		const templates = new Map();
		
		// Get the correct document (iframe or main)
		const targetDoc = getIframeDocument();
		console.log('Scanning in document:', targetDoc === document ? 'main document' : 'iframe document');
		
		// Try different selectors to make sure we catch everything
		const selectors = [
			'[data-cmp]',
			'[data-view-name]'
		];
		
		let allElements = [];
		selectors.forEach(selector => {
			try {
				const elements = targetDoc.querySelectorAll(selector);
				console.log(`Selector "${selector}" found ${elements.length} elements in target document`);
				allElements = [...allElements, ...Array.from(elements)];
			} catch (e) {
				console.error(`Error with selector "${selector}":`, e);
			}
		});
		
		// Remove duplicates
		allElements = [...new Set(allElements)];
		console.log(`Total unique elements found: ${allElements.length}`);
		
		allElements.forEach((element, index) => {
			console.log(`Processing element ${index + 1}:`, element);
			
			let componentName = '';
			let componentType = 'component';
			
			if (element.hasAttribute('data-cmp')) {
				componentName = element.getAttribute('data-cmp');
				componentType = 'component';
				console.log(`Found component: ${componentName} (type: ${componentType})`);
			} else if (element.hasAttribute('data-view-name')) {
				componentName = element.getAttribute('data-view-name');
				componentType = element.getAttribute('data-view-kind') || 'component';
				console.log(`Found view component: ${componentName} (type: ${componentType})`);
			}
			
			if (!componentName) {
				console.log('Skipping element - no component name');
				return;
			}
			
			// Extract all properties
			const props = [];
			const customAttrs = [];
			
			for (let i = 0; i < element.attributes.length; i++) {
				const attr = element.attributes[i];
				if (attr.name.startsWith('data-prop-')) {
					const propName = attr.name.substring(10);
					props.push({ name: propName, value: attr.value });
				} else if (!attr.name.startsWith('data-') && 
						   !['class', 'id', 'style'].includes(attr.name) &&
						   !attr.name.startsWith('on')) {
					customAttrs.push({ name: attr.name, value: attr.value });
				}
			}
			
			const template = {
				name: componentName,
				type: componentType,
				props: props,
				customAttrs: customAttrs,
				route: element.getAttribute('data-route') || '',
				loop: element.getAttribute('data-for') || '',
				loopKey: element.getAttribute('data-key') || '',
				nav: element.getAttribute('data-nav') || '',
				condition: element.getAttribute('data-if') || '',
				hasElse: element.hasAttribute('data-else')
			};
			
			console.log(`Template created for ${componentName}:`, template);
			
			// Use component name as key to avoid duplicates
			templates.set(componentName, template);
		});
		
		const newTemplates = Array.from(templates.values());
		console.log('Final templates:', newTemplates);
		
		// Force reactivity update
		availableTemplates = newTemplates;
		
		// Also trigger a manual update
		setTimeout(() => {
			availableTemplates = [...newTemplates];
		}, 10);
	}

	/**
	 * Apply template to current element
	 */
	function applyTemplate(templateName) {
		const template = availableTemplates.find(t => t.name === templateName);
		if (!template) return;
		
		// Apply template properties
		componentType = template.type;
		componentName = template.name;
		routePath = template.route || '';
		loopExpression = template.loop || '';
		loopKey = template.loopKey || '';
		navigationPath = template.nav || '';
		conditionalIf = template.condition || '';
		hasElse = template.hasElse || false;
		
		// Apply props with new IDs
		componentProps = template.props.map(prop => ({
			id: `prop-${propIdCounter++}`,
			name: prop.name,
			value: prop.value
		}));
		
		// Apply custom attributes with new IDs
		customAttributes = template.customAttrs.map(attr => ({
			id: `attr-${attributeIdCounter++}`,
			name: attr.name,
			value: attr.value
		}));
		
		// Apply to element
		applyComponentAnnotation();
	}

	/**
	 * Handle template mode change
	 */
	function handleTemplateModeChange() {
		if (templateMode === 'existing') {
			// Force scan when switching to existing mode
			setTimeout(() => {
				scanForExistingComponents();
			}, 100);
		} else {
			selectedTemplate = '';
			availableTemplates = [];
		}
	}

	// Reactive statement for template mode changes
	let previousTemplateMode = templateMode;
	$: if (templateMode !== previousTemplateMode) {
		handleTemplateModeChange();
		previousTemplateMode = templateMode;
	}

	// Reactive statement for template selection
	let previousSelectedTemplate = selectedTemplate;
	$: if (selectedTemplate !== previousSelectedTemplate && selectedTemplate) {
		applyTemplate(selectedTemplate);
		previousSelectedTemplate = selectedTemplate;
	}

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

		// Read props and custom attributes
		const props = [];
		const customAttrs = [];
		
		// List of component-specific data attributes to exclude from custom attributes
		const componentDataAttrs = [
			'data-cmp', 'data-view-kind', 'data-view-name', 'data-route',
			'data-for', 'data-key', 'data-nav', 'data-if', 'data-else'
		];
		
		for (let i = 0; i < element.attributes.length; i++) {
			const attr = element.attributes[i];
			
			if (attr.name.startsWith('data-prop-')) {
				// Component props
				const propName = attr.name.substring(10); // Remove 'data-prop-'
				props.push({ id: `prop-${propIdCounter++}`, name: propName, value: attr.value });
			} else if (attr.name.startsWith('data-') && !componentDataAttrs.includes(attr.name)) {
				// Other data-* attributes (custom)
				customAttrs.push({ id: `attr-${attributeIdCounter++}`, name: attr.name, value: attr.value });
			} else if (!attr.name.startsWith('data-') && 
					   !['class', 'id', 'style'].includes(attr.name) &&
					   !attr.name.startsWith('on')) {
				// Non-data custom attributes (like aria-*, role, etc.)
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
				{$selectedElement?.tagName?.toLowerCase() || ''}{$selectedElement?.id ? `#${$selectedElement.id}` : ''}{$selectedElement?.className && typeof $selectedElement.className === 'string' ? `.${$selectedElement.className.split(' ').join('.')}` : ''}
			</div>
		</div>
	{/if}
	<!-- Component Template Section -->
	<Collapsible.Root bind:open={templateOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Component Template</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {templateOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label class="text-xs">Template Mode</Label>
					<Select.Root type="single" name="templateMode" bind:value={templateMode}>
						<Select.Trigger class="w-full h-9 text-sm">
							{templateMode === 'new' ? 'New Component' : 'Use Existing Component'}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Item value="new" label="New Component">
									New Component
								</Select.Item>
								<Select.Item value="existing" label="Use Existing Component">
									Use Existing Component
								</Select.Item>
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>

				{#if templateMode === 'existing'}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label class="text-xs">Available Components</Label>
							<button
								onclick={() => {
									console.log('Scan button clicked');
									scanForExistingComponents();
								}}
								class="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs hover:bg-muted/80 transition-colors"
								title="Refresh component list"
							>
								<Copy class="h-3 w-3" />
								Scan ({availableTemplates.length})
							</button>
						</div>

						
						{#if availableTemplates.length === 0}
							<div class="p-3 text-center text-xs text-muted-foreground bg-muted/30 rounded-md">
								No components found on this page
							</div>
						{:else}
							<Select.Root type="single" name="selectedTemplate" bind:value={selectedTemplate}>
								<Select.Trigger class="w-full h-9 text-sm">
									{selectedTemplate || 'Select a component'}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										{#each availableTemplates as template (template.name)}
											<Select.Item value={template.name} label={template.name}>
												<div class="flex flex-col items-start w-full">
													<span class="font-medium">{template.name}</span>
													<span class="text-xs text-muted-foreground">
														{template.type} • {template.props.length} props • {template.customAttrs.length} attrs
													</span>
												</div>
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						{/if}
					</div>

					{#if selectedTemplate}
						<div class="p-3 bg-primary/5 border border-primary/20 rounded-md">
							<div class="text-xs font-medium text-primary mb-2">Template Applied</div>
							<div class="text-xs text-muted-foreground">
								All properties from "{selectedTemplate}" have been copied. You can modify them below.
							</div>
						</div>
					{/if}
				{/if}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>

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