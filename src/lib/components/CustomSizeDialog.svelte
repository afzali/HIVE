<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { viewportSize } from '$lib/stores.js';
	import { X } from 'lucide-svelte';

	/**
	 * @type {function(import('$lib/types.js').ViewportSize): void} onSizeChange
	 */
	export let onSizeChange = () => {};

	/** @type {boolean} */
	export let isOpen = false;

	/** @type {number} */
	let customWidth = $viewportSize.width;

	/** @type {number} */
	let customHeight = $viewportSize.height;

	/**
	 * Apply custom size
	 */
	function applyCustomSize() {
		const size = {
			preset: 'custom',
			width: customWidth,
			height: customHeight
		};
		
		viewportSize.set(size);
		onSizeChange(size);
		isOpen = false;
	}

	/**
	 * Cancel dialog
	 */
	function cancel() {
		// Reset to current values
		customWidth = $viewportSize.width;
		customHeight = $viewportSize.height;
		isOpen = false;
	}

	// Update local values when viewport size changes
	$: if ($viewportSize.preset === 'custom') {
		customWidth = $viewportSize.width;
		customHeight = $viewportSize.height;
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
		onclick={cancel}
	></div>

	<!-- Dialog -->
	<div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[71] bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl p-6 w-[420px]">
		<!-- Header -->
		<div class="flex items-center justify-between mb-6">
			<h3 class="text-lg font-semibold text-white">Custom Viewport Size</h3>
			<Button
				variant="ghost"
				size="sm"
				class="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
				onclick={cancel}
			>
				<X class="w-4 h-4" />
			</Button>
		</div>

		<!-- Form -->
		<div class="space-y-5">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="custom-width" class="text-sm font-medium text-gray-300">Width (px)</Label>
					<Input
						id="custom-width"
						type="number"
						bind:value={customWidth}
						min="200"
						max="4000"
						class="bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
						placeholder="800"
					/>
				</div>
				<div class="space-y-2">
					<Label for="custom-height" class="text-sm font-medium text-gray-300">Height (px)</Label>
					<Input
						id="custom-height"
						type="number"
						bind:value={customHeight}
						min="200"
						max="3000"
						class="bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
						placeholder="600"
					/>
				</div>
			</div>

			<!-- Common Presets -->
			<div class="space-y-3">
				<Label class="text-sm font-medium text-gray-300">Quick Presets</Label>
				<div class="grid grid-cols-2 gap-2">
					<button
						type="button"
						class="px-3 py-2 text-xs bg-gray-800 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-colors"
						onclick={() => {
							customWidth = 1366;
							customHeight = 768;
						}}
					>
						1366×768
					</button>
					<button
						type="button"
						class="px-3 py-2 text-xs bg-gray-800 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-colors"
						onclick={() => {
							customWidth = 1440;
							customHeight = 900;
						}}
					>
						1440×900
					</button>
					<button
						type="button"
						class="px-3 py-2 text-xs bg-gray-800 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-colors"
						onclick={() => {
							customWidth = 1024;
							customHeight = 768;
						}}
					>
						1024×768
					</button>
					<button
						type="button"
						class="px-3 py-2 text-xs bg-gray-800 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-colors"
						onclick={() => {
							customWidth = 414;
							customHeight = 896;
						}}
					>
						iPhone 11
					</button>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-700/50">
				<Button
					variant="outline"
					size="sm"
					class="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
					onclick={cancel}
				>
					Cancel
				</Button>
				<Button
					size="sm"
					class="bg-blue-600 hover:bg-blue-700 text-white px-6"
					onclick={applyCustomSize}
				>
					Apply
				</Button>
			</div>
		</div>
	</div>
{/if}