<script>
	import Canvas from '$lib/components/Canvas.svelte';
	import FloatingButton from '$lib/components/FloatingButton.svelte';
	import PropertyPanel from '$lib/components/PropertyPanel.svelte';
	import { htmlSource, currentMode, viewportSize, iframeDocument, selectedElement } from '$lib/stores.js';
	import { history } from '$lib/history.js';

	/**
	 * Handle iframe load
	 * @param {Document} doc
	 */
	function handleCanvasLoad(doc) {
		console.log('Canvas loaded successfully');
		// Initialize history with current HTML
		history.push($htmlSource);
	}

	/**
	 * Handle mode change
	 * @param {string} mode
	 */
	function handleModeChange(mode) {
		console.log('Mode changed to:', mode);
		// Clear selection when leaving edit mode
		if (mode !== 'edit') {
			selectedElement.set(null);
		}
	}

	/**
	 * Handle responsive mode change
	 * @param {import('$lib/types.js').ViewportSize} size
	 */
	function handleResponsiveModeChange(size) {
		console.log('Viewport changed to:', size);
	}

	/**
	 * Handle element selection
	 * @param {HTMLElement} element
	 */
	function handleElementSelect(element) {
		console.log('Element selected:', element.tagName, element.className);
	}

	/**
	 * Handle property change
	 * @param {string} property
	 * @param {any} value
	 */
	function handlePropertyChange(property, value) {
		console.log('Property changed:', property, value);
		// TODO: Add to history for undo/redo
	}
</script>

<svelte:head>
	<title>HTML Visual Editor</title>
</svelte:head>

<main class="w-screen h-screen overflow-hidden bg-gray-900 relative">
	<!-- Canvas Area -->
	<div class="absolute inset-0 {$currentMode === 'edit' && $selectedElement ? 'right-80' : ''}">
		<Canvas 
			htmlSource={$htmlSource} 
			viewportSize={$viewportSize} 
			onLoad={handleCanvasLoad}
			onElementSelect={handleElementSelect}
		/>
	</div>
	
	<!-- Property Panel -->
	{#if $currentMode === 'edit'}
		<PropertyPanel onPropertyChange={handlePropertyChange} />
	{/if}
	
	<!-- Floating Button -->
	<FloatingButton 
		onModeChange={handleModeChange} 
		onResponsiveModeChange={handleResponsiveModeChange} 
	/>
</main>
