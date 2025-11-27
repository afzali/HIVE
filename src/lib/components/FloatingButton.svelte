<script>
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import CustomSizeDialog from '$lib/components/CustomSizeDialog.svelte';
	import { currentMode, viewportSize, editToolbarOpen, layersPanelOpen, selectedElement, iframeDocument } from '$lib/stores.js';
	import { VIEWPORT_PRESETS } from '$lib/types.js';
	import { history } from '$lib/history.js';
	import { syncHTMLSource } from '$lib/html-sync.js';
	import { 
		Play, 
		Pause, 
		Eye, 
		Layers, 
		FolderOpen, 
		Code, 
		Monitor, 
		Tablet, 
		Smartphone, 
		Settings, 
		Save, 
		X,
		MoreHorizontal,
		Undo,
		Redo
	} from 'lucide-svelte';

	/**
	 * @type {function(string): void} onModeChange - Callback when mode changes
	 */
	export let onModeChange = () => {};

	/**
	 * @type {function(import('$lib/types.js').ViewportSize): void} onResponsiveModeChange
	 */
	export let onResponsiveModeChange = () => {};

	/** @type {boolean} */
	let isOpen = false;

	/** @type {boolean} */
	let assetsPanelOpen = false;

	/** @type {boolean} */
	let customSizeDialogOpen = false;

	/**
	 * Handle mode selection
	 * @param {string} mode
	 */
	function handleModeChange(mode) {
		console.log('FloatingButton: handleModeChange called with:', mode);
		console.log('FloatingButton: Setting currentMode to:', mode);
		currentMode.set(mode);
		console.log('FloatingButton: currentMode set, calling onModeChange');
		onModeChange(mode);
		isOpen = false;
	}

	/**
	 * Handle responsive mode selection
	 * @param {import('$lib/types.js').ViewportPreset} preset
	 */
	function handleResponsiveChange(preset) {
		if (preset === 'custom') {
			// Open custom size dialog
			customSizeDialogOpen = true;
			return;
		}
		
		const size = {
			preset,
			width: VIEWPORT_PRESETS[preset].width,
			height: VIEWPORT_PRESETS[preset].height
		};
		viewportSize.set(size);
		onResponsiveModeChange(size);
	}

	/**
	 * Toggle inspect mode - switches between preview and edit mode
	 */
	function toggleInspect() {
		if ($currentMode === 'edit') {
			// Pause: go to preview mode but keep toolbar visible
			currentMode.set('preview');
		} else {
			// Resume: go back to edit mode
			currentMode.set('edit');
		}
	}
	
	/**
	 * Enter edit mode and show toolbar
	 */
	function enterEditMode() {
		currentMode.set('edit');
		editToolbarOpen.set(true);
	}



	/**
	 * Toggle assets panel
	 */
	function toggleAssetsPanel() {
		assetsPanelOpen = !assetsPanelOpen;
		// TODO: Implement assets panel logic
	}

	/**
	 * Save current work - download HTML file (clean without hive-ids)
	 */
	function handleSave() {
		// First sync to make sure we have latest HTML
		syncHTMLSource();
		
		// Get HTML from iframe
		const iframe = document.querySelector('iframe');
		if (!iframe || !iframe.contentDocument) return;
		
		// Clone the document to avoid modifying the original
		const clonedDoc = iframe.contentDocument.cloneNode(true);
		
		// Remove all editor-related attributes and classes
		const elementsWithHiveId = clonedDoc.querySelectorAll('[data-hive-id]');
		elementsWithHiveId.forEach(element => {
			element.removeAttribute('data-hive-id');
		});

		// Remove all hive-related classes
		const allElements = clonedDoc.querySelectorAll('*');
		allElements.forEach(element => {
			// Remove classes that start with 'hive-'
			const classList = Array.from(element.classList);
			classList.forEach(className => {
				if (className.startsWith('hive-')) {
					element.classList.remove(className);
				}
			});
		});
		
		const html = clonedDoc.documentElement.outerHTML;
		const blob = new Blob([html], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		
		const a = document.createElement('a');
		a.href = url;
		a.download = 'edited-page.html';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		
		console.log('💾 Clean HTML downloaded (without hive-ids)');
	}

	/**
	 * Toggle layers panel
	 */
	function toggleLayersPanel() {
		layersPanelOpen.update(open => !open);
	}

	/**
	 * Undo last change
	 */
	function undoChange() {
		const previousHTML = history.undo();
		if (previousHTML) {
			// Clear selection first to remove highlights
			selectedElement.set(null);
			
			// Update iframe with previous HTML
			const iframe = document.querySelector('iframe');
			if (iframe && iframe.contentDocument) {
				// Extract just the HTML content without DOCTYPE
				const htmlContent = previousHTML.replace(/<!DOCTYPE html>\s*/i, '');
				
				// Replace the entire document content
				iframe.contentDocument.open();
				iframe.contentDocument.write(htmlContent);
				iframe.contentDocument.close();
				
				// Update iframeDocument store and trigger overlay re-setup
				setTimeout(() => {
					iframeDocument.set(iframe.contentDocument);
					// Dispatch iframe-ready event to re-setup overlay
					iframe.dispatchEvent(new CustomEvent('iframe-ready'));
				}, 100);
			}
			console.log('↶ Undid change');
		}
	}

	/**
	 * Redo last undone change
	 */
	function redoChange() {
		const nextHTML = history.redo();
		if (nextHTML) {
			// Clear selection first to remove highlights
			selectedElement.set(null);
			
			// Update iframe with next HTML
			const iframe = document.querySelector('iframe');
			if (iframe && iframe.contentDocument) {
				// Extract just the HTML content without DOCTYPE
				const htmlContent = nextHTML.replace(/<!DOCTYPE html>\s*/i, '');
				
				// Replace the entire document content
				iframe.contentDocument.open();
				iframe.contentDocument.write(htmlContent);
				iframe.contentDocument.close();
				
				// Update iframeDocument store and trigger overlay re-setup
				setTimeout(() => {
					iframeDocument.set(iframe.contentDocument);
					// Dispatch iframe-ready event to re-setup overlay
					iframe.dispatchEvent(new CustomEvent('iframe-ready'));
				}, 100);
			}
			console.log('↷ Redid change');
		}
	}

	/**
	 * Exit edit mode - close toolbar completely
	 */
	function exitEditMode() {
		// Close toolbar and go to preview mode
		editToolbarOpen.set(false);
		currentMode.set('preview');
	}

	/**
	 * Handle custom size change from dialog
	 * @param {import('$lib/types.js').ViewportSize} size
	 */
	function handleCustomSizeChange(size) {
		onResponsiveModeChange(size);
	}
</script>

{#if $editToolbarOpen}
	<!-- Edit Mode Dock -->
	<div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
		<div class="flex items-center gap-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-4 py-3 shadow-2xl">
			<!-- Resume/Pause Inspect -->
			<Button
				variant="ghost"
				size="sm"
				class="w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
				onclick={toggleInspect}
				title={$currentMode === 'preview' ? 'Resume Inspect' : 'Pause Inspect'}
			>
				{#if $currentMode === 'preview'}
					<Play class="w-5 h-5" />
				{:else}
					<Pause class="w-5 h-5" />
				{/if}
			</Button>



			<!-- Show Assets Panel -->
			<Button
				variant="ghost"
				size="sm"
				class="w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors {assetsPanelOpen ? 'bg-gray-700/70 text-white' : ''}"
				onclick={toggleAssetsPanel}
				title="Toggle Assets Panel"
			>
				<FolderOpen class="w-5 h-5" />
			</Button>

			<!-- Show Code Editor -->
			<Button
				variant="ghost"
				size="sm"
				class="w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
				onclick={() => handleModeChange('code')}
				title="Open Code Editor"
			>
				<Code class="w-5 h-5" />
			</Button>

			<!-- Separator -->
			<div class="w-px h-6 bg-gray-600 mx-1"></div>

			<!-- Responsive Mode Selector -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="inline-flex items-center justify-center w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
					title="Select Responsive Mode"
				>
					{#if $viewportSize.preset === 'desktop'}
						<Monitor class="w-5 h-5" />
					{:else if $viewportSize.preset === 'tablet'}
						<Tablet class="w-5 h-5" />
					{:else if $viewportSize.preset === 'mobile'}
						<Smartphone class="w-5 h-5" />
					{:else}
						<Settings class="w-5 h-5" />
					{/if}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-48 mb-2">
					<DropdownMenu.Group>
						<DropdownMenu.Label>Viewport Size</DropdownMenu.Label>
						<DropdownMenu.Separator />

						<DropdownMenu.Item onclick={() => handleResponsiveChange('desktop')}>
							<Monitor class="w-4 h-4 mr-2" />
							Desktop (1920x1080)
							{#if $viewportSize.preset === 'desktop'}
								<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							{/if}
						</DropdownMenu.Item>

						<DropdownMenu.Item onclick={() => handleResponsiveChange('tablet')}>
							<Tablet class="w-4 h-4 mr-2" />
							Tablet (768x1024)
							{#if $viewportSize.preset === 'tablet'}
								<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							{/if}
						</DropdownMenu.Item>

						<DropdownMenu.Item onclick={() => handleResponsiveChange('mobile')}>
							<Smartphone class="w-4 h-4 mr-2" />
							Mobile (375x667)
							{#if $viewportSize.preset === 'mobile'}
								<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							{/if}
						</DropdownMenu.Item>

						<DropdownMenu.Separator />

						<DropdownMenu.Item onclick={() => handleResponsiveChange('custom')}>
							<Settings class="w-4 h-4 mr-2" />
							Custom Size...
							{#if $viewportSize.preset === 'custom'}
								<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							{/if}
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<!-- Separator -->
			<div class="w-px h-6 bg-gray-600 mx-1"></div>

			<!-- Separator -->
			<div class="w-px h-6 bg-gray-600 mx-1"></div>

			<!-- Layers Panel -->
			<Button
				variant="ghost"
				size="sm"
				class={`w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors ${$layersPanelOpen ? 'bg-gray-700/70 text-white' : ''}`}
				onclick={toggleLayersPanel}
				title="Toggle Layers Panel"
			>
				<Layers class="w-5 h-5" />
			</Button>

			<!-- Separator -->
			<div class="w-px h-6 bg-gray-600 mx-1"></div>

			<!-- Undo -->
			<Button
				variant="ghost"
				size="sm"
				class={`w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors ${!$history.canUndo ? 'opacity-50' : ''}`}
				disabled={!$history.canUndo}
				onclick={undoChange}
				title="Undo"
			>
				<Undo class="w-5 h-5" />
			</Button>

			<!-- Redo -->
			<Button
				variant="ghost"
				size="sm"
				class={`w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors ${!$history.canRedo ? 'opacity-50' : ''}`}
				disabled={!$history.canRedo}
				onclick={redoChange}
				title="Redo"
			>
				<Redo class="w-5 h-5" />
			</Button>

			<!-- Separator -->
			<div class="w-px h-6 bg-gray-600 mx-1"></div>

			<!-- Save -->
			<Button
				variant="ghost"
				size="sm"
				class="w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
				onclick={handleSave}
				title="Save"
			>
				<Save class="w-5 h-5" />
			</Button>

			<!-- Close Edit Mode -->
			<Button
				variant="ghost"
				size="sm"
				class="w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
				onclick={exitEditMode}
				title="Exit Edit Mode"
			>
				<X class="w-5 h-5" />
			</Button>
		</div>
	</div>
{:else}
	<!-- Simple Mode Button -->
	<div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
		<Button
			class="inline-flex items-center justify-center rounded-full w-16 h-16 bg-primary text-primary-foreground shadow-2xl hover:scale-110 transition-transform cursor-pointer hover:bg-primary/90"
			onclick={enterEditMode}
			title="Enter Edit Mode"
		>
			<Eye class="w-8 h-8" />
		</Button>
	</div>
{/if}



<!-- Custom Size Dialog -->
<CustomSizeDialog 
	bind:isOpen={customSizeDialogOpen}
	onSizeChange={handleCustomSizeChange}
/>
