<script>
	import { selectedElement } from '$lib/stores.js';
	import { getHiveId } from '$lib/element-id.js';
	import ContextMenu from './ContextMenu.svelte';

	/**
	 * @type {Document|null} iframeDocument - Reference to iframe document
	 */
	export let iframeDocument = null;

	/**
	 * @type {function(HTMLElement): void} onElementSelect - Callback when element is selected
	 */
	export let onElementSelect = () => {};

	/**
	 * @type {function(): void} onElementAction - Callback when element action performed
	 */
	export let onElementAction = () => {};

	/** @type {import('$lib/types.js').HighlightBox|null} */
	let highlightBox = null;

	/** @type {import('$lib/types.js').HighlightBox|null} */
	let hoverBox = null;

	/** @type {HTMLElement|null} */
	let hoveredElement = null;

	/** @type {HTMLIFrameElement|null} */
	let iframeElement = null;

	/** @type {boolean} */
	let showContextMenu = false;

	/** @type {import('$lib/types.js').ContextMenuPosition} */
	let contextMenuPosition = { x: 0, y: 0 };

	/**
	 * Calculate highlight box for an element
	 * @param {HTMLElement} element
	 * @returns {import('$lib/types.js').HighlightBox|null}
	 */
	function calculateHighlightBox(element) {
		if (!element || !iframeElement) return null;

		try {
			const rect = element.getBoundingClientRect();
			const iframeRect = iframeElement.getBoundingClientRect();

			// Calculate position relative to the overlay (which is positioned relative to iframe)
			// The overlay div is absolutely positioned at top:0, left:0 of the iframe container
			return {
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height
			};
		} catch (error) {
			console.error('Error calculating highlight box:', error);
			return null;
		}
	}

	/**
	 * Handle click on overlay
	 * @param {MouseEvent} event
	 */
	function handleClick(event) {
		if (!iframeDocument) return;

		event.preventDefault();
		event.stopPropagation();

		// Get element at click position in iframe
		const x = event.clientX;
		const y = event.clientY;

		try {
			// Get iframe position
			if (!iframeElement) {
				iframeElement = document.querySelector('iframe');
			}

			if (!iframeElement) return;

			const iframeRect = iframeElement.getBoundingClientRect();
			const relativeX = x - iframeRect.left;
			const relativeY = y - iframeRect.top;

			// Get element from iframe document
			const element = iframeDocument.elementFromPoint(relativeX, relativeY);

			if (element && element.tagName !== 'HTML' && element.tagName !== 'BODY') {
				selectedElement.set(element);
				onElementSelect(element);
				highlightBox = calculateHighlightBox(element);
			}
		} catch (error) {
			console.error('Error selecting element:', error);
		}
	}

	/**
	 * Handle right click for context menu
	 * @param {MouseEvent} event
	 */
	function handleContextMenu(event) {
		if (!$selectedElement) return;

		event.preventDefault();
		event.stopPropagation();

		contextMenuPosition = {
			x: event.clientX,
			y: event.clientY
		};
		showContextMenu = true;
	}

	/**
	 * Handle mouse move for hover effect
	 * @param {MouseEvent} event
	 */
	function handleMouseMove(event) {
		if (!iframeDocument || !iframeElement) return;

		const iframeRect = iframeElement.getBoundingClientRect();
		const relativeX = event.clientX - iframeRect.left;
		const relativeY = event.clientY - iframeRect.top;

		try {
			const element = iframeDocument.elementFromPoint(relativeX, relativeY);

			if (element && element.tagName !== 'HTML' && element.tagName !== 'BODY') {
				// Always update hover if element changed
				if (element !== hoveredElement) {
					hoveredElement = element;
					
					// Don't show hover box if element is already selected
					if (element !== $selectedElement) {
						hoverBox = calculateHighlightBox(element);
						console.log('🟢 Hover box set:', hoverBox, 'for element:', element.tagName);
					} else {
						hoverBox = null;
						console.log('🔵 Hover cleared (element is selected)');
					}
				}
			} else if (hoverBox) {
				// Clear hover if no valid element
				hoverBox = null;
				hoveredElement = null;
			}
		} catch (error) {
			// Ignore errors during hover
		}
	}

	/**
	 * Handle mouse leave to clear hover
	 */
	function handleMouseLeave() {
		hoveredElement = null;
		hoverBox = null;
	}

	// Update highlight when selected element changes
	$: if ($selectedElement && iframeElement) {
		highlightBox = calculateHighlightBox($selectedElement);
	}

	// Find iframe element on mount
	$: if (iframeDocument && !iframeElement) {
		iframeElement = document.querySelector('iframe');
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="absolute top-0 left-0 w-full h-full z-40 cursor-crosshair pointer-events-auto"
	onclick={handleClick}
	oncontextmenu={handleContextMenu}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
>
	{#if hoverBox && hoveredElement !== $selectedElement}
		<!-- Hover highlight border (green, dashed, lighter) -->
		<div
			class="absolute border-2 border-dashed border-green-400 pointer-events-none transition-all duration-75 box-border"
			style="top: {hoverBox.top}px; left: {hoverBox.left}px; width: {hoverBox.width}px; height: {hoverBox.height}px; background-color: rgba(74, 222, 128, 0.05);"
		></div>
	{/if}

	{#if highlightBox}
		<!-- Selected element highlight border (blue, solid, brighter) -->
		<div
			class="absolute border-2 border-blue-500 pointer-events-none transition-all duration-100 box-border"
			style="top: {highlightBox.top}px; left: {highlightBox.left}px; width: {highlightBox.width}px; height: {highlightBox.height}px; background-color: rgba(59, 130, 246, 0.1);"
		></div>
		
		<!-- Label with hive-id and menu button -->
		<div 
			class="absolute bg-blue-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1 pointer-events-auto"
			style="left: {highlightBox.left}px; top: {highlightBox.top - 24}px;"
		>
			<span class="font-mono text-[10px]">{getHiveId($selectedElement)}</span>
			<button
				onclick={() => {
					showContextMenu = true;
					contextMenuPosition = {
						x: highlightBox.left + 100,
						y: highlightBox.top
					};
				}}
				class="hover:bg-blue-600 px-1 rounded text-sm leading-none"
			>
				⋮
			</button>
		</div>
	{/if}
</div>

{#if showContextMenu && $selectedElement}
	<ContextMenu
		position={contextMenuPosition}
		onDuplicate={() => {
			// TODO: implement
			showContextMenu = false;
			onElementAction();
		}}
		onDelete={() => {
			// TODO: implement
			showContextMenu = false;
			onElementAction();
		}}
		onAdd={() => {
			// TODO: implement
			showContextMenu = false;
			onElementAction();
		}}
		onMove={() => {
			// TODO: implement
			showContextMenu = false;
			onElementAction();
		}}
	/>
{/if}

<!-- Click outside to close context menu -->
<svelte:window onclick={() => (showContextMenu = false)} />
