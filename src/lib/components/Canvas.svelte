<script>
	import { onMount } from 'svelte';
	import { iframeDocument } from '$lib/stores.js';
	import { addHiveIds } from '$lib/element-id.js';

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

	/** @type {HTMLIFrameElement} */
	let iframeElement;

	/** @type {boolean} */
	let isReady = false;

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
			
			iframeDocument.set(doc);
			isReady = true;
			onLoad(doc);
		} catch (error) {
			console.error('Error accessing iframe document:', error);
		}
	}

	/**
	 * Update iframe content when htmlSource changes
	 */
	$: if (iframeElement && htmlSource) {
		try {
			// Use srcdoc for same-origin access
			iframeElement.srcdoc = htmlSource;
		} catch (error) {
			console.error('Error updating iframe content:', error);
		}
	}
</script>

<div class="canvas-container relative w-full h-full flex items-center justify-center bg-gray-100">
	<div
		class="canvas-wrapper relative transition-all duration-300 ease-in-out shadow-2xl"
		style="width: {viewportSize.width}px; height: {viewportSize.height}px;"
	>
		<iframe
			bind:this={iframeElement}
			on:load={handleIframeLoad}
			title="HTML Canvas"
			class="w-full h-full bg-white border-0"
			sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
		></iframe>
		
		<!-- Slot for overlay -->
		<slot></slot>
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

<style>
	.canvas-container {
		overflow: auto;
	}

	.canvas-wrapper {
		min-width: 320px;
		min-height: 240px;
	}
</style>
