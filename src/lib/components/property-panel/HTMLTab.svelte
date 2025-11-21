<script>
	import * as Tabs from '$lib/components/ui/tabs';
	import { selectedElement } from '$lib/stores.js';
	import { debounce } from '$lib/dom-utils.js';
	import { syncHTMLSource } from '$lib/html-sync.js';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	// HTML Editor variables
	let monaco = null;
	let htmlMonacoEditor = null;
	/** @type {string} */
	let htmlEditorContent = '';
	/** @type {HTMLElement|null} */
	let htmlEditorContainer = null;
	/** @type {boolean} */
	let editorLoaded = false;

	/**
	 * Load Monaco Editor
	 */
	async function loadMonacoEditor() {
		if (monaco || editorLoaded) return;
		
		try {
			const monacoModule = await import('monaco-editor');
			monaco = monacoModule.default || monacoModule;
			editorLoaded = true;
		} catch (error) {
			console.error('Failed to load Monaco Editor:', error);
		}
	}

	/**
	 * Initialize HTML editor
	 */
	function initializeHTMLEditor() {
		if (!monaco || !htmlEditorContainer || htmlMonacoEditor) return;
		
		try {
			htmlMonacoEditor = monaco.editor.create(htmlEditorContainer, {
				value: htmlEditorContent,
				language: 'html',
				theme: 'vs-dark',
				minimap: { enabled: false },
				lineNumbers: 'on',
				wordWrap: 'on',
				automaticLayout: true,
				fontSize: 14,
				tabSize: 2,
				insertSpaces: true,
				formatOnPaste: true,
				formatOnType: true
			});
			
			htmlMonacoEditor.onDidChangeModelContent(() => {
				htmlEditorContent = htmlMonacoEditor.getValue();
				debouncedApplyHTMLChanges();
			});
		} catch (error) {
			console.error('Failed to initialize HTML editor:', error);
		}
	}

	/**
	 * Extract HTML from selected element
	 */
	function extractElementHTML() {
		if (!$selectedElement) return '';
		return $selectedElement.outerHTML;
	}

	/**
	 * Apply HTML changes to element (debounced)
	 */
	const debouncedApplyHTMLChanges = debounce(() => {
		if (!$selectedElement || !htmlEditorContent.trim()) return;
		
		try {
			const element = $selectedElement;
			const parent = element.parentNode;
			
			if (!parent) {
				console.error('Cannot replace element without parent');
				return;
			}
			
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = htmlEditorContent.trim();
			
			const newElement = tempDiv.firstElementChild;
			
			if (!newElement) {
				console.error('Invalid HTML: No element found');
				return;
			}
			
			parent.replaceChild(newElement, element);
			selectedElement.set(newElement);
			
			onPropertyChange('outerHTML', newElement.outerHTML);
			syncHTMLSource();
		} catch (error) {
			console.error('Error applying HTML changes:', error);
		}
	}, 500);

	/**
	 * Handle HTML tab activation
	 */
	function handleHTMLTabActivation() {
		if (!editorLoaded) {
			loadMonacoEditor().then(() => {
				htmlEditorContent = extractElementHTML();
				setTimeout(initializeHTMLEditor, 100);
			});
		} else if (htmlMonacoEditor) {
			htmlEditorContent = extractElementHTML();
			htmlMonacoEditor.setValue(htmlEditorContent);
		} else if (editorLoaded && !htmlMonacoEditor) {
			htmlEditorContent = extractElementHTML();
			setTimeout(initializeHTMLEditor, 100);
		}
	}

	// Watch for element changes to update HTML editor
	$: if ($selectedElement && htmlMonacoEditor) {
		htmlEditorContent = extractElementHTML();
		htmlMonacoEditor.setValue(htmlEditorContent);
	}

	// Initialize when tab becomes active
	export let activeTab = '';
	$: if (activeTab === 'html') {
		handleHTMLTabActivation();
	}
</script>

<Tabs.Content value="html" class="flex-1 overflow-y-auto mt-4">
	<div class="space-y-4 h-full flex flex-col">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-medium">HTML Editor</h3>
			<div class="text-xs text-muted-foreground">
				Edit element HTML structure
			</div>
		</div>
		
		<!-- Monaco HTML Editor Container -->
		<div class="flex-1 border border-border rounded-md overflow-hidden min-h-96">
			{#if editorLoaded}
				<div 
					bind:this={htmlEditorContainer}
					class="w-full h-full min-h-96"
				></div>
			{:else}
				<div class="flex items-center justify-center h-full min-h-96 bg-muted">
					<div class="text-center">
						<div class="text-sm text-muted-foreground mb-2">Loading HTML Editor...</div>
						<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- HTML Editor Help -->
		<div class="text-xs text-muted-foreground space-y-1">
			<div class="font-medium">Tips:</div>
			<ul class="list-disc list-inside space-y-1 ml-2">
				<li>Changes replace the entire element in the DOM</li>
				<li>Make sure to maintain valid HTML structure</li>
				<li>Element will be re-selected after changes</li>
				<li>Invalid HTML will be rejected to prevent corruption</li>
			</ul>
		</div>
		
		<!-- Warning -->
		<div class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
			<div class="flex items-start">
				<div class="text-yellow-600 text-sm">
					<strong>⚠️ Warning:</strong> Editing HTML directly can break the page structure. 
					Use with caution and ensure valid HTML syntax.
				</div>
			</div>
		</div>
	</div>
</Tabs.Content>