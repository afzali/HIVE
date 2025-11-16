/**
 * @file DOM utility functions for element manipulation
 */

/**
 * Get the path to an element from the root
 * @param {HTMLElement} element
 * @returns {string[]}
 */
export function getElementPath(element) {
	const path = [];
	let current = element;

	while (current && current.tagName !== 'HTML') {
		const parent = current.parentElement;
		if (!parent) break;

		const siblings = Array.from(parent.children);
		const index = siblings.indexOf(current);

		path.unshift(`${current.tagName.toLowerCase()}:${index}`);
		current = parent;
	}

	return path;
}

/**
 * Find an element by its path
 * @param {Document} root
 * @param {string[]} path
 * @returns {HTMLElement|null}
 */
export function findElementByPath(root, path) {
	try {
		let current = root.body;

		for (const segment of path) {
			const [tag, indexStr] = segment.split(':');
			const index = parseInt(indexStr, 10);

			const children = Array.from(current.children).filter(
				(child) => child.tagName.toLowerCase() === tag
			);

			if (index >= children.length) {
				return null;
			}

			current = children[index];
		}

		return current;
	} catch (error) {
		console.error('Error finding element by path:', error);
		return null;
	}
}

/**
 * Get bounding box for highlight
 * @param {HTMLElement} element
 * @param {DOMRect} iframeRect
 * @returns {import('./types.js').HighlightBox}
 */
export function getElementBoundingBox(element, iframeRect) {
	const rect = element.getBoundingClientRect();

	return {
		top: rect.top,
		left: rect.left,
		width: rect.width,
		height: rect.height
	};
}

/**
 * Apply a style property to an element
 * @param {HTMLElement} element
 * @param {string} property
 * @param {string} value
 */
export function applyStyleProperty(element, property, value) {
	if (!element || !element.style) {
		console.error('Invalid element for style application');
		return;
	}

	try {
		element.style[property] = value;
	} catch (error) {
		console.error(`Error applying style ${property}:`, error);
	}
}

/**
 * Insert a new element
 * @param {HTMLElement} parent
 * @param {string} tag
 * @param {import('./types.js').InsertPosition} position
 * @returns {HTMLElement}
 */
export function insertElement(parent, tag, position) {
	const newElement = parent.ownerDocument.createElement(tag);

	// Add default content and styling
	newElement.textContent = `New ${tag}`;
	newElement.className = 'p-4 bg-gray-100 border border-gray-300';

	switch (position) {
		case 'child':
			parent.appendChild(newElement);
			break;
		case 'before':
			parent.parentElement?.insertBefore(newElement, parent);
			break;
		case 'after':
			if (parent.nextSibling) {
				parent.parentElement?.insertBefore(newElement, parent.nextSibling);
			} else {
				parent.parentElement?.appendChild(newElement);
			}
			break;
	}

	return newElement;
}

/**
 * Duplicate an element
 * @param {HTMLElement} element
 * @returns {HTMLElement|null}
 */
export function duplicateElement(element) {
	if (!element || !element.parentElement) {
		console.error('Cannot duplicate element: invalid element or no parent');
		return null;
	}

	try {
		// Clone the element with all children and attributes
		const clone = element.cloneNode(true);

		// Remove any hive-id to avoid duplicates
		if (clone.hasAttribute('data-hive-id')) {
			clone.removeAttribute('data-hive-id');
		}

		// Insert after the original element
		if (element.nextSibling) {
			element.parentElement.insertBefore(clone, element.nextSibling);
		} else {
			element.parentElement.appendChild(clone);
		}

		return clone;
	} catch (error) {
		console.error('Error duplicating element:', error);
		return null;
	}
}

/**
 * Move an element
 * @param {HTMLElement} element
 * @param {import('./types.js').MoveDirection} direction
 * @param {HTMLElement} [target]
 */
export function moveElement(element, direction, target) {
	const parent = element.parentElement;
	if (!parent) return;

	switch (direction) {
		case 'up': {
			const prev = element.previousElementSibling;
			if (prev) {
				parent.insertBefore(element, prev);
			}
			break;
		}
		case 'down': {
			const next = element.nextElementSibling;
			if (next && next.nextSibling) {
				parent.insertBefore(element, next.nextSibling);
			} else if (next) {
				parent.appendChild(element);
			}
			break;
		}
		case 'before': {
			if (target) {
				target.parentElement?.insertBefore(element, target);
			}
			break;
		}
		case 'after': {
			if (target) {
				if (target.nextSibling) {
					target.parentElement?.insertBefore(element, target.nextSibling);
				} else {
					target.parentElement?.appendChild(element);
				}
			}
			break;
		}
		case 'into': {
			if (target) {
				target.appendChild(element);
			}
			break;
		}
	}
}

/**
 * Validate if element can be selected/deleted
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isValidElement(element) {
	if (!element) return false;

	const tag = element.tagName.toUpperCase();
	return tag !== 'HTML' && tag !== 'BODY';
}
