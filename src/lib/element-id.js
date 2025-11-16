/**
 * @file Element ID management for tracking elements in the editor
 */

const HIVE_ID_ATTR = 'data-hive-id';
let idCounter = 0;

/**
 * Generate a unique ID
 * @returns {string}
 */
function generateId() {
	return `hive-${Date.now()}-${idCounter++}`;
}

/**
 * Add hive IDs to all elements in the document
 * @param {Document} doc
 */
export function addHiveIds(doc) {
	if (!doc || !doc.body) return;

	const elements = doc.body.querySelectorAll('*');
	elements.forEach((element) => {
		// Skip overlay elements (they should not have hive IDs)
		if (element.classList.contains('hive-overlay') || 
		    element.classList.contains('hive-highlight') || 
		    element.classList.contains('hive-label')) {
			return;
		}

		// Skip children of overlay elements
		if (element.closest('.hive-overlay, .hive-highlight, .hive-label')) {
			return;
		}

		if (!element.getAttribute(HIVE_ID_ATTR)) {
			element.setAttribute(HIVE_ID_ATTR, generateId());
		}
	});
}

/**
 * Get hive ID from element
 * @param {HTMLElement} element
 * @returns {string|null}
 */
export function getHiveId(element) {
	return element?.getAttribute(HIVE_ID_ATTR);
}

/**
 * Find element by hive ID
 * @param {Document} doc
 * @param {string} hiveId
 * @returns {HTMLElement|null}
 */
export function findByHiveId(doc, hiveId) {
	if (!doc) return null;
	return doc.querySelector(`[${HIVE_ID_ATTR}="${hiveId}"]`);
}

/**
 * Remove all hive IDs from HTML string (for export)
 * @param {string} html
 * @returns {string}
 */
export function removeHiveIds(html) {
	// Remove data-hive-id attributes
	return html.replace(/\s*data-hive-id="[^"]*"/g, '');
}

/**
 * Get display label for element
 * @param {HTMLElement} element
 * @returns {string}
 */
export function getElementLabel(element) {
	if (!element) return '';

	const parts = [element.tagName.toLowerCase()];

	// Add user-defined ID if exists
	if (element.id) {
		parts.push(`#${element.id}`);
	}

	// Add hive ID
	const hiveId = getHiveId(element);
	if (hiveId) {
		parts.push(`[${hiveId}]`);
	}

	// Add first class if exists
	const className = typeof element.className === 'string' 
		? element.className 
		: (element.className?.baseVal || '');
	
	if (className) {
		const firstClass = className.split(' ').filter(Boolean)[0];
		if (firstClass) {
			parts.push(`.${firstClass}`);
		}
	}

	return parts.join('');
}

/**
 * Reset ID counter (useful for testing)
 */
export function resetIdCounter() {
	idCounter = 0;
}
