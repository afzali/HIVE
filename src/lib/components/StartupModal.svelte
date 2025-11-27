<script>
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Select from '$lib/components/ui/select';
	import { FileText, Upload, Sparkles } from 'lucide-svelte';
	import { templates, loadTemplate } from '$lib/templates/index.js';

	/**
	 * @type {boolean}
	 */
	export let open = true;

	/**
	 * @type {function(string): void}
	 */
	export let onHTMLSelected = () => {};

	/**
	 * @type {string}
	 */
	let promptText = '';

	/**
	 * @type {string}
	 */
	let selectedModel = 'gpt-4';

	/**
	 * Available AI models
	 */
	const aiModels = [
		{ value: 'gpt-4', label: 'GPT-4' },
		{ value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
		{ value: 'claude-3', label: 'Claude 3' },
		{ value: 'gemini-pro', label: 'Gemini Pro' }
	];

	/**
	 * Handle template selection
	 */
	async function selectTemplate(template) {
		try {
			const html = await loadTemplate(template.id);
			onHTMLSelected(html);
			open = false;
		} catch (error) {
			console.error('Failed to load template:', error);
			// Fallback to default
			onHTMLSelected('default');
			open = false;
		}
	}

	/**
	 * Handle file upload
	 */
	function handleFileUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const html = e.target?.result;
			if (typeof html === 'string') {
				onHTMLSelected(html);
				open = false;
			}
		};
		reader.readAsText(file);
	}

	/**
	 * Handle prompt submission
	 */
	function handlePromptSubmit() {
		if (!promptText.trim()) return;
		
		// For now, just use DEFAULT_HTML
		// Later we'll integrate with AI
		console.log('Prompt:', promptText);
		onHTMLSelected('default');
		open = false;
	}
</script>

<Dialog.Root bind:open closeOnOutsideClick={false} closeOnEscape={false}>
	<Dialog.Content class="max-w-3xl bg-gray-900 border-gray-700 text-white">
		<Dialog.Header>
			<Dialog.Title class="text-2xl font-bold text-white">HIVE (HTML Interactive Visual Editor)</Dialog.Title>
			<Dialog.Description class="text-gray-400">
				Choose how you want to start editing
			</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root value="templates" class="mt-6">
			<Tabs.List class="grid w-full grid-cols-3 bg-gray-800">
				<Tabs.Trigger value="templates" class="data-[state=active]:bg-gray-700 text-white">
					<FileText class="w-4 h-4 mr-2" />
					Templates
				</Tabs.Trigger>
				<Tabs.Trigger value="upload" class="data-[state=active]:bg-gray-700 text-white">
					<Upload class="w-4 h-4 mr-2" />
					Upload File
				</Tabs.Trigger>
				<Tabs.Trigger value="prompt" class="data-[state=active]:bg-gray-700 text-white">
					<Sparkles class="w-4 h-4 mr-2" />
					AI Prompt
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Templates Tab -->
			<Tabs.Content value="templates" class="mt-6">
				<div class="grid gap-4">
					{#each templates as template}
						<button
							class="flex items-start gap-4 p-4 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-gray-800/50 transition-all text-left"
							onclick={() => selectTemplate(template)}
						>
							<div class="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
								<FileText class="w-6 h-6 text-indigo-400" />
							</div>
							<div class="flex-1">
								<h3 class="font-semibold text-white mb-1">{template.name}</h3>
								<p class="text-sm text-gray-400">{template.description}</p>
							</div>
						</button>
					{/each}
				</div>
			</Tabs.Content>

			<!-- Upload Tab -->
			<Tabs.Content value="upload" class="mt-6">
				<div class="space-y-4">
					<div class="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
						<Upload class="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<Label for="file-upload" class="cursor-pointer flex flex-col items-center">
							<span class="text-indigo-400 hover:text-indigo-300">Click to upload</span>
							<span class="text-gray-400">or drag and drop</span>
						</Label>
						<p class="text-sm text-gray-500 mt-2">HTML files only</p>
						<Input
							id="file-upload"
							type="file"
							accept=".html,.htm"
							class="hidden"
							onchange={handleFileUpload}
						/>
					</div>
				</div>
			</Tabs.Content>

			<!-- Prompt Tab -->
			<Tabs.Content value="prompt" class="mt-6">
				<div class="space-y-4">
					<div>
						<Label for="model-select" class="text-white mb-2 block">AI Model</Label>
						<select
							id="model-select"
							bind:value={selectedModel}
							class="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							{#each aiModels as model}
								<option value={model.value}>{model.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<Label for="prompt" class="text-white mb-2">Describe what you want to build</Label>
						<Textarea
							id="prompt"
							bind:value={promptText}
							placeholder="E.g., Create a modern landing page for a SaaS product with a hero section, features, and pricing..."
							class="min-h-[150px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
						/>
					</div>
					<Button
						onclick={handlePromptSubmit}
						disabled={!promptText.trim()}
						class="w-full bg-indigo-600 hover:bg-indigo-700"
					>
						<Sparkles class="w-4 h-4 mr-2" />
						Generate with AI (Coming Soon)
					</Button>
					<p class="text-xs text-gray-500 text-center">
						AI generation will be available in a future update
					</p>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>
