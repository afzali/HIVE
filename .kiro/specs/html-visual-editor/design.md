# Design Document

## Overview

The HTML Visual Editor is a SvelteKit-based web application that provides a browser-first, real-time HTML editing experience. The architecture follows a single-source-of-truth pattern where all HTML content is managed through a central `htmlSource` state variable. The application uses an iframe for rendering, an overlay system for visual interaction, and direct DOM manipulation for instant updates.

### Technology Stack

- **Framework**: SvelteKit with JavaScript (no TypeScript)
- **UI Components**: shadcn-svelte for all UI elements (buttons, inputs, dialogs, etc.)
- **Styling**: Tailwind CSS for editor interface styling
- **Code Editor**: Monaco Editor for HTML editing mode
- **Build Tool**: Vite (included with SvelteKit)

### Key Design Principles

1. **Browser-First**: The browser is both the design environment and the rendering engine
2. **Zero Build Time**: All changes apply directly to the DOM without compilation
3. **Single Source of Truth**: The `htmlSource` variable is the authoritative representation of the HTML document
4. **Progressive Enhancement**: Start with core functionality, add advanced features incrementally
5. **Separation of Concerns**: Clear boundaries between rendering (iframe), interaction (overlay), and editing (panels)
6. **Component-Based UI**: Use shadcn-svelte components for consistent, accessible UI

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SvelteKit Application                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Main Layout                        │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │           Canvas (iframe)                       │ │  │
│  │  │  - Renders HTML Source                          │ │  │
│  │  │  - Full HTML document with head/body            │ │  │
│  │  │  - CDN resources load naturally                 │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │           Overlay Layer                         │ │  │
│  │  │  - Element selection                            │ │  │
│  │  │  - Highlight borders                            │ │  │
│  │  │  - Context menu positioning                     │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────────────────────┐ │  │
│  │  │ Property     │  │  Bottom Toolbar              │ │  │
│  │  │ Panel        │  │  - Mode controls             │ │  │
│  │  │ (Right)      │  │  - Save/Layers/Undo          │ │  │
│  │  └──────────────┘  └──────────────────────────────┘ │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │    Floating Control Button (Bottom Center)      │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### State Management Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Application State                     │
│                                                           │
│  htmlSource (string) ──────────────────────────────────┐ │
│       │                                                 │ │
│       ├──> iframe.srcdoc (render)                       │ │
│       ├──> codeEditor.value (sync)                      │ │
│       └──> save/export operations                       │ │
│                                                           │
│  selectedElement (DOMElement | null)                     │ │
│       │                                                  │ │
│       ├──> Property Panel (display properties)          │ │
│       ├──> Overlay (highlight position)                 │ │
│       └──> Context Menu (position & actions)            │ │
│                                                           │
│  currentMode ('preview' | 'edit' | 'code')               │ │
│       │                                                  │ │
│       ├──> UI visibility (panels, overlay, toolbar)     │ │
│       └──> Interaction behavior                         │ │
│                                                           │
│  viewportSize ({ width, height })                        │ │
│       │                                                  │ │
│       └──> iframe dimensions                            │ │
│                                                           │
│  history (Array<string>)                                 │ │
│       │                                                  │ │
│       └──> Undo/Redo operations                         │ │
└──────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Core Components

#### App Layout (`+page.svelte`)
- Root component managing global state
- Coordinates all child components
- Handles mode switching logic

```javascript
// AppState structure (using JSDoc for documentation)
/**
 * @typedef {Object} AppState
 * @property {string} htmlSource
 * @property {'preview'|'edit'|'code'} currentMode
 * @property {HTMLElement|null} selectedElement
 * @property {ViewportSize} viewportSize
 * @property {HistoryState} history
 */
```

#### Canvas Component (`Canvas.svelte`)
- Renders HTML in an iframe
- Provides access to iframe's contentDocument
- Handles iframe load events
- Uses shadcn-svelte components where applicable

```javascript
// Canvas component props
/**
 * @typedef {Object} CanvasProps
 * @property {string} htmlSource
 * @property {ViewportSize} viewportSize
 * @property {function(Document): void} onLoad
 */
```

#### Overlay Component (`Overlay.svelte`)
- Positioned absolutely over the iframe
- Handles click events for element selection
- Renders highlight borders and context menu
- Only visible in Edit mode

```javascript
// Overlay component props
/**
 * @typedef {Object} OverlayProps
 * @property {Document|null} iframeDocument
 * @property {HTMLElement|null} selectedElement
 * @property {function(HTMLElement): void} onElementSelect
 */

/**
 * @typedef {Object} HighlightBox
 * @property {number} top
 * @property {number} left
 * @property {number} width
 * @property {number} height
 */
```

#### Property Panel (`PropertyPanel.svelte`)
- Right sidebar displaying element properties
- Uses shadcn-svelte Input, Label, Select, and Textarea components
- Grouped controls for different property types
- Immediate DOM updates for style properties
- Debounced updates for text content (300ms or on focusout)
- Visual indicators to distinguish padding from margin

```javascript
// PropertyPanel component props
/**
 * @typedef {Object} PropertyPanelProps
 * @property {HTMLElement|null} selectedElement
 * @property {function(string, any): void} onPropertyChange
 */

/**
 * @typedef {Object} ElementProperties
 * @property {string} tag
 * @property {string} id
 * @property {string[]} classes
 * @property {Object.<string, string>} attributes
 * @property {Object} styles
 * @property {Object} styles.padding
 * @property {string} styles.padding.top
 * @property {string} styles.padding.right
 * @property {string} styles.padding.bottom
 * @property {string} styles.padding.left
 * @property {Object} styles.margin
 * @property {string} styles.margin.top
 * @property {string} styles.margin.right
 * @property {string} styles.margin.bottom
 * @property {string} styles.margin.left
 * @property {string} styles.width
 * @property {string} styles.height
 * @property {string} styles.display
 * @property {string} [textContent]
 */
```

#### Code Editor Component (`CodeEditor.svelte`)
- Full-screen code editor using Monaco Editor
- Syntax highlighting for HTML
- Uses shadcn-svelte Button components for Apply and Cancel

```javascript
// CodeEditor component props
/**
 * @typedef {Object} CodeEditorProps
 * @property {string} htmlSource
 * @property {function(string): void} onApply
 * @property {function(): void} onCancel
 */
```

#### Floating Control Button (`FloatingButton.svelte`)
- Fixed position at bottom center
- Uses shadcn-svelte Button and DropdownMenu components
- Expandable menu for mode selection
- Responsive size options

```javascript
// FloatingButton component props
/**
 * @typedef {Object} FloatingButtonProps
 * @property {string} currentMode
 * @property {function(string): void} onModeChange
 * @property {function(ViewportSize): void} onResponsiveModeChange
 */
```

#### Bottom Toolbar (`BottomToolbar.svelte`)
- Save, Layers, Undo, Redo controls
- Uses shadcn-svelte Button components
- Only visible in Edit mode

// BottomToolbar component props
/**
 * @typedef {Object} BottomToolbarProps
 * @property {function(): void} onSave
 * @property {function(): void} onUndo
 * @property {function(): void} onRedo
 * @property {function(): void} onToggleLayers
 * @property {boolean} canUndo
 * @property {boolean} canRedo
 */
```

#### Context Menu (`ContextMenu.svelte`)
- Positioned near selected element
- Uses shadcn-svelte DropdownMenu or Popover components
- Quick actions: duplicate, delete, add, move

```javascript
// ContextMenu component props
/**
 * @typedef {Object} ContextMenuProps
 * @property {Object} position
 * @property {number} position.x
 * @property {number} position.y
 * @property {function(): void} onDuplicate
 * @property {function(): void} onDelete
 * @property {function('child'|'before'|'after'): void} onAdd
 * @property {function('up'|'down'|'before'|'after'|'into'): void} onMove
 */
```

#### Layers Panel (`LayersPanel.svelte`)
- Tree view of DOM structure
- Uses shadcn-svelte Collapsible or Accordion components
- Collapsible nodes
- Click to select element

```javascript
// LayersPanel component props
/**
 * @typedef {Object} LayersPanelProps
 * @property {HTMLElement|null} rootElement
 * @property {HTMLElement|null} selectedElement
 * @property {function(HTMLElement): void} onElementSelect
 */

/**
 * @typedef {Object} LayerNode
 * @property {HTMLElement} element
 * @property {string} tag
 * @property {string} [id]
 * @property {string[]} classes
 * @property {LayerNode[]} children
 * @property {boolean} isExpanded
 */
```

### 2. Utility Modules

#### DOM Utilities (`lib/dom-utils.js`)
```javascript
/**
 * Get the path to an element from the root
 * @param {HTMLElement} element
 * @returns {string[]}
 */
export function getElementPath(element) { /* ... */ }

/**
 * Find an element by its path
 * @param {Document} root
 * @param {string[]} path
 * @returns {HTMLElement|null}
 */
export function findElementByPath(root, path) { /* ... */ }

/**
 * Get bounding box for highlight
 * @param {HTMLElement} element
 * @param {DOMRect} iframeRect
 * @returns {HighlightBox}
 */
export function getElementBoundingBox(element, iframeRect) { /* ... */ }

/**
 * Apply a style property to an element immediately
 * Updates the element's inline style directly
 * @param {HTMLElement} element
 * @param {string} property
 * @param {string} value
 */
export function applyStyleProperty(element, property, value) { /* ... */ }

/**
 * Debounce a function call
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait) { /* ... */ }

/**
 * Insert a new element
 * @param {HTMLElement} parent
 * @param {string} tag
 * @param {'child'|'before'|'after'} position
 * @returns {HTMLElement}
 */
export function insertElement(parent, tag, position) { /* ... */ }

/**
 * Duplicate an element
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
export function duplicateElement(element) { /* ... */ }

/**
 * Move an element
 * @param {HTMLElement} element
 * @param {'up'|'down'|'before'|'after'|'into'} direction
 * @param {HTMLElement} [target]
 */
export function moveElement(element, direction, target) { /* ... */ }
```

#### HTML Utilities (`lib/html-utils.js`)
```javascript
/**
 * Extract HTML from iframe document
 * @param {Document} iframeDocument
 * @returns {string}
 */
export function extractHTML(iframeDocument) { /* ... */ }

/**
 * Validate HTML syntax
 * @param {string} html
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateHTML(html) { /* ... */ }

/**
 * Sanitize HTML content
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHTML(html) { /* ... */ }

/**
 * Create default element HTML
 * @param {string} tag
 * @returns {string}
 */
export function createDefaultElement(tag) { /* ... */ }
```

#### History Manager (`lib/history.js`)
```javascript
/**
 * Manages undo/redo history
 */
export class HistoryManager {
  #history = [];
  #currentIndex = -1;
  #maxSize = 20;

  /**
   * @param {number} maxSize
   */
  constructor(maxSize = 20) {
    this.#maxSize = maxSize;
  }

  /**
   * @param {string} state
   */
  push(state) { /* ... */ }

  /**
   * @returns {string|null}
   */
  undo() { /* ... */ }

  /**
   * @returns {string|null}
   */
  redo() { /* ... */ }

  /**
   * @returns {boolean}
   */
  canUndo() { /* ... */ }

  /**
   * @returns {boolean}
   */
  canRedo() { /* ... */ }

  clear() { /* ... */ }
}
```

#### Storage Utilities (`lib/storage.js`)
```javascript
/**
 * Save to localStorage
 * @param {string} key
 * @param {string} value
 */
export function saveToLocalStorage(key, value) { /* ... */ }

/**
 * Load from localStorage
 * @param {string} key
 * @returns {string|null}
 */
export function loadFromLocalStorage(key) { /* ... */ }

/**
 * Download HTML as file
 * @param {string} html
 * @param {string} filename
 */
export function downloadHTML(html, filename) { /* ... */ }

/**
 * Auto-save HTML
 * @param {string} html
 */
export function autoSave(html) { /* ... */ }
```

## Data Models

### ViewportSize
```javascript
/**
 * @typedef {'desktop'|'tablet'|'mobile'|'custom'} ViewportPreset
 */

/**
 * @typedef {Object} ViewportSize
 * @property {ViewportPreset} preset
 * @property {number} width
 * @property {number} height
 */

/** @type {Object.<string, {width: number, height: number}>} */
export const VIEWPORT_PRESETS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};
```

### HistoryState
```javascript
/**
 * @typedef {Object} HistoryState
 * @property {string[]} past
 * @property {string} present
 * @property {string[]} future
 */
```

### ElementAction
```javascript
/**
 * @typedef {'add'|'delete'|'duplicate'|'move'|'modify'} ActionType
 */

/**
 * @typedef {Object} ElementAction
 * @property {ActionType} type
 * @property {string[]} elementPath
 * @property {number} timestamp
 * @property {any} [data]
 */
```

## Error Handling

### Error Categories

1. **HTML Parsing Errors**
   - Invalid HTML syntax in Code mode
   - Malformed tags or attributes
   - Strategy: Display error message, prevent Canvas update, keep previous valid state

2. **DOM Manipulation Errors**
   - Attempting to delete root elements
   - Invalid element paths
   - Strategy: Show user-friendly error toast (using shadcn-svelte Toast), log to console, revert to previous state

3. **iframe Communication Errors**
   - Cross-origin issues (shouldn't occur with srcdoc)
   - iframe not loaded
   - Strategy: Wait for iframe load event, implement retry logic

4. **Storage Errors**
   - LocalStorage quota exceeded
   - Save/download failures
   - Strategy: Notify user, offer alternative save methods

### Error Handling Implementation

```javascript
/**
 * Custom error class for editor errors
 */
class EditorError extends Error {
  /**
   * @param {string} message
   * @param {'parsing'|'dom'|'iframe'|'storage'} category
   * @param {boolean} recoverable
   */
  constructor(message, category, recoverable = true) {
    super(message);
    this.category = category;
    this.recoverable = recoverable;
  }
}

/**
 * Handle editor errors
 * @param {EditorError} error
 */
function handleError(error) {
  // Log to console
  console.error(`[${error.category}]`, error.message);
  
  // Show user notification using shadcn-svelte Toast
  showToast({
    type: 'error',
    message: error.message,
    duration: 5000
  });
  
  // Attempt recovery if possible
  if (error.recoverable) {
    // Revert to last known good state
    restoreFromHistory();
  }
}
```

## Testing Strategy

### Unit Testing

**Tools**: Vitest + Testing Library

**Coverage Areas**:
- DOM utility functions (element selection, manipulation, path finding)
- HTML utility functions (validation, sanitization, extraction)
- History manager (undo/redo logic)
- Storage utilities (save/load operations)

**Example Test Cases**:
```javascript
describe('DOM Utilities', () => {
  test('getElementPath returns correct path for nested element', () => {
    // Test implementation
  });
  
  test('findElementByPath locates element correctly', () => {
    // Test implementation
  });
  
  test('insertElement adds child at correct position', () => {
    // Test implementation
  });
});
```

### Component Testing

**Tools**: Vitest + Testing Library + Playwright Component Testing

**Coverage Areas**:
- Property Panel updates DOM correctly (using shadcn-svelte components)
- Context Menu actions trigger correct callbacks
- Layers Panel displays tree structure accurately
- Code Editor applies changes correctly

**Example Test Cases**:
```javascript
describe('PropertyPanel', () => {
  test('displays correct properties for selected element', () => {
    // Test implementation
  });
  
  test('updates element padding when user changes value', () => {
    // Test implementation
  });
});
```

### Integration Testing

**Tools**: Playwright

**Coverage Areas**:
- Mode switching (Preview → Edit → Code)
- Element selection and property editing flow
- Add/duplicate/delete element operations
- Save and restore HTML
- Responsive mode switching
- Undo/redo operations

**Example Test Cases**:
```javascript
describe('Edit Mode Flow', () => {
  test('user can select element, modify padding, and see changes', async () => {
    // Test implementation
  });
  
  test('user can add new element and it appears in Canvas', async () => {
    // Test implementation
  });
});
```

### Manual Testing Checklist

- [ ] Load Google Stitch output and verify it renders correctly
- [ ] Test with various CDN resources (Tailwind, Bootstrap, Font Awesome)
- [ ] Verify all interactive elements work in Preview mode
- [ ] Test element selection accuracy with nested elements
- [ ] Verify property changes apply immediately
- [ ] Test responsive modes with complex layouts
- [ ] Verify saved HTML opens correctly in external browser
- [ ] Test undo/redo with multiple operations
- [ ] Verify Layers panel navigation with deep DOM trees
- [ ] Verify shadcn-svelte components render correctly across all panels

## Implementation Phases

### Phase 1: Core Infrastructure (MVP Foundation)
- SvelteKit project setup with JavaScript
- Install and configure shadcn-svelte
- Configure Tailwind CSS
- Basic Canvas component with iframe rendering
- HTML Source state management
- Mode switching (Preview/Edit/Code)
- Floating Control Button using shadcn-svelte Button

### Phase 2: Edit Mode Basics
- Overlay layer implementation
- Element selection with click
- Basic highlight border
- Property Panel structure using shadcn-svelte components
- Simple property editing (text, classes) with shadcn-svelte Input

### Phase 3: Advanced Editing
- Full Property Panel controls using shadcn-svelte Input, Select, Label
- Context Menu using shadcn-svelte DropdownMenu
- Add/duplicate/delete operations
- DOM manipulation utilities

### Phase 4: Code Mode
- Monaco Editor integration
- HTML validation
- Apply/Cancel functionality using shadcn-svelte Button
- Sync between Code and Edit modes

### Phase 5: Additional Features
- Layers Panel with tree view using shadcn-svelte Collapsible
- Undo/Redo implementation
- Responsive mode switching
- Save/download functionality

### Phase 6: Polish & Optimization
- Error handling improvements
- Performance optimization
- UI/UX refinements
- Testing and bug fixes

## Technical Decisions & Rationales

### Why SvelteKit?
- **Reactivity**: Svelte's reactive system is perfect for real-time DOM updates
- **Performance**: Compiled framework with minimal runtime overhead
- **Developer Experience**: Simple syntax, less boilerplate than React
- **SSR Capability**: Can add server-side features later if needed
- **JavaScript-First**: Works seamlessly with JavaScript without TypeScript overhead

### Why shadcn-svelte?
- **Accessible**: Built on Radix UI primitives with ARIA compliance
- **Customizable**: Components are copied into project, fully customizable
- **Tailwind Integration**: Designed to work perfectly with Tailwind CSS
- **Consistent Design**: Professional, modern UI out of the box
- **No Bundle Bloat**: Only include components you use

### Why Tailwind CSS?
- **Utility-First**: Rapid UI development with utility classes
- **Consistency**: Design system built-in with spacing, colors, typography
- **Performance**: PurgeCSS removes unused styles in production
- **Responsive**: Mobile-first responsive design made easy
- **Customizable**: Easy to extend with custom design tokens

### Why iframe for Canvas?
- **Isolation**: Complete CSS and JavaScript isolation from editor UI
- **Native Rendering**: Browser renders HTML exactly as it would in production
- **CDN Support**: External resources load without CORS issues
- **Full Document**: Can render complete HTML including head and body

### Why Monaco Editor?
- **Industry Standard**: Used by VS Code, familiar to developers
- **Rich Features**: Syntax highlighting, IntelliSense, error detection
- **Customizable**: Can configure for HTML-specific features
- **Performance**: Handles large documents efficiently

### Why Direct DOM Manipulation?
- **Instant Feedback**: No build step, changes appear immediately
- **Simplicity**: No virtual DOM diffing, direct element updates
- **Predictability**: What you change is exactly what updates
- **Browser-Native**: Leverages browser's optimized DOM APIs

### Why JavaScript (not TypeScript)?
- **Simplicity**: Faster development without type definitions
- **Flexibility**: Dynamic typing for rapid prototyping
- **JSDoc**: Can still document types with JSDoc comments
- **Less Tooling**: Simpler build process and configuration

### State Management Approach
- **No External Library**: Svelte stores are sufficient for this application
- **Single Source of Truth**: htmlSource is the authoritative state
- **Derived State**: Selected element, highlight position derived from htmlSource
- **History as State**: Undo/redo implemented as state snapshots

## Performance Considerations

### Optimization Strategies

1. **Debounced Updates**: Property changes debounced to 100ms to avoid excessive DOM updates
2. **Lazy Rendering**: Layers Panel uses virtual scrolling for large DOM trees
3. **Efficient Selection**: Element path caching to avoid repeated DOM traversals
4. **History Compression**: Store only diffs for undo/redo instead of full HTML snapshots (future enhancement)
5. **Code Editor Lazy Load**: Monaco Editor loaded only when Code mode is activated

### Performance Targets

- Mode switching: < 300ms
- Element selection: < 50ms
- Property update: < 100ms
- Canvas re-render: < 500ms
- Undo/Redo: < 200ms

## Security Considerations

### XSS Prevention
- HTML sanitization for user-provided content
- CSP headers for the main application
- iframe sandbox attributes (carefully configured to allow necessary features)

### Safe DOM Manipulation
- Validate element paths before manipulation
- Prevent deletion of critical elements (html, body)
- Sanitize attribute values before applying

### Storage Security
- LocalStorage data validation on load
- No sensitive data stored in browser storage
- Clear indication when auto-save is active

## Performance Considerations

### Optimization Strategies

1. **Immediate Style Updates**: Style property changes apply immediately to element.style for instant visual feedback
2. **Debounced HTML Sync**: HTML Source synchronization debounced to 500ms to avoid excessive updates
3. **Debounced Text Updates**: Text content changes debounced to 300ms or applied on focusout
4. **Lazy Rendering**: Layers Panel uses virtual scrolling for large DOM trees
5. **Efficient Selection**: Element path caching to avoid repeated DOM traversals
6. **History Compression**: Store only diffs for undo/redo instead of full HTML snapshots (future enhancement)
7. **Code Editor Lazy Load**: Monaco Editor loaded only when Code mode is activated

### Performance Targets

- Mode switching: < 300ms
- Element selection: < 50ms
- Style property update: Immediate (< 16ms)
- HTML Source sync: < 500ms
- Text content update: 300ms debounce or immediate on focusout
- Canvas re-render: < 500ms
- Undo/Redo: < 200ms

## Future Enhancements (Post-MVP)

1. **Advanced Drag & Drop**: Visual drag-and-drop for element repositioning
2. **Component Library**: Pre-built component templates
3. **CSS Editor**: Dedicated CSS editing panel
4. **JavaScript Support**: Inline script editing and event handler management
5. **Collaboration**: Real-time multi-user editing
6. **Version Control**: Git-like versioning for HTML documents
7. **Export Options**: Export to various formats (React, Vue, plain HTML)
8. **AI Assistance**: AI-powered layout suggestions and code generation
9. **Accessibility Checker**: Built-in WCAG compliance validation
10. **Performance Profiler**: Analyze page performance metrics

## Conclusion

This design provides a solid foundation for building a browser-first HTML Visual Editor that combines the visual editing experience of Divi with the precision of code editing. The architecture prioritizes simplicity, performance, and user experience while maintaining extensibility for future enhancements. The single-source-of-truth pattern ensures consistency across all editing modes, and the direct DOM manipulation approach delivers the instant feedback users expect from modern design tools.
