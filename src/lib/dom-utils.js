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
	console.log('🎨 applyStyleProperty called:', { element, property, value });
	
	if (!element || !element.style) {
		console.error('🎨 Invalid element for style application:', element);
		return;
	}

	try {
		console.log('🎨 Before setting style:', element.style[property]);
		
		// Handle empty values by removing the property
		if (!value || value.trim() === '') {
			element.style.removeProperty(property);
			console.log('🎨 Removed property:', property);
		} else {
			// Convert camelCase to kebab-case for CSS properties
			const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
			element.style.setProperty(cssProperty, value);
			console.log('🎨 Set property:', cssProperty, '=', value);
		}
		
		console.log('🎨 After setting style:', element.style[property]);
		console.log('🎨 Full style object:', element.style.cssText);
		
		// Force a repaint to ensure the change is visible
		element.offsetHeight;
		
	} catch (error) {
		console.error(`🎨 Error applying style ${property}:`, error);
	}
}

/**
 * Insert a new element
 * @param {HTMLElement} referenceElement - The element to insert relative to
 * @param {string} tag - Tag name for new element
 * @param {string} position - Where to insert: 'child', 'before', 'after'
 * @returns {HTMLElement|null}
 */
export function insertElement(referenceElement, tag, position) {
	if (!referenceElement || !referenceElement.ownerDocument) {
		console.error('Invalid reference element');
		return null;
	}

	try {
		const newElement = referenceElement.ownerDocument.createElement(tag);

		// Add default content based on tag type
		switch (tag.toLowerCase()) {
			case 'img':
				newElement.src = 'https://via.placeholder.com/150';
				newElement.alt = 'Placeholder image';
				break;
			case 'a':
				newElement.href = '#';
				newElement.textContent = 'Link';
				break;
			case 'button':
				newElement.textContent = 'Button';
				break;
			case 'input':
				newElement.type = 'text';
				newElement.placeholder = 'Enter text';
				break;
			case 'h1':
			case 'h2':
			case 'h3':
				newElement.textContent = `Heading ${tag.charAt(1)}`;
				break;
			case 'p':
				newElement.textContent = 'Paragraph text';
				break;
			default:
				newElement.textContent = `New ${tag}`;
		}

		// Add default styling
		newElement.style.padding = '8px';
		newElement.style.margin = '4px';
		newElement.style.border = '1px dashed #ccc';

		// Insert based on position
		switch (position) {
			case 'child':
				referenceElement.appendChild(newElement);
				break;
			case 'before':
				if (referenceElement.parentElement) {
					referenceElement.parentElement.insertBefore(newElement, referenceElement);
				}
				break;
			case 'after':
				if (referenceElement.nextSibling) {
					referenceElement.parentElement?.insertBefore(newElement, referenceElement.nextSibling);
				} else {
					referenceElement.parentElement?.appendChild(newElement);
				}
				break;
			default:
				console.error('Invalid position:', position);
				return null;
		}

		return newElement;
	} catch (error) {
		console.error('Error inserting element:', error);
		return null;
	}
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

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
