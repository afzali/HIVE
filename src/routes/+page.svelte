<script>
	import Canvas from '$lib/components/Canvas.svelte';
	import FloatingButton from '$lib/components/FloatingButton.svelte';
	import PropertyPanel from '$lib/components/PropertyPanel.svelte';
	import ContextMenu from '$lib/components/ContextMenu.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { htmlSource, currentMode, viewportSize, iframeDocument, selectedElement } from '$lib/stores.js';
	import { history } from '$lib/history.js';

	/** @type {boolean} */
	let showContextMenu = false;

	/** @type {{x: number, y: number}} */
	let contextMenuPosition = { x: 0, y: 0 };

	/** @type {HTMLElement} */
	let editorContainer;
	
	/** @type {any} */
	let monacoEditor = null;

	/** @type {any} */
	let canvasComponent = null;

	/**
	 * Handle iframe load
	 * @param {Document} doc
	 */
	function handleCanvasLoad(doc) {
		console.log('Canvas loaded successfully');
		// Initialize history with current HTML
		history.push($htmlSource);
	}

	/**
	 * Handle mode change
	 * @param {string} mode
	 */
	function handleModeChange(mode) {
		console.log('MainPage: Mode changed to:', mode);
		// Clear selection when leaving edit mode
		if (mode !== 'edit') {
			selectedElement.set(null);
		}
	}

	/**
	 * Handle responsive mode change
	 * @param {import('$lib/types.js').ViewportSize} size
	 */
	function handleResponsiveModeChange(size) {
		console.log('Viewport changed to:', size);
	}

	/**
	 * Handle element selection
	 * @param {HTMLElement} element
	 */
	function handleElementSelect(element) {
		console.log('Element selected:', element.tagName, element.className);
	}

	/**
	 * Handle property change
	 * @param {string} property
	 * @param {any} value
	 */
	function handlePropertyChange(property, value) {
		console.log('Property changed:', property, value);
		// TODO: Add to history for undo/redo
	}

	/**
	 * Handle context menu request
	 * @param {{x: number, y: number}} position
	 */
	function handleContextMenu(position) {
		contextMenuPosition = position;
		showContextMenu = true;
	}

	/**
	 * Handle element action from context menu
	 */
	function handleElementAction() {
		showContextMenu = false;
	}

	/**
	 * Handle close context menu
	 */
	function handleCloseContextMenu() {
		showContextMenu = false;
	}

	// Initialize Monaco Editor when entering code mode
	$: if ($currentMode === 'code' && editorContainer && !monacoEditor) {
		initializeMonacoEditor();
	}

	// Cleanup Monaco Editor when leaving code mode
	$: if ($currentMode !== 'code' && monacoEditor) {
		cleanupMonacoEditor();
	}

	/**
	 * Initialize Monaco Editor when entering code mode
	 */
	async function initializeMonacoEditor() {
		if (monacoEditor || !editorContainer) return;
		
		try {
			const monaco = await import('monaco-editor');
			
			// Disable all worker-dependent features to prevent errors
			monacoEditor = monaco.editor.create(editorContainer, {
				value: $htmlSource,
				language: 'html',
				theme: 'vs-dark',
				automaticLayout: true,
				minimap: { enabled: false },
				lineNumbers: 'on',
				wordWrap: 'on',
				fontSize: 14,
				tabSize: 2,
				insertSpaces: true,
				// Disable all features that require web workers
				quickSuggestions: false,
				suggestOnTriggerCharacters: false,
				parameterHints: { enabled: false },
				hover: { enabled: false },
				occurrencesHighlight: false,
				selectionHighlight: false,
				codeLens: false,
				folding: false,
				foldingHighlight: false,
				links: false,
				colorDecorators: false,
				wordHighlighter: false,
				contextmenu: false,
				mouseWheelZoom: false,
				linkedEditing: false,
				unicodeHighlight: { ambiguousCharacters: false, invisibleCharacters: false }
			});

			console.log('Monaco Editor initialized successfully');
		} catch (error) {
			console.error('Failed to load Monaco Editor:', error);
		}
	}

	/**
	 * Cleanup Monaco Editor
	 */
	function cleanupMonacoEditor() {
		if (monacoEditor) {
			monacoEditor.dispose();
			monacoEditor = null;
		}
	}
</script>

<svelte:head>
	<title>HTML Visual Editor</title>
</svelte:head>

<main class="w-screen h-screen overflow-hidden bg-gray-900 relative">
	<!-- Canvas Area -->
	<div class="absolute inset-0" style="{$currentMode === 'edit' && $selectedElement ? 'right: 480px;' : ''}">
		<Canvas 
			bind:this={canvasComponent}
			htmlSource={$htmlSource} 
			viewportSize={$viewportSize} 
			onLoad={handleCanvasLoad}
			onElementSelect={handleElementSelect}
			onContextMenu={handleContextMenu}
			onCloseContextMenu={handleCloseContextMenu}
		/>
	</div>
	
	<!-- Context Menu -->
	{#if showContextMenu && $selectedElement && $currentMode === 'edit'}
		<ContextMenu
			position={contextMenuPosition}
			onDuplicate={handleElementAction}
			onDelete={handleElementAction}
			onAdd={handleElementAction}
			onMove={handleElementAction}
		/>
	{/if}
	
	<!-- Property Panel -->
	{#if $currentMode === 'edit'}
		<PropertyPanel onPropertyChange={handlePropertyChange} />
	{/if}
	
	<!-- Code Editor -->
	{#if $currentMode === 'code'}
		<div class="fixed inset-0 z-[100] bg-gray-900 flex flex-col">
			<!-- Header with controls -->
			<div class="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
				<div class="flex items-center space-x-4">
					<h2 class="text-lg font-semibold text-white">HTML Code Editor</h2>
				</div>
				
				<div class="flex items-center space-x-2">
					<button 
						class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
						on:click={() => currentMode.set('edit')}
					>
						Cancel
					</button>
					<button 
						class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
						on:click={() => {
							console.log('Apply button clicked');
							console.log('Monaco Editor exists:', !!monacoEditor);
							
							// Get current value from Monaco Editor or fallback textarea
							if (monacoEditor) {
								const newHtml = monacoEditor.getValue();
								console.log('Getting HTML from Monaco Editor, length:', newHtml.length);
								
								// Update HTML source and force Canvas reload
								htmlSource.set(newHtml);
								if (canvasComponent) {
									canvasComponent.reloadWithHTML(newHtml);
								}
								// Add to history for undo/redo
								history.push(newHtml);
								
								console.log('HTML updated from Monaco Editor');
							} else {
								// If Monaco Editor is not available, the textarea is bound to htmlSource
								// so the changes are already there, just add to history and reload canvas
								console.log('Using fallback textarea, current HTML length:', $htmlSource.length);
								if (canvasComponent) {
									canvasComponent.reloadWithHTML($htmlSource);
								}
								history.push($htmlSource);
								console.log('HTML updated from textarea');
							}
							
							// Switch back to edit mode
							currentMode.set('edit');
							console.log('Switched back to edit mode');
						}}
					>
						Apply Changes
					</button>
				</div>
			</div>

			<!-- Editor container -->
			<div class="flex-1 relative">
				<div 
					bind:this={editorContainer}
					class="w-full h-full"
				></div>
				
				<!-- Fallback textarea if Monaco fails -->
				{#if !monacoEditor}
					<textarea 
						bind:value={$htmlSource}
						class="absolute inset-0 w-full h-full bg-gray-800 text-white font-mono text-sm p-4 resize-none border-none outline-none"
						placeholder="Monaco Editor loading... You can edit HTML here in the meantime."
					></textarea>
				{/if}
			</div>

			<!-- Footer with shortcuts -->
			<div class="bg-gray-800 border-t border-gray-700 px-4 py-2">
				<div class="flex items-center justify-between text-sm text-gray-400">
					<div class="flex items-center space-x-4">
						<span>HTML Editor</span>
					</div>
					<div class="flex items-center space-x-4">
						<span>Ctrl+S to Apply</span>
						<span>•</span>
						<span>Esc to Cancel</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
	

	
	<!-- Floating Button -->
	<FloatingButton 
		onModeChange={handleModeChange} 
		onResponsiveModeChange={handleResponsiveModeChange} 
	/>
</main>

<!-- Click outside to close context menu -->
<svelte:window on:click={(e) => {
	// Don't close if clicking inside context menu
	if (!e.target.closest('.fixed.bg-white.rounded-lg')) {
		showContextMenu = false;
	}
}} />
