<script>
	import * as Tabs from '$lib/components/ui/tabs';
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
</script>

<Tabs.Content value="design" class="flex-1 overflow-y-auto mt-4 space-y-6">
	<DimensionsSection {onPropertyChange} />
	<SpacingSection {onPropertyChange} />
	<TypographySection {onPropertyChange} />
	<BackgroundSection {onPropertyChange} />
	<BorderSection {onPropertyChange} />
	<LayoutSection bind:this={layoutSection} bind:display {onPropertyChange} />
	<FlexboxSection {display} {onPropertyChange} />
	<EffectsSection {onPropertyChange} />
	<AttributesSection {onPropertyChange} />
</Tabs.Content>