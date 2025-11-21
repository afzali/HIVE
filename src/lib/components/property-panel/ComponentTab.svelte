<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { selectedElement } from '$lib/stores.js';
	import { syncHTMLSource } from '$lib/html-sync.js';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	// Component annotation variables
	/** @type {string} */
	let componentType = 'none';
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
	/** @type {Array<{name: string, value: string}>} */
	let componentProps = [];
	/** @type {string} */
	let conditionalIf = '';
	/** @type {boolean} */
	let hasElse = false;

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
		componentProps = [...componentProps, { name: '', value: '' }];
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
</script>

<Tabs.Content value="component" class="flex-1 overflow-y-auto mt-4 space-y-6">
	<!-- Component Type -->
	<div class="space-y-4">
		<h3 class="text-sm font-medium">Component Type</h3>
		<div class="space-y-2">
			<Label>Type</Label>
			<Select.Root type="single"
				value={componentType}
				onValueChange={handleComponentTypeChange}
			>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select type" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="none">None</Select.Item>
					<Select.Item value="component">Component</Select.Item>
					<Select.Item value="page">Page</Select.Item>
					<Select.Item value="panel">Panel</Select.Item>
					<Select.Item value="widget">Widget</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		{#if componentType !== 'none'}
			<div class="space-y-2">
				<Label for="component-name">Name (PascalCase)</Label>
				<Input
					id="component-name"
					bind:value={componentName}
					oninput={applyComponentAnnotation}
					placeholder="ComponentName"
				/>
			</div>

			{#if componentType === 'page'}
				<div class="space-y-2">
					<Label for="route-path">Route Path</Label>
					<Input
						id="route-path"
						bind:value={routePath}
						oninput={applyComponentAnnotation}
						placeholder="/dashboard"
					/>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Loop Annotation -->
	<div class="space-y-4">
		<h3 class="text-sm font-medium">Loop Annotation</h3>
		<div class="space-y-2">
			<Label for="loop-expression">Loop Expression</Label>
			<Input
				id="loop-expression"
				bind:value={loopExpression}
				oninput={applyComponentAnnotation}
				placeholder="item in items"
			/>
		</div>
		<div class="space-y-2">
			<Label for="loop-key">Key</Label>
			<Input
				id="loop-key"
				bind:value={loopKey}
				oninput={applyComponentAnnotation}
				placeholder="item.id"
			/>
		</div>
	</div>

	<!-- Props -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-medium">Props (data-prop-*)</h3>
			<button
				onclick={addProp}
				class="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
			>
				Add Prop
			</button>
		</div>
		
		{#each componentProps as prop, index}
			<div class="grid grid-cols-2 gap-2 items-end">
				<div class="space-y-1">
					<Label class="text-xs">Name</Label>
					<Input
						bind:value={prop.name}
						oninput={() => updateProp(index, 'name', prop.name)}
						placeholder="propName"
						class="text-sm"
					/>
				</div>
				<div class="space-y-1">
					<Label class="text-xs">Value</Label>
					<div class="flex gap-1">
						<Input
							bind:value={prop.value}
							oninput={() => updateProp(index, 'value', prop.value)}
							placeholder="value"
							class="text-sm flex-1"
						/>
						<button
							onclick={() => removeProp(index)}
							class="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs hover:bg-destructive/90"
						>
							×
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Navigation -->
	<div class="space-y-4">
		<h3 class="text-sm font-medium">Navigation</h3>
		<div class="space-y-2">
			<Label for="navigation-path">Route Path (data-nav)</Label>
			<Input
				id="navigation-path"
				bind:value={navigationPath}
				oninput={applyComponentAnnotation}
				placeholder="/product/123"
			/>
		</div>
	</div>

	<!-- Conditional Rendering -->
	<div class="space-y-4">
		<h3 class="text-sm font-medium">Conditional Rendering</h3>
		<div class="space-y-2">
			<Label for="conditional-if">Condition (data-if)</Label>
			<Input
				id="conditional-if"
				bind:value={conditionalIf}
				oninput={applyComponentAnnotation}
				placeholder="user.isLoggedIn"
			/>
		</div>
		<div class="flex items-center space-x-2">
			<input
				type="checkbox"
				id="has-else"
				bind:checked={hasElse}
				onchange={applyComponentAnnotation}
				class="rounded"
			/>
			<Label for="has-else" class="text-sm">Has else block (data-else)</Label>
		</div>
	</div>
</Tabs.Content>