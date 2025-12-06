/**
 * @file HTML synchronization utilities for keeping htmlSource in sync with iframe DOM
 */

import { get } from 'svelte/store';
import { htmlSource, iframeDocument, isInitializingProperties, isActivelyEditing } from './stores.js';
import { history } from './history.js';

/**
 * Extract complete HTML from iframe
 * @returns {string} Complete HTML document
 */
export function extractHTMLFromIframe() {
	const doc = get(iframeDocument);
	if (!doc || !doc.documentElement) {
		console.error('Iframe document not available');
		return '';
	}

	try {
		// Get complete HTML including doctype
		const html = doc.documentElement.outerHTML;
		return `<!DOCTYPE html>\n${html}`;
	} catch (error) {
		console.error('Error extracting HTML from iframe:', error);
		return '';
	}
}

/**
 * Debounce function with cancellable timeout
 * @param {Function} func
 * @param {number} wait
 * @returns {Function & {cancel: Function}}
 */
function debounce(func, wait) {
	let timeout;
	const executedFunction = function(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
	executedFunction.cancel = () => {
		clearTimeout(timeout);
	};
	return executedFunction;
}

/**
 * Internal sync function - does the actual work
 */
function doSyncHTMLSource() {
	// Skip sync if we're initializing properties
	if (get(isInitializingProperties)) {
		console.log('🔄 Skipping sync - initializing properties');
		return;
	}

	console.log('🔄 syncHTMLSource called');
	const html = extractHTMLFromIframe();
	if (html) {
		const currentHTML = get(htmlSource);
		
		// Only add to history if HTML actually changed
		if (html !== currentHTML) {
			htmlSource.set(html);
			// Add to history for undo/redo
			history.push(html);
			console.log('🔄 HTML synced from iframe to htmlSource and added to history');
		} else {
			console.log('🔄 HTML unchanged, skipping history push');
		}
	} else {
		console.log('🔄 No HTML extracted');
	}
}

// Debounced version
const debouncedSync = debounce(doSyncHTMLSource, 500);

/**
 * Sync htmlSource with current iframe DOM (debounced) and add to history
 * Skips scheduling if initializing properties or actively editing
 */
export function syncHTMLSource() {
	// Don't even schedule the sync if we're initializing or actively editing
	if (get(isInitializingProperties)) {
		console.log('🔄 Skipping sync scheduling - initializing properties');
		debouncedSync.cancel();
		return;
	}
	if (get(isActivelyEditing)) {
		console.log('🔄 Skipping sync scheduling - actively editing');
		debouncedSync.cancel();
		return;
	}
	debouncedSync();
}

/**
 * Sync htmlSource immediately (for Save operations)
 */
export function syncHTMLSourceImmediate() {
	const html = extractHTMLFromIframe();
	if (html) {
		htmlSource.set(html);
		console.log('HTML synced immediately');
	}
}
