<script>
	import * as Tabs from '$lib/components/ui/tabs';
	import { selectedElement } from '$lib/stores.js';
	import DesignTab from './DesignTab.svelte';
	import ComponentTab from './ComponentTab.svelte';
	import CodeTab from './CodeTab.svelte';
	import HTMLTab from './HTMLTab.svelte';
	import ChatTab from './ChatTab.svelte';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	/** @type {string} */
	let activeTab = 'design';
</script>

{#if $selectedElement}
	<div class="fixed right-0 top-0 h-full bg-background border-l border-border overflow-y-auto z-30 shadow-xl" style="width: 480px;">
		<div class="p-4 h-full flex flex-col">
			<!-- Header -->
			<div class="border-b border-border pb-4 mb-4">
				<h2 class="text-lg font-semibold">Properties</h2>
				<p class="text-sm text-muted-foreground mt-1">
					{$selectedElement.tagName.toLowerCase()}
				</p>
			</div>

			<!-- Tabbed Interface -->
			<Tabs.Root bind:value={activeTab} class="flex-1 flex flex-col">
				<Tabs.List class="grid w-full grid-cols-5">
					<Tabs.Trigger value="design">Design</Tabs.Trigger>
					<Tabs.Trigger value="component">Component</Tabs.Trigger>
					<Tabs.Trigger value="code">Code</Tabs.Trigger>
					<Tabs.Trigger value="html">HTML</Tabs.Trigger>
					<Tabs.Trigger value="chat">Chat</Tabs.Trigger>
				</Tabs.List>

				<DesignTab {onPropertyChange} />
				<ComponentTab {onPropertyChange} />
				<CodeTab {activeTab} {onPropertyChange} />
				<HTMLTab {activeTab} {onPropertyChange} />
				<ChatTab />
			</Tabs.Root>
		</div>
	</div>
{/if}