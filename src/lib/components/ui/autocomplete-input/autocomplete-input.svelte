<script>
	import { Input } from '$lib/components/ui/input';
	import { cn } from "$lib/utils.js";

	let {
		value = $bindable(''),
		suggestions = [],
		placeholder = '',
		onSelect,
		class: className,
		...restProps
	} = $props();

	let showSuggestions = $state(false);
	let filteredSuggestions = $state([]);
	let selectedIndex = $state(-1);
	let inputElement = $state(null);

	// Filter suggestions based on input value
	$effect(() => {
		const newFilteredSuggestions = value && suggestions.length > 0 
			? suggestions
				.filter(suggestion => 
					suggestion.toLowerCase().includes(value.toLowerCase())
				)
				.slice(0, 10) // Limit to 10 suggestions
			: [];
		
		filteredSuggestions = newFilteredSuggestions;
		showSuggestions = newFilteredSuggestions.length > 0 && value.length > 0;
		selectedIndex = -1;
	});

	function handleInput(event) {
		value = event.target.value;
	}

	function handleKeydown(event) {
		if (!showSuggestions) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, filteredSuggestions.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0) {
					selectSuggestion(filteredSuggestions[selectedIndex]);
				} else if (onSelect) {
					onSelect(value);
				}
				break;
			case 'Escape':
				showSuggestions = false;
				selectedIndex = -1;
				break;
		}
	}

	function selectSuggestion(suggestion) {
		value = suggestion;
		showSuggestions = false;
		selectedIndex = -1;
		if (onSelect) {
			onSelect(suggestion);
		}
	}

	function handleBlur() {
		// Delay hiding suggestions to allow clicking on them
		setTimeout(() => {
			showSuggestions = false;
			selectedIndex = -1;
		}, 150);
	}

	function handleFocus() {
		if (value && filteredSuggestions.length > 0) {
			showSuggestions = true;
		}
	}
</script>

<div class="relative">
	<Input
		bind:this={inputElement}
		{value}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onblur={handleBlur}
		onfocus={handleFocus}
		{placeholder}
		class={cn("", className)}
		{...restProps}
	/>
	
	{#if showSuggestions}
		<div class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
			{#each filteredSuggestions as suggestion, index}
				<button
					type="button"
					class={cn(
						"w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
						index === selectedIndex && "bg-accent text-accent-foreground"
					)}
					onclick={() => selectSuggestion(suggestion)}
				>
					{suggestion}
				</button>
			{/each}
		</div>
	{/if}
</div>