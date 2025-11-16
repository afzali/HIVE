<script>
	import { duplicateElement, insertElement, isValidElement } from '$lib/dom-utils.js';
	import { selectedElement } from '$lib/stores.js';
	import { syncHTMLSource } from '$lib/html-sync.js';
	import { addHiveIds } from '$lib/element-id.js';

	/**
	 * @type {import('$lib/types.js').ContextMenuPosition} position
	 */
	export let position = { x: 0, y: 0 };

	/**
	 * @type {function(): void} onDuplicate
	 */
	export let onDuplicate = () => {};

	/**
	 * @type {function(): void} onDelete
	 */
	export let onDelete = () => {};

	/**
	 * @type {function(string): void} onAdd
	 */
	export let onAdd = () => {};

	/**
	 * @type {function(string): void} onMove
	 */
	export let onMove = () => {};

	/** @type {boolean} */
	let showAddMenu = false;

	/** @type {boolean} */
	let showMoveMenu = false;

	const elementTypes = [
		{ value: 'div', label: 'Div' },
		{ value: 'section', label: 'Section' },
		{ value: 'button', label: 'Button' },
		{ value: 'a', label: 'Link' },
		{ value: 'p', label: 'Paragraph' },
		{ value: 'h1', label: 'Heading 1' },
		{ value: 'h2', label: 'Heading 2' },
		{ value: 'h3', label: 'Heading 3' },
		{ value: 'span', label: 'Span' },
		{ value: 'img', label: 'Image' }
	];

	/**
	 * Handle duplicate
	 */
	function handleDuplicate() {
		if (!$selectedElement) return;

		const cloned = duplicateElement($selectedElement);
		if (cloned) {
			// Add hive IDs to the cloned element and its children
			const doc = $selectedElement.ownerDocument;
			addHiveIds(doc);
			
			// Small delay to ensure DOM is updated and highlight can be calculated
			setTimeout(() => {
				// Select the newly created element
				selectedElement.set(cloned);
			}, 50);
			
			// Sync HTML
			syncHTMLSource();
			
			onDuplicate();
		}
	}

	/**
	 * Handle delete
	 */
	function handleDelete() {
		if (!$selectedElement) return;

		// Validate element can be deleted
		if (!isValidElement($selectedElement)) {
			console.error('Cannot delete html or body element');
			// TODO: Show error toast when toast system is implemented
			return;
		}

		try {
			const parent = $selectedElement.parentElement;
			if (parent) {
				parent.removeChild($selectedElement);
				
				// Clear selection
				selectedElement.set(null);
				
				// Sync HTML
				syncHTMLSource();
				
				onDelete();
			}
		} catch (error) {
			console.error('Error deleting element:', error);
		}
	}

	/**
	 * Handle add element
	 * @param {string} type
	 * @param {string} position
	 */
	function handleAdd(type, position) {
		onAdd({ type, position });
		showAddMenu = false;
	}

	/**
	 * Handle move
	 * @param {string} direction
	 */
	function handleMove(direction) {
		onMove(direction);
		showMoveMenu = false;
	}
</script>

<div
	class="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-48"
	style="left: {position.x}px; top: {position.y}px;"
>
	<!-- Duplicate -->
	<button
		on:click={handleDuplicate}
		class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
			></path>
		</svg>
		Duplicate
	</button>

	<!-- Delete -->
	<button
		on:click={handleDelete}
		class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
			></path>
		</svg>
		Delete
	</button>

	<div class="border-t border-gray-200 my-1"></div>

	<!-- Add -->
	<div class="relative">
		<button
			on:click={() => (showAddMenu = !showAddMenu)}
			class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
		>
			<span class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					></path>
				</svg>
				Add Element
			</span>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
			</svg>
		</button>

		{#if showAddMenu}
			<div class="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-48">
				<div class="px-3 py-1 text-xs font-semibold text-gray-500">Add Child</div>
				{#each elementTypes as type}
					<button
						on:click={() => handleAdd(type.value, 'child')}
						class="w-full px-4 py-1.5 text-left text-sm hover:bg-gray-100"
					>
						{type.label}
					</button>
				{/each}
				
				<div class="border-t border-gray-200 my-1"></div>
				<div class="px-3 py-1 text-xs font-semibold text-gray-500">Add Before</div>
				{#each elementTypes.slice(0, 3) as type}
					<button
						on:click={() => handleAdd(type.value, 'before')}
						class="w-full px-4 py-1.5 text-left text-sm hover:bg-gray-100"
					>
						{type.label}
					</button>
				{/each}
				
				<div class="border-t border-gray-200 my-1"></div>
				<div class="px-3 py-1 text-xs font-semibold text-gray-500">Add After</div>
				{#each elementTypes.slice(0, 3) as type}
					<button
						on:click={() => handleAdd(type.value, 'after')}
						class="w-full px-4 py-1.5 text-left text-sm hover:bg-gray-100"
					>
						{type.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Move -->
	<div class="relative">
		<button
			on:click={() => (showMoveMenu = !showMoveMenu)}
			class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
		>
			<span class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
					></path>
				</svg>
				Move
			</span>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
			</svg>
		</button>

		{#if showMoveMenu}
			<div class="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-32">
				<button
					on:click={() => handleMove('up')}
					class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
				>
					Move Up
				</button>
				<button
					on:click={() => handleMove('down')}
					class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
				>
					Move Down
				</button>
			</div>
		{/if}
	</div>
</div>

<!-- Click outside to close submenus -->
<svelte:window
	on:click={() => {
		showAddMenu = false;
		showMoveMenu = false;
	}}
/>
