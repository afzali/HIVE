<script>
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Send, Bot, User } from 'lucide-svelte';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	// Chat state
	/** @type {string} */
	let currentMessage = '';
	/** @type {string} */
	let selectedLLM = 'chatgpt';
	/** @type {Array<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}>} */
	let messages = [];
	let messageIdCounter = 0;
	let messagesContainer;

	// LLM options
	const llmOptions = [
		{ value: "chatgpt", label: "ChatGPT" },
		{ value: "claude", label: "Claude" },
		{ value: "ollama", label: "Ollama" },
		{ value: "gemini", label: "Gemini" },
		{ value: "local", label: "Local Model" }
	];

	// Derived content for select trigger
	$: llmTriggerContent = llmOptions.find((llm) => llm.value === selectedLLM)?.label ?? "Select LLM";

	/**
	 * Send message
	 */
	function sendMessage() {
		if (!currentMessage.trim()) return;

		// Add user message
		const userMessage = {
			id: `msg-${messageIdCounter++}`,
			type: 'user',
			content: currentMessage.trim(),
			timestamp: new Date()
		};
		messages = [...messages, userMessage];

		// Scroll to bottom
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 100);

		// Simulate AI response (replace with actual API call)
		setTimeout(() => {
			const aiResponse = {
				id: `msg-${messageIdCounter++}`,
				type: 'assistant',
				content: `This is a simulated response from ${llmTriggerContent}. In a real implementation, this would connect to the selected LLM API.`,
				timestamp: new Date()
			};
			messages = [...messages, aiResponse];
			
			// Scroll to bottom after AI response
			setTimeout(() => {
				if (messagesContainer) {
					messagesContainer.scrollTop = messagesContainer.scrollHeight;
				}
			}, 100);
		}, 1000);

		// Clear input
		currentMessage = '';
	}

	/**
	 * Handle key press in input
	 */
	function handleKeyPress(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	/**
	 * Format timestamp
	 */
	function formatTime(date) {
		return date.toLocaleTimeString('en-US', { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	}

	/**
	 * Clear chat
	 */
	function clearChat() {
		messages = [];
		messageIdCounter = 0;
	}
</script>

<Tabs.Content value="chat" class="flex flex-col h-full mt-4">
	<!-- Chat Header -->
	<div class="flex items-center justify-between p-3 border-b bg-muted/30">
		<div class="flex items-center gap-2">
			<Bot class="h-4 w-4 text-primary" />
			<span class="text-sm font-medium">AI Assistant</span>
		</div>
		<button
			onclick={clearChat}
			class="text-xs text-muted-foreground hover:text-foreground transition-colors"
		>
			Clear
		</button>
	</div>

	<!-- LLM Selection -->
	<div class="p-3 border-b bg-background/50">
		<div class="space-y-2">
			<Label class="text-xs">AI Model</Label>
			<Select.Root type="single" name="llmType" bind:value={selectedLLM}>
				<Select.Trigger class="w-full h-8 text-sm">
					{llmTriggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each llmOptions as llm (llm.value)}
							<Select.Item value={llm.value} label={llm.label}>
								{llm.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- Messages Area -->
	<div bind:this={messagesContainer} class="flex-1 overflow-y-auto p-3 space-y-3">
		{#if messages.length === 0}
			<div class="text-center py-8 text-sm text-muted-foreground">
				<Bot class="h-8 w-8 mx-auto mb-2 opacity-50" />
				<div class="mb-1">No messages yet</div>
				<div class="text-xs">Start a conversation with your AI assistant</div>
			</div>
		{:else}
			{#each messages as message (message.id)}
				<div class="flex gap-2 {message.type === 'user' ? 'justify-end' : 'justify-start'}">
					{#if message.type === 'assistant'}
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
							<Bot class="h-3 w-3 text-primary" />
						</div>
					{/if}
					
					<div class="max-w-[80%] {message.type === 'user' ? 'order-1' : ''}">
						<div class="rounded-lg px-3 py-2 text-sm {
							message.type === 'user' 
								? 'bg-primary text-primary-foreground ml-auto' 
								: 'bg-muted'
						}">
							{message.content}
						</div>
						<div class="text-xs text-muted-foreground mt-1 {
							message.type === 'user' ? 'text-right' : 'text-left'
						}">
							{formatTime(message.timestamp)}
						</div>
					</div>

					{#if message.type === 'user'}
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
							<User class="h-3 w-3 text-primary" />
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	<!-- Message Input -->
	<div class="p-3 border-t bg-background/50">
		<div class="flex gap-2">
			<Input
				bind:value={currentMessage}
				onkeydown={handleKeyPress}
				placeholder="Type your message..."
				class="flex-1 h-9 text-sm"
			/>
			<button
				onclick={sendMessage}
				disabled={!currentMessage.trim()}
				class="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				<Send class="h-4 w-4" />
			</button>
		</div>
		<div class="text-xs text-muted-foreground mt-2">
			Press Enter to send, Shift+Enter for new line
		</div>
	</div>
</Tabs.Content>