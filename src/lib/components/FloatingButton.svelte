<script>
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { currentMode, viewportSize } from '$lib/stores.js';
	import { VIEWPORT_PRESETS } from '$lib/types.js';

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
</script>

<div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
	<DropdownMenu.Root bind:open={isOpen}>
		<DropdownMenu.Trigger
			class="inline-flex items-center justify-center rounded-full w-16 h-16 bg-primary text-primary-foreground shadow-2xl hover:scale-110 transition-transform cursor-pointer hover:bg-primary/90"
		>
			{#if $currentMode === 'preview'}
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					></path>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					></path>
				</svg>
			{:else if $currentMode === 'edit'}
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					></path>
				</svg>
			{:else if $currentMode === 'code'}
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					></path>
				</svg>
			{:else}
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					></path>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					></path>
				</svg>
			{/if}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content class="w-56 mb-2">
			<DropdownMenu.Group>
				<DropdownMenu.Label>Editor Mode</DropdownMenu.Label>
				<DropdownMenu.Separator />

				<DropdownMenu.Item onclick={() => handleModeChange('preview')}>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						></path>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						></path>
					</svg>
					Preview
					{#if $currentMode === 'preview'}
						<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					{/if}
				</DropdownMenu.Item>

				<DropdownMenu.Item onclick={() => handleModeChange('edit')}>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						></path>
					</svg>
					Edit
					{#if $currentMode === 'edit'}
						<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					{/if}
				</DropdownMenu.Item>

				<DropdownMenu.Item onclick={() => handleModeChange('code')}>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
						></path>
					</svg>
					Code
					{#if $currentMode === 'code'}
						<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					{/if}
				</DropdownMenu.Item>
			</DropdownMenu.Group>

			<DropdownMenu.Separator />

			<DropdownMenu.Group>
				<DropdownMenu.Label>Viewport Size</DropdownMenu.Label>
				<DropdownMenu.Separator />

				<DropdownMenu.Item onclick={() => handleResponsiveChange('desktop')}>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						></path>
					</svg>
					Desktop (1920x1080)
					{#if $viewportSize.preset === 'desktop'}
						<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					{/if}
				</DropdownMenu.Item>

				<DropdownMenu.Item onclick={() => handleResponsiveChange('tablet')}>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						></path>
					</svg>
					Tablet (768x1024)
					{#if $viewportSize.preset === 'tablet'}
						<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					{/if}
				</DropdownMenu.Item>

				<DropdownMenu.Item onclick={() => handleResponsiveChange('mobile')}>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
						></path>
					</svg>
					Mobile (375x667)
					{#if $viewportSize.preset === 'mobile'}
						<svg class="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					{/if}
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
