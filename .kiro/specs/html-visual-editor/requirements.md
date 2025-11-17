# Requirements Document

## Introduction

The HTML Visual Editor is a browser-based interactive tool that enables users to visually edit complete HTML pages in real-time. Inspired by Divi and Figma, this editor provides three distinct modes: Preview (for viewing the page as end-users would), Edit (for visual no-code editing with element selection and property manipulation), and Code (for direct HTML editing). The system renders HTML within an iframe, allowing CDN resources to load naturally, and applies all changes directly to the DOM without requiring a build process.

## Technical Constraints

- **Programming Language**: The Editor System SHALL be implemented using JavaScript (not TypeScript)
- **UI Framework**: The Editor System SHALL use SvelteKit as the application framework
- **UI Component Library**: The Editor System SHALL use shadcn-svelte components for all UI elements
- **Styling**: The Editor System SHALL use Tailwind CSS for styling the editor interface

## Glossary

- **Editor System**: The complete HTML Visual Editor application
- **Canvas**: The iframe element that renders the HTML page being edited
- **Floating Control Button**: The circular button at the bottom of the screen that switches between modes
- **Property Panel**: The right sidebar that displays editable properties of the selected element
- **Bottom Toolbar**: The toolbar at the bottom of the screen containing Save, Layers, and element manipulation controls
- **Overlay Layer**: A transparent layer positioned over the Canvas that enables element selection and highlighting
- **HTML Source**: The authoritative string variable containing the complete HTML document
- **Context Menu**: The small menu appearing near a selected element with quick actions (duplicate, delete, add, move)
- **Layers Panel**: A tree-view representation of the DOM structure for navigation and reordering

## Requirements

### Requirement 1

**User Story:** As a user, I want to view my HTML page in Preview mode by default, so that I can see how it appears to end-users without any editing interface

#### Acceptance Criteria

1. WHEN the Editor System loads, THE Editor System SHALL display the Canvas in Preview mode
2. WHILE in Preview mode, THE Editor System SHALL hide all editing controls including the Overlay Layer, Property Panel, and Bottom Toolbar
3. WHILE in Preview mode, THE Editor System SHALL allow all interactive elements within the Canvas to function normally including links, forms, and animations
4. THE Editor System SHALL render the Floating Control Button in Preview mode

### Requirement 2

**User Story:** As a user, I want to switch between Preview, Edit, and Code modes using a floating button, so that I can choose my preferred editing approach

#### Acceptance Criteria

1. WHEN the user clicks the Floating Control Button, THE Editor System SHALL display a menu with options for Preview, Edit, and Code modes
2. WHEN the user selects a mode from the menu, THE Editor System SHALL transition to the selected mode within 300 milliseconds
3. THE Editor System SHALL display the Floating Control Button at the bottom center of the viewport with fixed positioning
4. WHILE transitioning between modes, THE Editor System SHALL preserve the current HTML Source without data loss

### Requirement 3

**User Story:** As a user, I want to edit HTML directly in Code mode, so that I can paste complete HTML documents or make precise code changes

#### Acceptance Criteria

1. WHEN the user enters Code mode, THE Editor System SHALL display a code editor component with syntax highlighting for HTML
2. WHEN the user modifies HTML in the code editor and clicks Apply, THE Editor System SHALL update the HTML Source with the new content
3. WHEN the HTML Source is updated, THE Editor System SHALL re-render the Canvas within 500 milliseconds
4. THE Editor System SHALL display the code editor with line numbers and bracket matching
5. IF the user enters invalid HTML syntax, THEN THE Editor System SHALL display a warning message without updating the Canvas

### Requirement 4

**User Story:** As a user, I want to select elements visually in Edit mode, so that I can modify specific parts of my page without writing code

#### Acceptance Criteria

1. WHEN the user enters Edit mode, THE Editor System SHALL activate the Overlay Layer on top of the Canvas
2. WHEN the user clicks an element within the Canvas, THE Editor System SHALL select that element and display a colored border highlight
3. WHEN an element is selected, THE Editor System SHALL display the Property Panel with editable properties for that element
4. WHEN an element is selected, THE Editor System SHALL display the Context Menu near the selected element
5. THE Editor System SHALL update the highlight border position when the selected element's dimensions change

### Requirement 5

**User Story:** As a user, I want to modify element properties through a graphical interface, so that I can adjust styling without writing CSS code

#### Acceptance Criteria

1. WHEN an element is selected in Edit mode, THE Property Panel SHALL display controls for padding on all four sides with visual indicators
2. WHEN an element is selected in Edit mode, THE Property Panel SHALL display controls for margin on all four sides with visual indicators
3. WHEN an element is selected in Edit mode, THE Property Panel SHALL display controls for width and height
4. WHEN an element is selected in Edit mode, THE Property Panel SHALL display a single-select control for display property including block, inline, flex, grid, and none options
5. WHEN the user modifies a style property value, THE Editor System SHALL apply the change to the selected element's inline style immediately
6. WHEN the user modifies a style property value, THE Editor System SHALL update the HTML Source within 500 milliseconds to keep it synchronized
7. WHEN the user modifies text content, THE Editor System SHALL apply the change on input with debounce of 300 milliseconds or on focus out
8. WHERE the selected element contains text content, THE Property Panel SHALL display a text editor control
9. WHERE the selected element has a class attribute, THE Property Panel SHALL display an editable list of CSS classes
10. THE Property Panel SHALL display visual labels to distinguish between padding and margin controls

### Requirement 6

**User Story:** As a user, I want to add new elements to my page, so that I can build out my design without manually writing HTML

#### Acceptance Criteria

1. WHERE an element is selected, THE Context Menu SHALL display options for Add Child, Add Before, and Add After
2. WHEN the user selects an add option, THE Editor System SHALL display a menu of element types including div, section, button, a, img, input, and h1
3. WHEN the user selects an element type, THE Editor System SHALL insert a new element with default structure into the Canvas DOM
4. WHEN a new element is inserted, THE Editor System SHALL automatically select the new element
5. THE Editor System SHALL create new elements with a default CSS class for basic styling

### Requirement 7

**User Story:** As a user, I want to duplicate, delete, and move elements, so that I can reorganize my page structure efficiently

#### Acceptance Criteria

1. WHEN the user clicks duplicate in the Context Menu, THE Editor System SHALL create a copy of the selected element and insert it immediately after the original
2. WHEN the user clicks delete in the Context Menu, THE Editor System SHALL remove the selected element from the Canvas DOM
3. WHEN the user clicks move in the Context Menu, THE Editor System SHALL display options for Move Up, Move Down, Move Before, Move After, and Move Into Parent
4. WHEN the user selects a move option, THE Editor System SHALL reposition the element in the DOM structure accordingly
5. IF the user attempts to delete the root body element, THEN THE Editor System SHALL display an error message and prevent the deletion

### Requirement 8

**User Story:** As a user, I want to save my edited HTML, so that I can export the complete page for use elsewhere

#### Acceptance Criteria

1. WHEN the user clicks Save in the Bottom Toolbar, THE Editor System SHALL extract the complete HTML from the Canvas using outerHTML
2. WHEN the HTML is extracted, THE Editor System SHALL update the HTML Source with the current Canvas state
3. WHEN the HTML Source is updated, THE Editor System SHALL synchronize the code editor content if Code mode is active
4. THE Editor System SHALL provide a download option to save the HTML Source as a file
5. THE Editor System SHALL preserve all CDN links, inline styles, and script tags in the saved HTML

### Requirement 9

**User Story:** As a user, I want to view and navigate the DOM structure in a Layers panel, so that I can understand and reorganize complex page hierarchies

#### Acceptance Criteria

1. WHEN the user opens the Layers panel from the Bottom Toolbar, THE Editor System SHALL display a tree-view representation of the Canvas DOM
2. WHEN the user clicks an element in the Layers panel, THE Editor System SHALL select that element in the Canvas
3. THE Layers panel SHALL display element tag names and id or class attributes for identification
4. THE Layers panel SHALL support collapsing and expanding parent elements to show or hide children
5. WHERE an element is selected in the Canvas, THE Layers panel SHALL highlight the corresponding tree node

### Requirement 10

**User Story:** As a user, I want to preview my design at different screen sizes, so that I can ensure responsive behavior

#### Acceptance Criteria

1. THE Bottom Toolbar SHALL display responsive mode options for Desktop, Tablet, Mobile, and Custom sizes
2. WHEN the user selects a responsive mode, THE Editor System SHALL resize the Canvas to the corresponding viewport dimensions
3. THE Editor System SHALL maintain Desktop mode with dimensions of 1920x1080 pixels
4. THE Editor System SHALL maintain Tablet mode with dimensions of 768x1024 pixels
5. THE Editor System SHALL maintain Mobile mode with dimensions of 375x667 pixels
6. WHERE Custom mode is selected, THE Editor System SHALL allow the user to input specific width and height values
7. WHILE in a responsive mode, THE Editor System SHALL preserve all editing capabilities without restriction

### Requirement 11

**User Story:** As a user, I want to load HTML from external sources or paste it directly, so that I can edit existing pages like Google Stitch output

#### Acceptance Criteria

1. WHEN the Editor System initializes, THE Editor System SHALL provide an option to paste HTML content
2. WHEN the user pastes HTML content, THE Editor System SHALL set the HTML Source to the pasted content
3. WHEN the HTML Source is set, THE Editor System SHALL render the content in the Canvas within 500 milliseconds
4. THE Editor System SHALL preserve all external CDN references including Tailwind CSS, Google Fonts, and icon libraries
5. THE Editor System SHALL render complete HTML documents including head and body elements without modification

### Requirement 12

**User Story:** As a user, I want all changes to be applied immediately to the DOM, so that I can see results in real-time without waiting for builds

#### Acceptance Criteria

1. WHEN the user modifies any style property in the Property Panel, THE Editor System SHALL apply the change directly to the selected element's inline style immediately
2. WHEN the user modifies text content, THE Editor System SHALL apply the change with debounce of 300 milliseconds or immediately on focus out
3. WHEN the user adds or removes an element, THE Editor System SHALL update the Canvas DOM immediately
4. WHEN any DOM change occurs, THE Editor System SHALL synchronize the HTML Source within 500 milliseconds
5. THE Editor System SHALL apply all DOM changes without requiring a page reload or build process
6. THE Editor System SHALL maintain the scroll position of the Canvas when applying DOM changes
7. THE Editor System SHALL maintain the selected element reference during HTML Source synchronization

### Requirement 13

**User Story:** As a user, I want basic undo and redo functionality, so that I can revert mistakes during editing

#### Acceptance Criteria

1. THE Bottom Toolbar SHALL display Undo and Redo buttons
2. WHEN the user makes a change to the Canvas DOM, THE Editor System SHALL record the change in a history stack
3. WHEN the user clicks Undo, THE Editor System SHALL revert the Canvas to the previous state in the history stack
4. WHEN the user clicks Redo, THE Editor System SHALL reapply the next change in the history stack
5. THE Editor System SHALL maintain a history stack of at least 20 changes
6. IF there are no changes to undo, THEN THE Editor System SHALL disable the Undo button
7. IF there are no changes to redo, THEN THE Editor System SHALL disable the Redo button
