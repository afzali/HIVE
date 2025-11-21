<script>
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { currentMode, viewportSize, layersPanelOpen } from '$lib/stores.js';
	import { VIEWPORT_PRESETS } from '$lib/types.js';
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
		MoreHorizontal
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
	let inspectPaused = false;

	/** @type {boolean} */
	let assetsPanelOpen = false;

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
		const size = {
			preset,
			width: VIEWPORT_PRESETS[preset].width,
			height: VIEWPORT_PRESETS[preset].height
		};
		viewportSize.set(size);
		onResponsiveModeChange(size);
	}

	/**
	 * Toggle inspect mode
	 */
	function toggleInspect() {
		inspectPaused = !inspectPaused;
		// TODO: Implement inspect pause/resume logic
	}

	/**
	 * Toggle layers panel
	 */
	function toggleLayersPanel() {
		layersPanelOpen.update(open => !open);
	}

	/**
	 * Toggle assets panel
	 */
	function toggleAssetsPanel() {
		assetsPanelOpen = !assetsPanelOpen;
		// TODO: Implement assets panel logic
	}

	/**
	 * Save current work
	 */
	function handleSave() {
		// TODO: Implement save functionality
		console.log('Save clicked');
	}

	/**
	 * Exit edit mode
	 */
	function exitEditMode() {
		handleModeChange('preview');
	}
</script>

{#if $currentMode === 'edit'}
	<!-- Edit Mode Dock -->
	<div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
		<div class="flex items-center gap-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-4 py-3 shadow-2xl">
			<!-- Resume/Pause Inspect -->
			<Button
				variant="ghost"
				size="sm"
				class="w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
				onclick={toggleInspect}
				title={inspectPaused ? 'Resume Inspect' : 'Pause Inspect'}
			>
				{#if inspectPaused}
					<Play class="w-5 h-5" />
				{:else}
					<Pause class="w-5 h-5" />
				{/if}
			</Button>

			<!-- Separator -->
			<div class="w-px h-6 bg-gray-600 mx-1"></div>

			<!-- Show Layers Panel -->
			<Button
				variant="ghost"
				size="sm"
				class="w-10 h-10 p-0 rounded-xl hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors {$layersPanelOpen ? 'bg-gray-700/70 text-white' : ''}"
				onclick={toggleLayersPanel}
				title="Toggle Layers Panel"
			>
				<Layers class="w-5 h-5" />
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
							Custom Size
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
			onclick={() => handleModeChange('edit')}
			title="Enter Edit Mode"
		>
			<Eye class="w-8 h-8" />
		</Button>
	</div>
{/if}


