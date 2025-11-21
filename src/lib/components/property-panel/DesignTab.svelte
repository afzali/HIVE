<script>
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown } from 'lucide-svelte';
	import DimensionsSection from './sections/DimensionsSection.svelte';
	import SpacingSection from './sections/SpacingSection.svelte';
	import TypographySection from './sections/TypographySection.svelte';
	import BackgroundSection from './sections/BackgroundSection.svelte';
	import BorderSection from './sections/BorderSection.svelte';
	import LayoutSection from './sections/LayoutSection.svelte';
	import FlexboxSection from './sections/FlexboxSection.svelte';
	import EffectsSection from './sections/EffectsSection.svelte';
	import AttributesSection from './sections/AttributesSection.svelte';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	let layoutSection;
	let display = '';

	// Accordion states
	let spacingOpen = true;
	let dimensionsOpen = true;
	let typographyOpen = false;
	let backgroundOpen = false;
	let borderOpen = false;
	let layoutOpen = false;
	let effectsOpen = false;
	let attributesOpen = false;
</script>

<Tabs.Content value="design" class="flex-1 overflow-y-auto mt-4 space-y-2">
	<!-- Attributes Section -->
	<Collapsible.Root bind:open={attributesOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Attributes</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {attributesOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<AttributesSection {onPropertyChange} />
		</Collapsible.Content>
	</Collapsible.Root>
	
	<!-- Spacing Section -->
	<Collapsible.Root bind:open={spacingOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Spacing</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {spacingOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<SpacingSection {onPropertyChange} />
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Dimensions Section -->
	<Collapsible.Root bind:open={dimensionsOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Dimensions</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {dimensionsOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<DimensionsSection {onPropertyChange} />
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Typography Section -->
	<Collapsible.Root bind:open={typographyOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Typography</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {typographyOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<TypographySection {onPropertyChange} />
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Background Section -->
	<Collapsible.Root bind:open={backgroundOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Background</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {backgroundOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<BackgroundSection {onPropertyChange} />
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Border Section -->
	<Collapsible.Root bind:open={borderOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Border</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {borderOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<BorderSection {onPropertyChange} />
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Layout Section -->
	<Collapsible.Root bind:open={layoutOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Layout</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {layoutOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<LayoutSection bind:this={layoutSection} bind:display {onPropertyChange} />
			{#if display === 'flex'}
				<div class="mt-4">
					<FlexboxSection {display} {onPropertyChange} />
				</div>
			{/if}
		</Collapsible.Content>
	</Collapsible.Root>

	<!-- Effects Section -->
	<Collapsible.Root bind:open={effectsOpen}>
		<Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
			<span>Effects</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {effectsOpen ? 'rotate-180' : ''}" />
		</Collapsible.Trigger>
		<Collapsible.Content class="px-3 py-2">
			<EffectsSection {onPropertyChange} />
		</Collapsible.Content>
	</Collapsible.Root>

	
</Tabs.Content>