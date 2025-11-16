/**
 * @file Type definitions for HTML Visual Editor
 * All types are defined using JSDoc for documentation and IDE support
 */

/**
 * @typedef {'preview'|'edit'|'code'} EditorMode
 * The current mode of the editor
 */

/**
 * @typedef {'desktop'|'tablet'|'mobile'|'custom'} ViewportPreset
 * Predefined viewport size presets
 */

/**
 * @typedef {Object} ViewportSize
 * @property {ViewportPreset} preset - The selected viewport preset
 * @property {number} width - Width in pixels
 * @property {number} height - Height in pixels
 */

/**
 * Predefined viewport dimensions
 * @type {Object.<string, {width: number, height: number}>}
 */
export const VIEWPORT_PRESETS = {
	desktop: { width: 1920, height: 1080 },
	tablet: { width: 768, height: 1024 },
	mobile: { width: 375, height: 667 }
};

/**
 * @typedef {Object} HighlightBox
 * @property {number} top - Top position in pixels
 * @property {number} left - Left position in pixels
 * @property {number} width - Width in pixels
 * @property {number} height - Height in pixels
 */

/**
 * @typedef {Object} PaddingValues
 * @property {string} top - Top padding (e.g., "10px")
 * @property {string} right - Right padding
 * @property {string} bottom - Bottom padding
 * @property {string} left - Left padding
 */

/**
 * @typedef {Object} ElementStyles
 * @property {PaddingValues} padding - Padding values for all sides
 * @property {string} width - Width value (e.g., "100px", "50%", "auto")
 * @property {string} height - Height value
 * @property {string} display - Display property (block, inline, flex, grid, none)
 * @property {string} [alignItems] - Flex alignment (for flex containers)
 * @property {string} [justifyContent] - Flex justification (for flex containers)
 */

/**
 * @typedef {Object} ElementProperties
 * @property {string} tag - HTML tag name
 * @property {string} id - Element ID attribute
 * @property {string[]} classes - Array of CSS class names
 * @property {Object.<string, string>} attributes - Custom HTML attributes
 * @property {ElementStyles} styles - Style properties
 * @property {string} [textContent] - Text content (if element contains text)
 */

/**
 * @typedef {Object} HistoryState
 * @property {string[]} past - Array of past HTML states
 * @property {string} present - Current HTML state
 * @property {string[]} future - Array of future HTML states (for redo)
 */

/**
 * @typedef {'add'|'delete'|'duplicate'|'move'|'modify'} ActionType
 * Type of action performed on an element
 */

/**
 * @typedef {Object} ElementAction
 * @property {ActionType} type - Type of action
 * @property {string[]} elementPath - Path to the element in DOM
 * @property {number} timestamp - Timestamp of the action
 * @property {any} [data] - Additional action data
 */

/**
 * @typedef {Object} AppState
 * @property {string} htmlSource - The authoritative HTML source
 * @property {EditorMode} currentMode - Current editor mode
 * @property {HTMLElement|null} selectedElement - Currently selected element
 * @property {ViewportSize} viewportSize - Current viewport size
 * @property {HistoryState} history - Undo/redo history
 */

/**
 * @typedef {Object} LayerNode
 * @property {HTMLElement} element - The DOM element
 * @property {string} tag - Tag name
 * @property {string} [id] - Element ID
 * @property {string[]} classes - CSS classes
 * @property {LayerNode[]} children - Child nodes
 * @property {boolean} isExpanded - Whether the node is expanded in tree view
 */

/**
 * @typedef {Object} ContextMenuPosition
 * @property {number} x - X coordinate in pixels
 * @property {number} y - Y coordinate in pixels
 */

/**
 * @typedef {'child'|'before'|'after'} InsertPosition
 * Position to insert a new element relative to target
 */

/**
 * @typedef {'up'|'down'|'before'|'after'|'into'} MoveDirection
 * Direction to move an element
 */
