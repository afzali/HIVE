import { get } from 'svelte/store';
import { selectedElement, currentMode } from './stores.js';
import { getHiveId } from './element-id.js';

/**
 * Svelte action for managing overlay interactions in iframe
 * @param {HTMLIFrameElement} iframe
 * @param {Object} options
 * @returns {Object}
 */
export function overlayAction(iframe, options = {}) {
	let iframeDoc = null;
	let overlayDiv = null;
	let highlightDiv = null;
	let labelDiv = null;
	let unsubscribe = null;
	let modeUnsubscribe = null;
	let isEditMode = false;

	const { onElementSelect = () => {} } = options;

	function calculateHighlightBox(element) {
		if (!element) return null;
		try {
			const rect = element.getBoundingClientRect();
			return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
		} catch (error) {
			return null;
		}
	}

	function updateHighlight() {
		const element = get(selectedElement);
		if (!element || !highlightDiv || !labelDiv) return;

		const box = calculateHighlightBox(element);
		if (!box) return;

		// Use transform for better performance
		highlightDiv.style.transform = `translate(${box.left}px, ${box.top}px)`;
		highlightDiv.style.width = `${box.width}px`;
		highlightDiv.style.height = `${box.height}px`;
		
		labelDiv.style.transform = `translate(${box.left}px, ${Math.max(0, box.top - 24)}px)`;
	}

	function handleClick(event) {
		// Only handle clicks in edit mode
		if (!isEditMode) return;

		const target = event.target;

		if (target === overlayDiv || target === highlightDiv || target === labelDiv || 
		    target?.closest?.('.hive-label')) {
			return;
		}

		if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
		    target.tagName === 'INPUT' || target.tagName === 'SELECT' || 
		    target.tagName === 'TEXTAREA') {
			event.preventDefault();
		}

		event.stopPropagation();

		if (!target || target.tagName === 'HTML' || target.tagName === 'BODY') {
			selectedElement.set(null);
			return;
		}

		if (target === get(selectedElement)) {
			selectedElement.set(null);
			return;
		}

		selectedElement.set(target);
		onElementSelect(target);
	}

	function handleContextMenu(event) {
		// Only handle in edit mode
		if (!isEditMode) return;

		const target = event.target;

		// Ignore if clicking on our overlay elements
		if (target === overlayDiv || target === highlightDiv || target === labelDiv) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		// Select the element if not already selected
		if (target !== get(selectedElement)) {
			selectedElement.set(target);
			onElementSelect(target);
		}

		// Dispatch custom event for context menu
		const iframe = iframeDoc.defaultView?.frameElement;
		if (iframe) {
			const iframeRect = iframe.getBoundingClientRect();
			iframe.dispatchEvent(new CustomEvent('show-context-menu', {
				detail: {
					x: iframeRect.left + event.clientX,
					y: iframeRect.top + event.clientY
				}
			}));
		}
	}

	function setupOverlay() {
		iframeDoc = iframe.contentDocument;
		if (!iframeDoc || !iframeDoc.body) {
			console.log('Iframe document not ready yet');
			return;
		}

		console.log('Setting up overlay in iframe');

		overlayDiv = iframeDoc.createElement('div');
		overlayDiv.className = 'hive-overlay';

		highlightDiv = iframeDoc.createElement('div');
		highlightDiv.className = 'hive-highlight';
		highlightDiv.style.display = 'none';

		labelDiv = iframeDoc.createElement('div');
		labelDiv.className = 'hive-label';
		labelDiv.style.display = 'none';

		iframeDoc.body.appendChild(overlayDiv);
		iframeDoc.body.appendChild(highlightDiv);
		iframeDoc.body.appendChild(labelDiv);

		iframeDoc.body.addEventListener('click', handleClick);
		iframeDoc.body.addEventListener('contextmenu', handleContextMenu);
		iframeDoc.defaultView?.addEventListener('scroll', updateHighlight, true);
		iframeDoc.defaultView?.addEventListener('resize', updateHighlight);

		// Subscribe to currentMode changes
		modeUnsubscribe = currentMode.subscribe((mode) => {
			isEditMode = mode === 'edit';
			
			// Hide highlights when not in edit mode
			if (!isEditMode && highlightDiv && labelDiv) {
				highlightDiv.style.display = 'none';
				labelDiv.style.display = 'none';
			}
		});

		// Subscribe to selectedElement changes
		unsubscribe = selectedElement.subscribe((element) => {
			// Only show highlights in edit mode
			if (!isEditMode) return;

			// CRITICAL: Remove ALL old highlight and label elements from DOM
			if (iframeDoc && iframeDoc.body) {
				// Remove all existing highlights and labels (in case of duplicates)
				const oldHighlights = iframeDoc.body.querySelectorAll('.hive-highlight');
				const oldLabels = iframeDoc.body.querySelectorAll('.hive-label');
				
				oldHighlights.forEach(h => {
					if (h !== highlightDiv) h.remove();
				});
				oldLabels.forEach(l => {
					if (l !== labelDiv) l.remove();
				});
			}

			// Always hide our main elements first
			if (highlightDiv && labelDiv) {
				highlightDiv.style.display = 'none';
				labelDiv.style.display = 'none';
				// Clear any event listeners by replacing content
				labelDiv.innerHTML = '';
			}

			if (element && highlightDiv && labelDiv) {
				// Check if element is still in the document
				if (!element.isConnected) {
					console.warn('Selected element is no longer in document');
					selectedElement.set(null);
					return;
				}

				const hiveId = getHiveId(element);
				
				// Show and update content
				highlightDiv.style.display = 'block';
				labelDiv.style.display = 'flex';
				labelDiv.innerHTML = `
					<span class="hive-drag-handle" style="cursor: move; padding: 0 4px; margin-right: 4px;" title="Drag to move (coming soon)">⋮⋮</span>
					<span style="font-family: monospace; font-size: 10px;">${hiveId}</span>
					<button class="hive-menu-btn" style="margin-left: 8px; padding: 0 4px; cursor: pointer;" title="More actions">⋮</button>
				`;

				// Add click handler to menu button
				const menuBtn = labelDiv.querySelector('.hive-menu-btn');
				if (menuBtn) {
					menuBtn.addEventListener('click', (e) => {
						e.stopPropagation();
						const iframe = iframeDoc.defaultView?.frameElement;
						if (iframe) {
							const rect = labelDiv.getBoundingClientRect();
							const iframeRect = iframe.getBoundingClientRect();
							iframe.dispatchEvent(new CustomEvent('show-context-menu', {
								detail: {
									x: iframeRect.left + rect.left,
									y: iframeRect.top + rect.bottom + 5
								}
							}));
						}
					});
				}

				// Force immediate update
				requestAnimationFrame(() => {
					updateHighlight();
				});
			}
		});
	}

	function cleanup() {
		if (unsubscribe) unsubscribe();
		if (modeUnsubscribe) modeUnsubscribe();
		if (!iframeDoc) return;

		iframeDoc.body?.removeEventListener('click', handleClick);
		iframeDoc.body?.removeEventListener('contextmenu', handleContextMenu);
		iframeDoc.defaultView?.removeEventListener('scroll', updateHighlight, true);
		iframeDoc.defaultView?.removeEventListener('resize', updateHighlight);
		
		overlayDiv?.remove();
		highlightDiv?.remove();
		labelDiv?.remove();
	}

	// Setup when iframe is ready (after Canvas component processes it)
	const handleIframeReady = () => {
		console.log('Iframe ready event received, setting up overlay');
		// Small delay to ensure everything is ready
		setTimeout(setupOverlay, 100);
	};

	const handleLoad = () => {
		console.log('Iframe loaded, waiting for ready event');
	};

	iframe.addEventListener('load', handleLoad);
	iframe.addEventListener('iframe-ready', handleIframeReady);

	// Also try immediate setup if already loaded
	if (iframe.contentDocument?.readyState === 'complete' && iframe.contentDocument?.body) {
		console.log('Iframe already loaded, setting up immediately');
		setupOverlay();
	}

	return {
		destroy() {
			iframe.removeEventListener('load', handleLoad);
			iframe.removeEventListener('iframe-ready', handleIframeReady);
			cleanup();
		}
	};
}
