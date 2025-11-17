<script>
	import { htmlSource } from '$lib/stores.js';
	import { Button } from '$lib/components/ui/button';

	/**
	 * @type {function(): void} onApply - Callback when Apply is clicked
	 */
	export let onApply = () => {};

	/**
	 * @type {function(): void} onCancel - Callback when Cancel is clicked
	 */
	export let onCancel = () => {};

	/** @type {string} */
	let editorValue = '';

	/** @type {boolean} */
	let hasChanges = false;

	/** @type {HTMLTextAreaElement} */
	let textareaElement;

	// Initialize editor value from store
	$: if ($htmlSource && !hasChanges) {
		editorValue = $htmlSource;
	}

	/**
	 * Handle input changes
	 */
	function handleInput() {
		hasChanges = editorValue !== $htmlSource;
	}

	/**
	 * Handle Apply button
	 */
	function handleApply() {
		if (hasChanges) {
			htmlSource.set(editorValue);
			hasChanges = false;
			onApply();
		}
	}

	/**
	 * Handle Cancel button
	 */
	function handleCancel() {
		editorValue = $htmlSource;
		hasChanges = false;
		onCancel();
	}

	/**
	 * Handle keyboard shortcuts
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		// Ctrl+S to apply
		if (event.ctrlKey && event.key === 's') {
			event.preventDefault();
			handleApply();
		}
		// Escape to cancel
		if (event.key === 'Escape') {
			event.preventDefault();
			handleCancel();
		}
		// Tab for indentation
		if (event.key === 'Tab') {
			event.preventDefault();
			const start = textareaElement.selectionStart;
			const end = textareaElement.selectionEnd;
			
			// Insert tab
			editorValue = editorValue.substring(0, start) + '  ' + editorValue.substring(end);
			
			// Move cursor
			setTimeout(() => {
				textareaElement.selectionStart = textareaElement.selectionEnd = start + 2;
			}, 0);
			
			handleInput();
		}
	}

	/**
	 * Format HTML (basic indentation)
	 */
	function formatHTML() {
		try {
			let formatted = editorValue;
			let indent = 0;
			const lines = formatted.split('\n');
			const formattedLines = [];

			for (let line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;

				// Decrease indent for closing tags
				if (trimmed.startsWith('</')) {
					indent = Math.max(0, indent - 1);
				}

				// Add indentation
				formattedLines.push('  '.repeat(indent) + trimmed);

				// Increase indent for opening tags (but not self-closing)
				if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
					indent++;
				}
			}

			editorValue = formattedLines.join('\n');
			handleInput();
		} catch (error) {
			console.error('Error formatting HTML:', error);
		}
	}


</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex flex-col" style="background-color: #111827;">
	<!-- Header -->
	<div style="background-color: #1f2937; border-bottom: 1px solid #374151;" class="px-4 py-3 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<h2 style="color: white;" class="font-semibold">Code Editor</h2>
			{#if hasChanges}
				<span style="color: #fbbf24;" class="text-sm">• Unsaved changes</span>
			{/if}
		</div>
		
		<div class="flex items-center gap-2">
			<button 
				on:click={formatHTML}
				style="color: white; border: 1px solid #4b5563; background-color: transparent; padding: 8px 16px; border-radius: 6px;"
				class="hover:bg-gray-700 transition-colors"
			>
				Format
			</button>
			<button 
				on:click={handleCancel} 
				style="color: white; border: 1px solid #4b5563; background-color: transparent; padding: 8px 16px; border-radius: 6px;"
				class="hover:bg-gray-700 transition-colors"
			>
				Cancel
			</button>
			<button 
				on:click={handleApply} 
				disabled={!hasChanges}
				style="background-color: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; border: none;"
				class="hover:bg-blue-700 disabled:opacity-50 transition-colors"
			>
				Apply Changes
			</button>
		</div>
	</div>

	<!-- Editor -->
	<div class="flex-1 relative">
		<textarea
			bind:this={textareaElement}
			bind:value={editorValue}
			on:input={handleInput}
			style="background-color: #111827; color: #f3f4f6; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; tab-size: 2; padding: 16px; border: none; outline: none; resize: none; width: 100%; height: 100%;"
			class="absolute inset-0"
			placeholder="Enter your HTML code here..."
			spellcheck="false"
		></textarea>
	</div>

	<!-- Footer -->
	<div style="background-color: #1f2937; border-top: 1px solid #374151; color: #9ca3af;" class="px-4 py-2 text-sm">
		<div class="flex items-center justify-between">
			<span>HTML Editor • Press Ctrl+S to apply, Esc to cancel, Tab for indentation</span>
			<span>Lines: {editorValue.split('\n').length}</span>
		</div>
	</div>
</div>

<style>
	textarea {
		line-height: 1.5;
		tab-size: 2;
	}
</style>