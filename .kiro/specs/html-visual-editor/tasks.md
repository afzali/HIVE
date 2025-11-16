# Implementation Plan

- [x] 1. Initialize SvelteKit project and configure development environment



  - Create new SvelteKit project with JavaScript (no TypeScript)
  - Configure Vite for optimal development experience
  - Set up project structure with lib, components, and routes directories
  - Install and configure Tailwind CSS
  - Install and configure shadcn-svelte components
  - Install Monaco Editor dependency
  - _Requirements: 11.1, 11.2, 11.3, Technical Constraints_

- [x] 2. Implement core state management and data models


  - [x] 2.1 Create JSDoc type definitions for all data models


    - Define AppState, ViewportSize, HistoryState, ElementProperties with JSDoc
    - Define ViewportPreset constants (desktop, tablet, mobile dimensions)
    - Create ElementAction and HighlightBox type definitions with JSDoc
    - _Requirements: 1.1, 2.1, 10.3, 10.4, 10.5_
  
  - [x] 2.2 Implement Svelte stores for global state


    - Create htmlSource store with initial empty HTML template
    - Create currentMode store with 'preview' as default
    - Create selectedElement store (nullable)
    - Create viewportSize store with desktop preset as default
    - _Requirements: 1.1, 2.1, 10.3_
  
  - [x] 2.3 Implement HistoryManager class for undo/redo


    - Write HistoryManager class in JavaScript with push, undo, redo, canUndo, canRedo methods
    - Use private fields (#) for encapsulation
    - Implement circular buffer with max size of 20
    - Create history store wrapping HistoryManager instance
    - _Requirements: 13.2, 13.3, 13.4, 13.5_

- [x] 3. Build Canvas component with iframe rendering



  - [x] 3.1 Create Canvas.svelte component


    - Implement iframe element with dynamic srcdoc binding to htmlSource
    - Add reactive viewport size styling (width and height)
    - Implement onLoad event handler to expose iframe contentDocument
    - Add error boundary for iframe loading failures
    - _Requirements: 1.1, 1.2, 11.3, 11.4, 11.5_
  
  - [x] 3.2 Implement HTML loading and initialization


    - Create default HTML template with basic structure (html, head, body)
    - Implement paste HTML functionality in initial load screen
    - Add validation to ensure complete HTML document structure
    - Handle iframe load event and emit ready state
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  
  - [ ]* 3.3 Write unit tests for Canvas component
    - Test iframe renders with provided htmlSource
    - Test viewport size changes update iframe dimensions
    - Test onLoad callback fires with valid contentDocument
    - _Requirements: 1.1, 11.3_

- [x] 4. Implement mode switching system with Floating Control Button



  - [x] 4.1 Create FloatingButton.svelte component


    - Design circular button using shadcn-svelte Button with icon positioned at bottom center
    - Implement expandable menu using shadcn-svelte DropdownMenu with Preview, Edit, Code options
    - Add responsive mode submenu (Desktop, Tablet, Mobile, Custom)
    - Style with Tailwind CSS fixed positioning and z-index layering
    - _Requirements: 2.3, 2.1_

  
  - [x] 4.2 Implement mode switching logic

    - Create mode change handler that updates currentMode store
    - Implement smooth transitions between modes (300ms)
    - Preserve htmlSource state during mode transitions
    - Add visual feedback for active mode
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 4.3 Implement responsive mode switching

    - Create viewport size change handler
    - Update viewportSize store with selected preset dimensions
    - Implement custom size input dialog for Custom mode
    - Apply new dimensions to Canvas iframe
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 5. Build Overlay system for element selection in Edit mode




  - [x] 5.1 Create Overlay.svelte component

    - Position absolutely over Canvas with pointer-events
    - Implement click event handler to capture element selection
    - Calculate clicked element from mouse coordinates relative to iframe
    - Update selectedElement store on element click
    - _Requirements: 4.1, 4.2_
  

  - [x] 5.2 Implement element highlighting


    - Calculate bounding box of selected element relative to iframe
    - Render colored border (blue, 2px) around selected element
    - Update highlight position reactively when element dimensions change
    - Handle scroll events to maintain highlight position
    - _Requirements: 4.2, 4.5_
  
  - [x] 5.3 Create DOM utility functions in JavaScript


    - Write getElementPath function to generate unique element path
    - Write findElementByPath to locate element from path array
    - Write getElementBoundingBox to calculate highlight coordinates
    - Implement element validation to prevent selecting html/body
    - Add JSDoc comments for all functions
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 5.4 Write unit tests for Overlay and DOM utilities
    - Test element selection from click coordinates
    - Test getElementPath generates correct path for nested elements
    - Test findElementByPath locates correct element
    - Test highlight box calculation accuracy
    - _Requirements: 4.2_

- [x] 6. Implement Property Panel for element editing



  - [x] 6.1 Create PropertyPanel.svelte component structure


    - Design right sidebar layout using Tailwind CSS
    - Use shadcn-svelte Collapsible for collapsible sections
    - Implement visibility toggle based on selectedElement state
    - Create sections: HTML Properties, Styles, Typography
    - Style with fixed positioning and scrollable content
    - _Requirements: 4.3, 5.1_
  
  - [x] 6.2 Implement HTML properties editor

    - Display element tag name using shadcn-svelte Label (read-only for MVP)
    - Create shadcn-svelte Input field for id attribute with live update
    - Implement class list editor with shadcn-svelte Badge and Button for add/remove
    - Create generic attributes editor using shadcn-svelte Input for custom attributes
    - Apply changes directly to selectedElement DOM node
    - _Requirements: 5.6, 4.4_
  
  - [x] 6.3 Implement style properties editor

    - Create four shadcn-svelte Input components for padding (top, right, bottom, left)
    - Create width and height inputs using shadcn-svelte Input with Select for unit selector (px, %, auto)
    - Create display property using shadcn-svelte Select (block, inline, flex, grid, none)
    - Implement alignment controls for flex containers using shadcn-svelte Select
    - Apply style changes directly to element.style with 100ms debounce
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  

  - [x] 6.4 Implement text content editor


    - Detect if selected element contains text content
    - Create shadcn-svelte Textarea for editing textContent or innerHTML
    - Implement live preview with debounced updates
    - Handle special characters and HTML entities
    - _Requirements: 5.5_
  
  - [x] 6.5 Create property change handler

    - Write applyStyleProperty utility function
    - Implement immediate DOM update with error handling (no reload)
    - Implement debounced HTML extraction (500ms) to sync htmlSource store
    - Record change in history for undo/redo
    - Maintain scroll position and selected element during sync
    - _Requirements: 5.4, 12.1, 12.3, 12.4, 12.5_

  - [x] 6.6 Implement HTML sync utilities
    - Create extractHTMLFromIframe utility function to get complete HTML using documentElement.outerHTML
    - Create debounced syncHTMLSource function (500ms delay) to update htmlSource store
    - Preserve scroll position and selectedElement during sync
    - Add error handling for iframe access issues
    - Export utilities for use in property changes and element operations
    - Integrate syncHTMLSource into all PropertyPanel change handlers
    - _Requirements: 8.1, 12.1, 12.4, 12.5_
  
  - [ ]* 6.7 Write component tests for PropertyPanel
    - Test property panel displays correct values for selected element
    - Test padding changes apply to element style
    - Test class list editor adds and removes classes
    - Test text editor updates element content
    - _Requirements: 5.1, 5.4_

- [-] 7. Implement Context Menu for quick element actions


  - [x] 7.1 Create ContextMenu.svelte component


    - Use shadcn-svelte DropdownMenu or Popover for menu structure
    - Design compact menu with icon buttons using shadcn-svelte Button
    - Position near selected element using absolute positioning
    - Implement actions: Duplicate, Delete, Add, Move
    - Add submenu for Add (Child, Before, After) and Move options
    - _Requirements: 4.4_
  
  - [x] 7.2 Implement duplicate element action
    - Write duplicateElement utility function using cloneNode
    - Insert duplicated element immediately after original in iframe DOM
    - Update selectedElement to newly created element
    - Trigger debounced HTML sync to update htmlSource
    - Add hive IDs to cloned element
    - _Requirements: 7.1, 12.2_
  
  - [x] 7.3 Implement delete element action
    - Validate element is not html or body before deletion
    - Remove element from iframe DOM using removeChild
    - Clear selectedElement state
    - Trigger debounced HTML sync to update htmlSource
    - Add error logging (toast will be added later)
    - _Requirements: 7.2, 7.5, 12.2_
  
  - [x] 7.4 Implement add element actions
    - Create element type selector using shadcn-svelte Dialog or Select (div, section, button, a, img, input, h1, p, span)
    - Write insertElement utility in JavaScript for Child, Before, After positions
    - Generate default element structure with placeholder content and basic styling
    - Insert element into iframe DOM at specified position
    - Auto-select newly created element
    - Trigger debounced HTML sync to update htmlSource
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 12.2_
  
  - [x] 7.5 Implement move element actions
    - Write moveElement utility for Up, Down, Before, After, Into Parent
    - Validate move operation is possible (e.g., has sibling for Up/Down)
    - Update iframe DOM structure using insertBefore and appendChild
    - Maintain element selection after move
    - Trigger debounced HTML sync to update htmlSource
    - _Requirements: 7.3, 7.4, 12.2, 12.5_
  
  - [ ]* 7.6 Write unit tests for element manipulation utilities
    - Test duplicateElement creates exact copy
    - Test insertElement adds element at correct position
    - Test moveElement repositions element correctly
    - Test delete validation prevents removing body
    - _Requirements: 6.2, 6.3, 7.2, 7.3_

- [ ] 8. Build Code Editor mode with Monaco Editor
  - [ ] 8.1 Create CodeEditor.svelte component
    - Integrate Monaco Editor with HTML language mode
    - Configure editor options: line numbers, minimap, syntax highlighting
    - Implement lazy loading to improve initial page load
    - Style as full-screen overlay using Tailwind CSS when Code mode is active
    - Use shadcn-svelte Button for Apply and Cancel actions
    - _Requirements: 3.1_
  
  - [ ] 8.2 Implement HTML editing and validation
    - Bind editor value to htmlSource store
    - Implement HTML syntax validation using Monaco's built-in validator
    - Display validation errors inline in editor
    - Create Apply button to update Canvas with new HTML
    - Create Cancel button to revert changes
    - _Requirements: 3.2, 3.5_
  
  - [ ] 8.3 Implement sync between Code and Edit modes
    - Update editor content when htmlSource changes from Edit mode
    - Preserve cursor position when switching modes
    - Implement auto-formatting on Apply
    - Record HTML changes in history
    - _Requirements: 3.2, 3.3, 8.3_
  
  - [ ]* 8.4 Write integration tests for Code Editor
    - Test pasting HTML and applying updates Canvas
    - Test validation prevents invalid HTML from applying
    - Test switching from Edit to Code preserves changes
    - _Requirements: 3.2, 3.3, 3.5_

- [ ] 9. Implement Bottom Toolbar with Save and Layers
  - [ ] 9.1 Create BottomToolbar.svelte component
    - Design toolbar with button group layout using Tailwind CSS
    - Use shadcn-svelte Button components for all actions
    - Position at bottom of viewport with fixed positioning
    - Show only in Edit mode
    - Implement buttons: Save, Layers, Undo, Redo
    - _Requirements: 13.1_
  
  - [ ] 9.2 Implement Save functionality
    - Create extractHTML utility to get complete HTML from iframe using documentElement.outerHTML
    - Ensure htmlSource is already synced via debounced updates from property changes
    - Implement downloadHTML utility for file export using Blob and download link
    - Add auto-save to localStorage with debouncing (5 seconds)
    - Sync Code Editor content if in Code mode
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 9.3 Implement Undo and Redo functionality
    - Connect Undo button to history.undo() method
    - Connect Redo button to history.redo() method
    - Update htmlSource and re-render Canvas on undo/redo
    - Disable buttons based on canUndo/canRedo state
    - Restore selectedElement state if possible after undo/redo
    - _Requirements: 13.1, 13.3, 13.4, 13.6, 13.7_
  
  - [ ]* 9.4 Write integration tests for Save and Undo/Redo
    - Test Save extracts complete HTML including head and body
    - Test Undo reverts last change
    - Test Redo reapplies undone change
    - Test Undo/Redo buttons disable correctly
    - _Requirements: 8.1, 13.3, 13.4_

- [ ] 10. Build Layers Panel for DOM navigation
  - [ ] 10.1 Create LayersPanel.svelte component
    - Design tree view layout with indentation using Tailwind CSS
    - Use shadcn-svelte Collapsible or Accordion for expandable nodes
    - Implement toggle button in Bottom Toolbar using shadcn-svelte Button
    - Position as slide-out panel from bottom or side
    - Style with scrollable content for large DOM trees
    - _Requirements: 9.1_
  
  - [ ] 10.2 Implement DOM tree rendering
    - Recursively traverse iframe DOM starting from body
    - Display element tag name, id, and first class for each node
    - Implement expand/collapse for parent elements
    - Highlight currently selected element in tree
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 10.3 Implement element selection from Layers
    - Add click handler to each tree node
    - Update selectedElement store on click
    - Scroll Canvas to bring selected element into view
    - Sync highlight in Overlay with Layers selection
    - _Requirements: 9.2_
  
  - [ ]* 10.4 Write component tests for Layers Panel
    - Test tree renders correct structure for sample DOM
    - Test clicking node selects element in Canvas
    - Test selected element highlights in tree
    - Test expand/collapse functionality
    - _Requirements: 9.2, 9.3, 9.4_

- [ ] 11. Implement error handling and user feedback
  - [ ] 11.1 Create error handling utilities
    - Define EditorError class in JavaScript with category and recoverable flag
    - Implement handleError function with logging and user notification
    - Create error recovery logic to restore last valid state
    - Add error boundaries for component failures
    - _Requirements: 3.5, 7.5_
  
  - [ ] 11.2 Create Toast notification system
    - Use shadcn-svelte Toast component for user messages
    - Implement toast queue for multiple notifications
    - Support error, success, and info message types
    - Add auto-dismiss with configurable duration
    - _Requirements: 3.5, 7.5_
  
  - [ ] 11.3 Add validation and error messages
    - Validate HTML before applying in Code mode
    - Validate element operations (delete, move) before execution
    - Show user-friendly error messages for common issues
    - Log detailed errors to console for debugging
    - _Requirements: 3.5, 7.5_

- [ ] 12. Implement storage and persistence
  - [ ] 12.1 Create storage utility functions in JavaScript
    - Write saveToLocalStorage and loadFromLocalStorage functions
    - Implement auto-save with 5-second debounce
    - Create downloadHTML function using Blob and download link
    - Add error handling for storage quota exceeded
    - Add JSDoc comments for all functions
    - _Requirements: 8.4_
  
  - [ ] 12.2 Implement auto-save and recovery
    - Auto-save htmlSource to localStorage on changes
    - Load saved HTML on application startup
    - Show indicator when auto-save is active using shadcn-svelte Badge
    - Implement "Restore previous session" prompt using shadcn-svelte Dialog
    - _Requirements: 8.2, 8.3_

- [ ] 13. Polish UI/UX and add final touches
  - [ ] 13.1 Implement smooth transitions and animations
    - Add fade transitions for mode switching
    - Animate Property Panel slide-in/out
    - Add hover effects for interactive elements
    - Implement loading states for async operations
    - _Requirements: 2.2_
  
  - [ ] 13.2 Optimize performance
    - Debounce property changes to 100ms
    - Implement virtual scrolling for Layers Panel if needed
    - Lazy load Monaco Editor on first Code mode activation
    - Optimize highlight position calculation
    - _Requirements: 5.4, 12.1, 12.3_
  
  - [ ] 13.3 Add keyboard shortcuts
    - Implement Ctrl+Z for Undo and Ctrl+Y for Redo
    - Add Ctrl+S for Save
    - Implement Delete key for element deletion
    - Add Escape to deselect element
    - _Requirements: 13.3, 13.4_
  
  - [ ] 13.4 Improve accessibility
    - Add ARIA labels to all interactive elements
    - Ensure keyboard navigation works throughout UI
    - Add focus indicators for keyboard users
    - Test with screen readers
    - _Requirements: All_
  
  - [ ]* 13.5 Create comprehensive documentation
    - Write README with setup instructions
    - Document component APIs and props
    - Create user guide with screenshots
    - Add inline code comments for complex logic
    - _Requirements: All_

- [ ] 14. Integration testing and bug fixes
  - [ ]* 14.1 Write end-to-end tests
    - Test complete workflow: load HTML → edit → save
    - Test mode switching preserves state
    - Test responsive mode changes
    - Test undo/redo with multiple operations
    - _Requirements: All_
  
  - [ ] 14.2 Manual testing with real-world HTML
    - Test with Google Stitch output
    - Test with Tailwind CSS templates
    - Test with Bootstrap components
    - Test with complex nested structures
    - Verify CDN resources load correctly
    - _Requirements: 11.1, 11.4, 11.5_
  
  - [ ] 14.3 Fix identified bugs and edge cases
    - Address any issues found during testing
    - Optimize performance bottlenecks
    - Improve error messages based on user feedback
    - Refine UI based on usability testing
    - _Requirements: All_
