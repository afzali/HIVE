<script>
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { layersPanelOpen, selectedElement, iframeDocument } from '$lib/stores.js';
	import { syncHTMLSource } from '$lib/html-sync.js';
	import { 
		X, 
		ChevronRight, 
		ChevronDown, 
		Eye, 
		EyeOff, 
		GripVertical,
		Plus,
		Trash2,
		Layers
	} from 'lucide-svelte';

	/** @type {import('$lib/types.js').LayerNode[]} */
	let layerTree = [];

	/** @type {HTMLElement|null} */
	let panelElement = null;

	/** @type {boolean} */
	let isDragging = false;

	/** @type {{x: number, y: number}} */
	let dragOffset = { x: 0, y: 0 };

	/** @type {{x: number, y: number}} */
	let panelPosition = { x: 20, y: 100 };

	/**
	 * Build layer tree from iframe document
	 */
	function buildLayerTree() {
		const doc = $iframeDocument;
		if (!doc || !doc.body) {
			layerTree = [];
			return;
		}

		/**
		 * Convert DOM element to layer node
		 * @param {HTMLElement} element
		 * @returns {import('$lib/types.js').LayerNode}
		 */
		function elementToLayerNode(element) {
			const children = Array.from(element.children)
				.filter(child => child instanceof HTMLElement)
				.map(child => elementToLayerNode(child));

			return {
				element,
				tag: element.tagName.toLowerCase(),
				id: element.id || undefined,
				classes: Array.from(element.classList),
				children,
				isExpanded: children.length <= 3 // Auto-expand if few children
			};
		}

		layerTree = [elementToLayerNode(doc.body)];
	}

	/**
	 * Toggle layer expansion
	 * @param {import('$lib/types.js').LayerNode} node
	 */
	function toggleExpansion(node) {
		node.isExpanded = !node.isExpanded;
		layerTree = [...layerTree]; // Trigger reactivity
	}

	/**
	 * Select element from layer
	 * @param {HTMLElement} element
	 */
	function selectElement(element) {
		selectedElement.set(element);
		
		// Scroll element into view in iframe
		element.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	/**
	 * Get display name for layer
	 * @param {import('$lib/types.js').LayerNode} node
	 * @returns {string}
	 */
	function getDisplayName(node) {
		let name = node.tag;
		
		if (node.id) {
			name += `#${node.id}`;
		}
		
		if (node.classes.length > 0) {
			name += `.${node.classes.slice(0, 2).join('.')}`;
			if (node.classes.length > 2) {
				name += '...';
			}
		}
		
		return name;
	}

	/**
	 * Move element in DOM
	 * @param {HTMLElement} element
	 * @param {HTMLElement} targetElement
	 * @param {'before'|'after'|'into'} position
	 */
	function moveElement(element, targetElement, position) {
		if (element === targetElement || element.contains(targetElement)) {
			return; // Can't move into self or child
		}

		try {
			switch (position) {
				case 'before':
					targetElement.parentElement?.insertBefore(element, targetElement);
					break;
				case 'after':
					if (targetElement.nextSibling) {
						targetElement.parentElement?.insertBefore(element, targetElement.nextSibling);
					} else {
						targetElement.parentElement?.appendChild(element);
					}
					break;
				case 'into':
					targetElement.appendChild(element);
					break;
			}
			
			// Rebuild tree and sync HTML
			buildLayerTree();
			syncHTMLSource();
		} catch (error) {
			console.error('Error moving element:', error);
		}
	}

	/**
	 * Delete element
	 * @param {HTMLElement} element
	 */
	function deleteElement(element) {
		if (element.tagName.toLowerCase() === 'body') {
			return; // Can't delete body
		}

		try {
			// Clear selection if deleting selected element
			if ($selectedElement === element) {
				selectedElement.set(null);
			}

			element.remove();
			buildLayerTree();
			syncHTMLSource();
		} catch (error) {
			console.error('Error deleting element:', error);
		}
	}

	/**
	 * Start dragging panel
	 * @param {MouseEvent} e
	 */
	function startDrag(e) {
		if (!panelElement) return;
		
		isDragging = true;
		const rect = panelElement.getBoundingClientRect();
		dragOffset = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
		
		document.addEventListener('mousemove', handleDrag);
		document.addEventListener('mouseup', stopDrag);
	}

	/**
	 * Handle panel dragging
	 * @param {MouseEvent} e
	 */
	function handleDrag(e) {
		if (!isDragging) return;
		
		panelPosition = {
			x: e.clientX - dragOffset.x,
			y: e.clientY - dragOffset.y
		};
	}

	/**
	 * Stop dragging panel
	 */
	function stopDrag() {
		isDragging = false;
		document.removeEventListener('mousemove', handleDrag);
		document.removeEventListener('mouseup', stopDrag);
	}

	/**
	 * Close panel
	 */
	function closePanel() {
		layersPanelOpen.set(false);
	}

	// Rebuild tree when iframe document changes
	$: if ($iframeDocument) {
		buildLayerTree();
	}

	// Rebuild tree when layers panel opens
	$: if ($layersPanelOpen) {
		buildLayerTree();
	}
</script>

{#if $layersPanelOpen}
	<div
		bind:this={panelElement}
		class="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-2xl z-[60] min-w-80 max-w-96 max-h-[70vh] flex flex-col"
		style="left: {panelPosition.x}px; top: {panelPosition.y}px;"
	>
		<!-- Header -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex items-center justify-between p-3 border-b border-gray-700/50 cursor-move"
			onmousedown={startDrag}
			role="button"
			tabindex="0"
		>
			<div class="flex items-center gap-2">
				<Layers class="w-4 h-4 text-gray-300" />
				<span class="text-sm font-medium text-white">Layers</span>
			</div>
			<Button
				variant="ghost"
				size="sm"
				class="w-6 h-6 p-0 text-gray-400 hover:text-white"
				onclick={closePanel}
			>
				<X class="w-4 h-4" />
			</Button>
		</div>

		<!-- Tree Content -->
		<div class="flex-1 overflow-y-auto p-2">
			{#if layerTree.length === 0}
				<div class="text-center py-8 text-sm text-gray-400">
					No layers found
				</div>
			{:else}
				{#each layerTree as node (node.element)}
					<LayerNode 
						{node} 
						level={0} 
						selectedElement={$selectedElement}
						onSelect={selectElement}
						onToggle={toggleExpansion}
						onMove={moveElement}
						onDelete={deleteElement}
					/>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<!-- Layer Node Component -->
{#snippet LayerNode({ node, level, selectedElement, onSelect, onToggle, onMove, onDelete })}
	<div class="select-none">
		<!-- Node Row -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="flex items-center gap-1 py-1 px-2 rounded hover:bg-gray-800/50 cursor-pointer group"
			class:selected={selectedElement && selectedElement === node.element}
			style="margin-left: {level * 16}px"
			onclick={() => onSelect(node.element)}
			draggable="true"
			ondragstart={(e) => {
				e.dataTransfer.setData('text/plain', '');
				e.dataTransfer.effectAllowed = 'move';
			}}
			ondragover={(e) => {
				e.preventDefault();
				e.dataTransfer.dropEffect = 'move';
			}}
			ondrop={(e) => {
				e.preventDefault();
				// Handle drop logic here
			}}
			role="button"
			tabindex="0"
		>
			<!-- Expand/Collapse Button -->
			{#if node.children.length > 0}
				<Button
					variant="ghost"
					size="sm"
					class="w-4 h-4 p-0 text-gray-400 hover:text-white"
					onclick={(e) => {
						e.stopPropagation();
						onToggle(node);
					}}
				>
					{#if node.isExpanded}
						<ChevronDown class="w-3 h-3" />
					{:else}
						<ChevronRight class="w-3 h-3" />
					{/if}
				</Button>
			{:else}
				<div class="w-4 h-4"></div>
			{/if}

			<!-- Element Info -->
			<div class="flex-1 flex items-center gap-2 min-w-0">
				<span class="text-sm text-white truncate">
					{getDisplayName(node)}
				</span>
				{#if node.element.textContent?.trim()}
					<span class="text-xs text-gray-400 truncate max-w-20">
						"{node.element.textContent.trim().substring(0, 20)}"
					</span>
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					variant="ghost"
					size="sm"
					class="w-4 h-4 p-0 text-gray-400 hover:text-red-400"
					onclick={(e) => {
						e.stopPropagation();
						onDelete(node.element);
					}}
					title="Delete Element"
				>
					<Trash2 class="w-3 h-3" />
				</Button>
			</div>
		</div>

		<!-- Children -->
		{#if node.isExpanded && node.children.length > 0}
			{#each node.children as childNode (childNode.element)}
				<svelte:self 
					node={childNode} 
					level={level + 1} 
					{selectedElement}
					{onSelect}
					{onToggle}
					{onMove}
					{onDelete}
				/>
			{/each}
		{/if}
	</div>
{/snippet}

<style>
	.selected {
		background-color: rgba(37, 99, 235, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.3);
	}
</style>