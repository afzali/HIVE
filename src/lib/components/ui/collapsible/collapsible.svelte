<script>
	import { Collapsible as CollapsiblePrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		open = $bindable(false),
		class: className,
		...restProps
	} = $props();
</script>

<CollapsiblePrimitive.Root
	bind:ref
	bind:open
	data-slot="collapsible"
	class={cn("", className)}
	{...restProps}
/>