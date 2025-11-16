/**
 * @file HTML export utilities
 */

import { removeHiveIds } from './element-id.js';

/**
 * Extract clean HTML from iframe document (without hive IDs)
 * @param {Document} doc
 * @returns {string}
 */
export function extractCleanHTML(doc) {
	if (!doc || !doc.documentElement) {
		return '';
	}

	// Get the full HTML
	const html = doc.documentElement.outerHTML;

	// Remove hive IDs
	const cleanHtml = removeHiveIds(html);

	// Add DOCTYPE if not present
	if (!cleanHtml.toLowerCase().startsWith('<!doctype')) {
		return `<!DOCTYPE html>\n${cleanHtml}`;
	}

	return cleanHtml;
}

/**
 * Download HTML as a file
 * @param {string} html
 * @param {string} filename
 */
export function downloadHTML(html, filename = 'page.html') {
	const blob = new Blob([html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
