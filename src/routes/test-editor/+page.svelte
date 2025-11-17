<script>
	import SimpleCodeEditor from '$lib/components/SimpleCodeEditor.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	
	let showSimpleEditor = false;
	let showMonacoEditor = false;
	
	function handleApply() {
		console.log('Applied changes');
		showSimpleEditor = false;
		showMonacoEditor = false;
	}
	
	function handleCancel() {
		console.log('Cancelled');
		showSimpleEditor = false;
		showMonacoEditor = false;
	}
</script>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Editor Test Page</h1>
	
	<div class="space-y-4">
		<button 
			on:click={() => showSimpleEditor = true}
			class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
		>
			Open Simple Editor
		</button>
		
		<button 
			on:click={() => showMonacoEditor = true}
			class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
		>
			Open Monaco Editor
		</button>
	</div>
</div>

{#if showSimpleEditor}
	<SimpleCodeEditor 
		onApply={handleApply}
		onCancel={handleCancel}
	/>
{/if}

{#if showMonacoEditor}
	<CodeEditor 
		onApply={handleApply}
		onCancel={handleCancel}
	/>
{/if}