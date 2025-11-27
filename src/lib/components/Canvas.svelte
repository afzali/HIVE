<script>
	import { onMount } from 'svelte';
	import { iframeDocument, currentMode } from '$lib/stores.js';
	import { addHiveIds } from '$lib/element-id.js';
	import { overlayAction } from '$lib/overlay-action.js';

	/**
	 * @type {string} htmlSource - HTML content to render
	 */
	export let htmlSource = '';

	/**
	 * @type {import('$lib/types.js').ViewportSize} viewportSize - Viewport dimensions
	 */
	export let viewportSize = { preset: 'desktop', width: 1920, height: 1080 };

	/**
	 * @type {function(Document): void} onLoad - Callback when iframe loads
	 */
	export let onLoad = () => {};
	
	/**
	 * @type {function(HTMLElement): void} onElementSelect - Callback when element is selected
	 */
	export let onElementSelect = () => {};

	/**
	 * @type {function(Object): void} onContextMenu - Callback when context menu is requested
	 */
	export let onContextMenu = () => {};

	/**
	 * @type {function(): void} onCloseContextMenu - Callback when context menu should close
	 */
	export let onCloseContextMenu = () => {};

	/**
	 * Force reload iframe with new HTML (used when coming from Code Editor)
	 * @param {string} newHtml
	 */
	export function reloadWithHTML(newHtml) {
		if (iframeElement) {
			isReady = false;
			iframeElement.srcdoc = newHtml;
		}
	}

	/** @type {HTMLIFrameElement} */
	let iframeElement;

	/** @type {boolean} */
	let isReady = false;

	/**
	 * Handle context menu event from iframe
	 * @param {CustomEvent} event
	 */
	function handleContextMenuEvent(event) {
		onContextMenu(event.detail);
	}

	/**
	 * Handle close context menu event from iframe
	 */
	function handleCloseContextMenuEvent() {
		onCloseContextMenu();
	}

	/**
	 * Handle iframe load event
	 */
	function handleIframeLoad() {
		if (!iframeElement || !iframeElement.contentDocument) {
			console.error('iframe contentDocument not available');
			return;
		}

		try {
			const doc = iframeElement.contentDocument;
			
			// Add hive IDs to all elements for tracking
			addHiveIds(doc);
			
			// Inject overlay styles into iframe
			const style = doc.createElement('style');
			style.textContent = `
				* {
					scroll-behavior: smooth !important;
				}
				.hive-overlay {
					position: absolute;
					top: 0;
					left: 0;
					width: 0;
					height: 0;
					z-index: 999999;
					pointer-events: none;
				}
				.hive-hover {
					position: fixed;
					top: 0;
					left: 0;
					border: 2px dashed #4ade80;
					pointer-events: none;
					transition: transform 50ms ease-out, width 50ms, height 50ms;
					box-sizing: border-box;
					background: rgba(74, 222, 128, 0.05);
					z-index: 999998;
					will-change: transform;
				}
				.hive-highlight {
					position: fixed;
					top: 0;
					left: 0;
					border: 2px solid #3b82f6;
					pointer-events: none;
					transition: transform 50ms ease-out, width 50ms, height 50ms;
					box-sizing: border-box;
					background: rgba(59, 130, 246, 0.1);
					z-index: 999999;
					will-change: transform;
				}
				.hive-label {
					position: fixed;
					top: 0;
					left: 0;
					background: #3b82f6;
					color: white;
					font-size: 10px;
					padding: 2px 8px;
					border-radius: 4px;
					display: flex;
					align-items: center;
					gap: 4px;
					pointer-events: auto;
					font-family: monospace;
					z-index: 1000000;
					will-change: transform;
				}
				.hive-label button {
					padding: 0 4px;
					border-radius: 2px;
					font-size: 14px;
					line-height: 1;
					background: transparent;
					border: none;
					color: white;
					cursor: pointer;
				}
				.hive-label button:hover {
					background: #2563eb;
				}
			`;
			doc.head.appendChild(style);
			
			iframeDocument.set(doc);
			isReady = true;
			onLoad(doc);
			
			// Trigger overlay setup after iframe is fully loaded
			// This dispatches a custom event that the action can listen to
			iframeElement.dispatchEvent(new CustomEvent('iframe-ready'));
		} catch (error) {
			console.error('Error accessing iframe document:', error);
		}
	}

	/**
	 * Initialize iframe with HTML on mount
	 */
	onMount(() => {
		if (iframeElement && htmlSource) {
			try {
				iframeElement.srcdoc = htmlSource;
			} catch (error) {
				console.error('Error initializing iframe content:', error);
			}
		}
	});
</script>

<div class="canvas-container relative w-full h-full bg-gray-100 flex items-center justify-center">
	<div
		class="canvas-wrapper relative transition-all duration-300 ease-in-out shadow-2xl"
		style="width: 100%; height: 100%; max-width: {viewportSize.width}px; max-height: {viewportSize.height}px;"
	>
		<iframe
			bind:this={iframeElement}
			srcdoc={htmlSource}
			on:load={handleIframeLoad}
			on:show-context-menu={handleContextMenuEvent}
			on:close-context-menu={handleCloseContextMenuEvent}
			use:overlayAction={{ onElementSelect }}
			title="HTML Canvas"
			class="w-full h-full bg-white border-0"
			sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
		></iframe>
	</div>

	{#if !isReady}
		<div class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p class="text-gray-600">Loading canvas...</p>
			</div>
		</div>
	{/if}
</div>

<!-- Slot for overlay - outside iframe wrapper so it doesn't block scrolling -->
<slot></slot>

<style>
	.canvas-container {
		/* Smooth scrolling */
		-webkit-overflow-scrolling: touch;
		scroll-behavior: smooth;
	}

	.canvas-wrapper {
		min-width: 320px;
		min-height: 240px;
	}
</style>
