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

			if (element && highlightDiv && labelDiv) {
				const hiveId = getHiveId(element);
				
				highlightDiv.style.display = 'block';
				labelDiv.style.display = 'flex';
				labelDiv.innerHTML = `
					<span style="font-family: monospace; font-size: 10px;">${hiveId}</span>
				`;

				updateHighlight();
			} else if (highlightDiv && labelDiv) {
				highlightDiv.style.display = 'none';
				labelDiv.style.display = 'none';
			}
		});
	}

	function cleanup() {
		if (unsubscribe) unsubscribe();
		if (modeUnsubscribe) modeUnsubscribe();
		if (!iframeDoc) return;

		iframeDoc.body?.removeEventListener('click', handleClick);
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
