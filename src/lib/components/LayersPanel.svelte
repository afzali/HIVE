<script>
	import { Button } from '$lib/components/ui/button';
	import { layersPanelOpen, iframeDocument, selectedElement } from '$lib/stores.js';
	import { syncHTMLSource } from '$lib/html-sync.js';
	import { X, ChevronRight, ChevronDown, Layers, Trash2 } from 'lucide-svelte';

	let layerTree = [];
	let panelElement = null;
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };
	let panelPosition = { x: 20, y: 100 };
	let isBuilding = false;
	let hasBuiltOnce = false;
	let selectedHiveId = '';
	let isClickingFromTree = false; // Flag to prevent loop

	/**
	 * Build layer tree - FAST: One-time DOM snapshot
	 */
	function buildLayerTree() {
		if (isBuilding) return;
		isBuilding = true;

		const doc = $iframeDocument;
		if (!doc || !doc.body) {
			layerTree = [];
			isBuilding = false;
			return;
		}

		const startTime = performance.now();

		function extractNodeData(element, depth = 0) {
			if (element.nodeType !== 1) return null;
			
			const hiveId = element.getAttribute('data-hive-id') || '';
			const tag = element.tagName.toLowerCase();
			const id = element.id || undefined;
			
			const classList = element.classList;
			const classes = [];
			for (let i = 0; i < classList.length; i++) {
				classes.push(classList[i]);
			}
			
			const children = [];
			const childElements = element.children;
			
			for (let i = 0; i < childElements.length; i++) {
				const child = childElements[i];
				if (child.classList.length > 0 && child.classList[0].startsWith('hive-')) continue;
				
				const childData = extractNodeData(child, depth + 1);
				if (childData) children.push(childData);
			}

			return {
				hiveId,
				tag,
				id,
				classes,
				children,
				isExpanded: depth < 2
			};
		}

		const treeData = extractNodeData(doc.body, 0);
		layerTree = treeData ? [treeData] : [];
		
		const endTime = performance.now();
		console.log(`🚀 Tree built in ${(endTime - startTime).toFixed(2)}ms`);
		
		isBuilding = false;
		hasBuiltOnce = true;
	}

	function toggleExpansion(node) {
		node.isExpanded = !node.isExpanded;
		layerTree = layerTree;
	}

	function getDisplayName(node) {
		let name = node.tag;
		if (node.id) name += `#${node.id}`;
		if (node.classes.length > 0) {
			name += `.${node.classes.slice(0, 2).join('.')}`;
			if (node.classes.length > 2) name += '...';
		}
		return name;
	}

	/**
	 * Click element in iframe by hiveId (from tree)
	 */
	function clickElement(hiveId) {
		if (!hiveId || !$iframeDocument) return;
		
		const element = $iframeDocument.querySelector(`[data-hive-id="${hiveId}"]`);
		if (element) {
			console.log('🖱️ Tree click -> iframe element:', element.tagName, hiveId);
			isClickingFromTree = true;
			selectedHiveId = hiveId;
			element.click();
			// Reset flag after a short delay
			setTimeout(() => {
				isClickingFromTree = false;
			}, 100);
		}
	}

	/**
	 * Delete element by hiveId
	 */
	function deleteElement(hiveId, event) {
		event.stopPropagation(); // Don't trigger click on parent
		
		if (!hiveId || !$iframeDocument) return;
		
		const element = $iframeDocument.querySelector(`[data-hive-id="${hiveId}"]`);
		if (element && element.tagName.toLowerCase() !== 'body') {
			console.log('🗑️ Deleting element:', element.tagName, hiveId);
			
			// Clear selection if this element is selected
			if (selectedHiveId === hiveId) {
				selectedElement.set(null);
				selectedHiveId = '';
			}
			
			// Remove from DOM
			element.remove();
			
			// Sync HTML
			syncHTMLSource();
			
			// Rebuild tree
			refreshTree();
		}
	}

	function startDrag(e) {
		if (!panelElement) return;
		isDragging = true;
		const rect = panelElement.getBoundingClientRect();
		dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
		document.addEventListener('mousemove', handleDrag);
		document.addEventListener('mouseup', stopDrag);
	}

	function handleDrag(e) {
		if (!isDragging) return;
		panelPosition = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
	}

	function stopDrag() {
		isDragging = false;
		document.removeEventListener('mousemove', handleDrag);
		document.removeEventListener('mouseup', stopDrag);
	}

	function closePanel() {
		layersPanelOpen.set(false);
	}

	function refreshTree() {
		layerTree = [];
		isBuilding = false;
		hasBuiltOnce = false;
		buildLayerTree();
	}

	// Build tree when panel opens
	$: if ($layersPanelOpen && $iframeDocument && !hasBuiltOnce) {
		buildLayerTree();
	}

	// Reset when panel closes
	$: if (!$layersPanelOpen) {
		hasBuiltOnce = false;
	}

	// Watch for element selection in iframe (from user click)
	$: if ($selectedElement && !isClickingFromTree) {
		const hiveId = $selectedElement.getAttribute('data-hive-id');
		if (hiveId && hiveId !== selectedHiveId) {
			console.log('👆 User clicked in iframe -> select in tree:', hiveId);
			selectedHiveId = hiveId;
			// Force re-render
			layerTree = layerTree;
		}
	}
</script>

<div
	bind:this={panelElement}
	class="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-2xl z-[60] min-w-80 max-w-96 max-h-[70vh] flex flex-col"
	class:hidden={!$layersPanelOpen}
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
		<div class="flex items-center gap-1">
			<Button
				variant="ghost"
				size="sm"
				class="h-6 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800"
				onclick={(e) => {
					e.stopPropagation();
					refreshTree();
				}}
			>
				🔄
			</Button>
			<Button
				variant="ghost"
				size="sm"
				class="w-6 h-6 p-0 text-gray-400 hover:text-white"
				onclick={closePanel}
			>
				<X class="w-4 h-4" />
			</Button>
		</div>
	</div>

	<!-- Tree Content -->
	<div class="flex-1 overflow-y-auto p-2">
		{#if layerTree.length === 0}
			<div class="text-center py-8 text-sm text-gray-400">
				No layers found
			</div>
		{:else}
			{#each layerTree as node (node.hiveId)}
				{@render LayerNode({ node, level: 0, selectedHiveId })}
			{/each}
		{/if}
	</div>
</div>

<!-- Layer Node Component -->
{#snippet LayerNode({ node, level, selectedHiveId })}
	<div class="select-none">
		<!-- Node Row -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="flex items-center gap-1 py-1 px-2 rounded hover:bg-gray-800/50 cursor-pointer group"
			class:selected={selectedHiveId === node.hiveId}
			style="margin-left: {level * 16}px"
			onclick={() => clickElement(node.hiveId)}
		>
			<!-- Expand/Collapse Button -->
			{#if node.children.length > 0}
				<button
					class="w-4 h-4 text-gray-400 hover:text-white"
					onclick={(e) => {
						e.stopPropagation();
						toggleExpansion(node);
					}}
				>
					{#if node.isExpanded}
						<ChevronDown class="w-3 h-3" />
					{:else}
						<ChevronRight class="w-3 h-3" />
					{/if}
				</button>
			{:else}
				<div class="w-4 h-4"></div>
			{/if}

			<!-- Element Info -->
			<span class="text-sm text-white truncate flex-1">
				{getDisplayName(node)}
			</span>

			<!-- Delete Button (show on hover, hide for body) -->
			{#if node.tag !== 'body'}
				<button
					class="w-5 h-5 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
					onclick={(e) => deleteElement(node.hiveId, e)}
					title="Delete Element"
				>
					<Trash2 class="w-3 h-3" />
				</button>
			{/if}
		</div>

		<!-- Children -->
		{#if node.isExpanded && node.children.length > 0}
			{#each node.children as childNode (childNode.hiveId)}
				{@render LayerNode({ node: childNode, level: level + 1, selectedHiveId })}
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
