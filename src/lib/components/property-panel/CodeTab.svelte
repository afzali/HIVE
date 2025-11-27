<script>
	import * as Tabs from '$lib/components/ui/tabs';
	import { selectedElement } from '$lib/stores.js';
	import { debounce } from '$lib/dom-utils.js';
	import { syncHTMLSource } from '$lib/html-sync.js';
	import { configureMonacoSimple } from '$lib/monaco-config.js';
	import { onMount } from 'svelte';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};

	// Monaco Editor variables
	let monaco = null;
	let monacoEditor = null;
	/** @type {string} */
	let cssEditorContent = '';
	/** @type {HTMLElement|null} */
	let cssEditorContainer = null;
	/** @type {boolean} */
	let cssEditorLoaded = false;

	/**
	 * Load Monaco Editor for CSS editing
	 */
	async function loadMonacoEditor() {
		if (monaco || cssEditorLoaded) return;
		
		try {
			// Configure Monaco Environment first
			configureMonacoSimple();
			
			const monacoModule = await import('monaco-editor');
			monaco = monacoModule.default || monacoModule;
			
			monaco.languages.css.cssDefaults.setOptions({
				validate: true,
				lint: {
					compatibleVendorPrefixes: 'ignore',
					vendorPrefix: 'ignore',
					duplicateProperties: 'warning',
					emptyRules: 'warning'
				}
			});
			
			cssEditorLoaded = true;
		} catch (error) {
			console.error('Failed to load Monaco Editor:', error);
		}
	}

	/**
	 * Initialize CSS editor
	 */
	function initializeCSSEditor() {
		if (!monaco || !cssEditorContainer) return;
		
		// Dispose existing editor if any
		if (monacoEditor) {
			try {
				monacoEditor.dispose();
				monacoEditor = null;
			} catch (e) {
				console.warn('Error disposing Monaco editor:', e);
			}
		}
		
		try {
			monacoEditor = monaco.editor.create(cssEditorContainer, {
				value: cssEditorContent,
				language: 'css',
				theme: 'vs-dark',
				minimap: { enabled: false },
				lineNumbers: 'on',
				wordWrap: 'on',
				automaticLayout: true,
				fontSize: 14,
				tabSize: 2,
				insertSpaces: true,
				// Disable features that use workers
				colorDecorators: false,
				links: false,
				hover: { enabled: false },
				suggest: { showWords: false },
				quickSuggestions: false,
				parameterHints: { enabled: false },
				codeLens: false,
				folding: false,
				foldingHighlight: false,
				unfoldOnClickAfterEndOfLine: false,
				showUnused: false
			});
			
			// Track when user starts editing
			monacoEditor.onDidFocusEditorText(() => {
				isUserEditing = true;
			});

			// Track when user stops editing (with delay)
			monacoEditor.onDidBlurEditorText(() => {
				setTimeout(() => {
					isUserEditing = false;
				}, 1000); // Wait 1 second after blur before allowing updates
			});

			monacoEditor.onDidChangeModelContent(() => {
				cssEditorContent = monacoEditor.getValue();
				isUserEditing = true; // Mark as editing when content changes
				debouncedApplyCSSChanges();
			});
		} catch (error) {
			console.error('Failed to initialize CSS editor:', error);
		}
	}

	/**
	 * Extract CSS styles from selected element
	 */
	function extractElementCSS() {
		if (!$selectedElement) return '';
		
		const element = $selectedElement;
		const computedStyles = window.getComputedStyle(element);
		const inlineStyles = element.style;
		
		let cssText = '';
		
		// Add inline styles if they exist
		if (inlineStyles.cssText) {
			cssText += '/* Current Inline Styles */\n';
			const inlineProps = inlineStyles.cssText.split(';').filter(prop => prop.trim());
			inlineProps.forEach(prop => {
				if (prop.trim()) {
					cssText += `${prop.trim()};\n`;
				}
			});
			cssText += '\n';
		}
		
		// Add active computed styles (only the most relevant ones)
		cssText += '/* Active Computed Styles */\n';
		
		// Get font properties
		const fontSize = computedStyles.fontSize;
		const fontFamily = computedStyles.fontFamily;
		const fontWeight = computedStyles.fontWeight;
		const color = computedStyles.color;
		const textAlign = computedStyles.textAlign;
		
		if (fontSize && fontSize !== '16px') cssText += `font-size: ${fontSize};\n`;
		if (fontFamily && fontFamily !== 'serif') cssText += `font-family: ${fontFamily};\n`;
		if (fontWeight && fontWeight !== '400') cssText += `font-weight: ${fontWeight};\n`;
		if (color && color !== 'rgb(0, 0, 0)') cssText += `color: ${color};\n`;
		if (textAlign && textAlign !== 'start') cssText += `text-align: ${textAlign};\n`;
		
		// Get layout properties
		const display = computedStyles.display;
		const position = computedStyles.position;
		const width = computedStyles.width;
		const height = computedStyles.height;
		
		if (display && display !== 'block' && display !== 'inline') cssText += `display: ${display};\n`;
		if (position && position !== 'static') cssText += `position: ${position};\n`;
		if (width && !width.includes('auto')) cssText += `width: ${width};\n`;
		if (height && !height.includes('auto')) cssText += `height: ${height};\n`;
		
		// Get spacing properties
		const marginTop = computedStyles.marginTop;
		const marginRight = computedStyles.marginRight;
		const marginBottom = computedStyles.marginBottom;
		const marginLeft = computedStyles.marginLeft;
		const paddingTop = computedStyles.paddingTop;
		const paddingRight = computedStyles.paddingRight;
		const paddingBottom = computedStyles.paddingBottom;
		const paddingLeft = computedStyles.paddingLeft;
		
		if (marginTop && marginTop !== '0px') cssText += `margin-top: ${marginTop};\n`;
		if (marginRight && marginRight !== '0px') cssText += `margin-right: ${marginRight};\n`;
		if (marginBottom && marginBottom !== '0px') cssText += `margin-bottom: ${marginBottom};\n`;
		if (marginLeft && marginLeft !== '0px') cssText += `margin-left: ${marginLeft};\n`;
		if (paddingTop && paddingTop !== '0px') cssText += `padding-top: ${paddingTop};\n`;
		if (paddingRight && paddingRight !== '0px') cssText += `padding-right: ${paddingRight};\n`;
		if (paddingBottom && paddingBottom !== '0px') cssText += `padding-bottom: ${paddingBottom};\n`;
		if (paddingLeft && paddingLeft !== '0px') cssText += `padding-left: ${paddingLeft};\n`;
		
		// Get background properties
		const backgroundColor = computedStyles.backgroundColor;
		const backgroundImage = computedStyles.backgroundImage;
		
		if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
			cssText += `background-color: ${backgroundColor};\n`;
		}
		if (backgroundImage && backgroundImage !== 'none') {
			cssText += `background-image: ${backgroundImage};\n`;
		}
		
		// Get border properties
		const borderWidth = computedStyles.borderWidth;
		const borderStyle = computedStyles.borderStyle;
		const borderColor = computedStyles.borderColor;
		const borderRadius = computedStyles.borderRadius;
		
		if (borderWidth && borderWidth !== '0px') cssText += `border-width: ${borderWidth};\n`;
		if (borderStyle && borderStyle !== 'none') cssText += `border-style: ${borderStyle};\n`;
		if (borderColor && borderColor !== 'rgb(0, 0, 0)') cssText += `border-color: ${borderColor};\n`;
		if (borderRadius && borderRadius !== '0px') cssText += `border-radius: ${borderRadius};\n`;
		
		// Get effects
		const boxShadow = computedStyles.boxShadow;
		const opacity = computedStyles.opacity;
		const transform = computedStyles.transform;
		
		if (boxShadow && boxShadow !== 'none') cssText += `box-shadow: ${boxShadow};\n`;
		if (opacity && opacity !== '1') cssText += `opacity: ${opacity};\n`;
		if (transform && transform !== 'none') cssText += `transform: ${transform};\n`;
		
		return cssText || '/* No active styles found */\n';
	}

	/**
	 * Apply CSS changes to element (debounced)
	 */
	const debouncedApplyCSSChanges = debounce(() => {
		if (!$selectedElement || !cssEditorContent) return;
		
		try {
			const element = $selectedElement;
			
			const cssRules = cssEditorContent
				.split('\n')
				.map(line => line.trim())
				.filter(line => line && !line.startsWith('/*') && !line.endsWith('*/'))
				.filter(line => line.includes(':') && line.endsWith(';'));
			
			cssRules.forEach(rule => {
				const [property, value] = rule.split(':').map(s => s.trim());
				if (property && value) {
					const cleanValue = value.replace(';', '');
					element.style.setProperty(property, cleanValue);
				}
			});
			
			onPropertyChange('style', element.style.cssText);
			syncHTMLSource();
		} catch (error) {
			console.error('Error applying CSS changes:', error);
		}
	}, 500);

	/**
	 * Handle CSS tab activation
	 */
	function handleCSSTabActivation() {
		if (!cssEditorLoaded) {
			loadMonacoEditor().then(() => {
				cssEditorContent = extractElementCSS();
				setTimeout(initializeCSSEditor, 100);
			});
		} else if (monacoEditor) {
			cssEditorContent = extractElementCSS();
			monacoEditor.setValue(cssEditorContent);
		}
	}

	// Track the last processed element to avoid unnecessary updates
	let lastProcessedElement = null;
	let isUserEditing = false;

	// Watch for element changes to update CSS editor (only when not editing)
	$: if ($selectedElement && monacoEditor && $selectedElement !== lastProcessedElement && !isUserEditing) {
		lastProcessedElement = $selectedElement;
		cssEditorContent = extractElementCSS();
		monacoEditor.setValue(cssEditorContent);
	}

	// Initialize when tab becomes active
	export let activeTab = '';
	$: if (activeTab === 'code') {
		handleCSSTabActivation();
	}
</script>

<Tabs.Content value="code" class="flex-1 overflow-y-auto mt-4">
	<div class="space-y-4 h-full flex flex-col">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-medium">CSS Editor</h3>
			<div class="text-xs text-muted-foreground">
				Edit styles for selected element
			</div>
		</div>
		
		<!-- Monaco Editor Container -->
		<div class="flex-1 border border-border rounded-md overflow-hidden min-h-96">
			{#if cssEditorLoaded}
				<div 
					bind:this={cssEditorContainer}
					class="w-full h-full min-h-96"
				></div>
			{:else}
				<div class="flex items-center justify-center h-full min-h-96 bg-muted">
					<div class="text-center">
						<div class="text-sm text-muted-foreground mb-2">Loading CSS Editor...</div>
						<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- CSS Editor Help -->
		<div class="text-xs text-muted-foreground space-y-1">
			<div class="font-medium">Tips:</div>
			<ul class="list-disc list-inside space-y-1 ml-2">
				<li>Changes apply automatically as you type</li>
				<li>Only shows active/relevant styles</li>
				<li>Inline styles take precedence</li>
				<li>Use standard CSS property names</li>
			</ul>
		</div>
	</div>
</Tabs.Content>