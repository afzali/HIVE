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
- **Property Panel**: The right sidebar that displays editable properties of the selected element through a tabbed interface
- **Design Tab**: The tab in Property Panel containing visual controls for styling properties like padding, margin, and layout
- **Component Tab**: The tab in Property Panel for tagging HTML elements as components using data-* attributes for AI-assisted conversion to framework components
- **Component Annotation**: The process of adding data-* attributes to HTML elements to define them as components, views, loops, props, and navigation
- **Component Library**: A saved collection of component definitions that can be reused across different elements
- **Code Tab**: The tab in Property Panel containing a CSS code editor for direct style editing of the selected element
- **HTML Tab**: The tab in Property Panel containing an HTML code editor for direct markup editing of the selected element
- **Chat Tab**: The tab in Property Panel containing an AI chat interface for getting assistance with element editing
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

**User Story:** As a user, I want to modify element properties through a tabbed graphical interface, so that I can access different types of editing controls in an organized manner

#### Acceptance Criteria

1. WHEN an element is selected in Edit mode, THE Property Panel SHALL display a tabbed interface with Design, Component, Code, HTML, and Chat tabs
2. WHEN the Design tab is active, THE Property Panel SHALL display visual controls for styling properties including padding, margin, width, height, and display
3. WHEN the Component tab is active, THE Property Panel SHALL display a placeholder area for future component-specific controls
4. WHEN the Code tab is active, THE Property Panel SHALL display CSS code editor for the selected element's styles
5. WHEN the HTML tab is active, THE Property Panel SHALL display HTML code editor for the selected element's markup
6. WHEN the Chat tab is active, THE Property Panel SHALL display an AI chat interface for element editing assistance
7. THE Property Panel SHALL maintain the active tab selection when switching between different selected elements
8. WHEN the user modifies a style property value in any tab, THE Editor System SHALL apply the change to the selected element's inline style immediately
9. WHEN the user modifies a style property value, THE Editor System SHALL update the HTML Source within 500 milliseconds to keep it synchronized
10. WHEN the user modifies text content, THE Editor System SHALL apply the change on input with debounce of 300 milliseconds or on focus out

### Requirement 5A

**User Story:** As a user, I want to use comprehensive visual controls in the Design tab similar to CSS Pro editor, so that I can adjust all styling properties without writing CSS code

#### Acceptance Criteria

1. WHEN the Design tab is active and an element is selected, THE Property Panel SHALL display spacing controls with visual box model including padding and margin on all four sides with drag-to-adjust functionality
2. WHEN the Design tab is active and an element is selected, THE Property Panel SHALL display dimension controls for width, height, and border-radius with unit selectors (px, %, em, rem, auto)
3. WHEN the Design tab is active and an element is selected, THE Property Panel SHALL display typography controls including font-family, font-size, font-weight, line-height, letter-spacing, text-align, text-decoration, and color
4. WHEN the Design tab is active and an element is selected, THE Property Panel SHALL display background controls including solid colors, gradients, and background images with preset options
5. WHEN the Design tab is active and an element is selected, THE Property Panel SHALL display border controls including border-width, border-style, border-color, and border-radius
6. WHEN the Design tab is active and an element is selected, THE Property Panel SHALL display display and positioning controls including display type, position, top, right, bottom, left, and z-index
7. WHEN the Design tab is active and an element is selected, THE Property Panel SHALL display effects controls including box-shadow, text-shadow, opacity, and CSS filters
8. WHEN the Design tab is active and an element is selected, THE Property Panel SHALL display flexbox controls when display is set to flex including justify-content, align-items, flex-direction, and flex-wrap
9. WHERE the selected element contains text content, THE Design tab SHALL display an inline text editor
10. WHERE the selected element has a class attribute, THE Design tab SHALL display an editable list of CSS classes
11. ALL style changes in the Design tab SHALL be applied immediately to the selected element's inline style in the DOM

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

**User Story:** As a user, I want to edit CSS and HTML code directly in the Property Panel tabs, so that I can make precise code changes for the selected element

#### Acceptance Criteria

1. WHEN the Code tab is active, THE Property Panel SHALL display a CSS code editor with syntax highlighting
2. WHEN the Code tab is active, THE Property Panel SHALL show only the most important CSS styles that apply to the selected element including computed styles and inline styles
3. WHEN the user modifies CSS in the Code tab, THE Editor System SHALL apply changes to the selected element's inline style immediately in the DOM
4. WHEN the HTML tab is active, THE Property Panel SHALL display an HTML code editor with syntax highlighting
5. WHEN the HTML tab is active, THE Property Panel SHALL show the complete outerHTML of the selected element including all its children and attributes
6. WHEN the user modifies HTML in the HTML tab, THE Editor System SHALL replace the selected element in the Canvas DOM immediately
7. WHEN any changes are made in Code or HTML tabs, THE Editor System SHALL update the HTML Source within 500 milliseconds to keep it synchronized
8. IF the user enters invalid CSS or HTML syntax, THEN THE Editor System SHALL display inline error indicators without applying the changes

### Requirement 14

**User Story:** As a user, I want to tag HTML elements as components using data-* attributes in the Component tab, so that I can prepare them for AI-assisted conversion to framework components like React, Svelte, or Vue

#### Acceptance Criteria

1. WHEN the Component tab is active, THE Property Panel SHALL display component annotation controls for the selected element
2. WHEN the Component tab is active, THE Property Panel SHALL display a dropdown to select component type including "Component", "Page", "Panel", "Widget", and "None"
3. WHEN the user selects "Component", THE Property Panel SHALL display an input field for component name in PascalCase format
4. WHEN the user selects "Page", THE Property Panel SHALL display input fields for page name and route path
5. WHEN the user selects "Panel" or "Widget", THE Property Panel SHALL display an input field for the respective name
6. WHEN the Component tab is active, THE Property Panel SHALL display controls for loop annotation including "item in items" format and key field
7. WHEN the Component tab is active, THE Property Panel SHALL display controls for adding props using "data-prop-*" format with name and value fields
8. WHEN the Component tab is active, THE Property Panel SHALL display controls for navigation annotation with route path input
9. WHEN the Component tab is active, THE Property Panel SHALL display controls for conditional rendering with "data-if" and "data-else" options
10. WHEN the user applies component annotations, THE Editor System SHALL add the corresponding data-* attributes to the selected element immediately
11. THE Component tab SHALL maintain a library of previously created component definitions for reuse
12. WHEN the user selects a component from the library, THE Property Panel SHALL apply all saved annotations to the current element

### Requirement 15

**User Story:** As a user, I want to use an AI chat interface in the Property Panel, so that I can get assistance with editing the selected element

#### Acceptance Criteria

1. WHEN the Chat tab is active, THE Property Panel SHALL display a simple chat interface with message history area and input field
2. WHEN the Chat tab is active, THE Property Panel SHALL display a text input field and send button for communicating with AI
3. WHEN the Chat tab is active, THE Property Panel SHALL display a model selector dropdown to choose between different AI models
4. THE Chat tab SHALL maintain conversation history during the editing session in a scrollable message area
5. THE Chat tab SHALL be implemented as a basic chat structure without advanced AI integration for the initial version

### Requirement 16

**User Story:** As a user, I want all changes to be applied immediately to the DOM and then synchronized to the source, so that I see real-time updates without delays

#### Acceptance Criteria

1. WHEN the user makes any change in any Property Panel tab, THE Editor System SHALL apply the change immediately to the selected element in the Canvas DOM
2. WHEN a DOM change is applied, THE Editor System SHALL update the HTML Source within 500 milliseconds to keep it synchronized
3. WHEN the user modifies styles in Design tab, THE Editor System SHALL apply changes to the element's inline style attribute immediately
4. WHEN the user modifies CSS in Code tab, THE Editor System SHALL apply changes to the element's inline style attribute immediately
5. WHEN the user modifies HTML in HTML tab, THE Editor System SHALL replace the element in the DOM immediately
6. WHEN the user adds component annotations in Component tab, THE Editor System SHALL add data-* attributes to the element immediately
7. THE Editor System SHALL maintain the selected element reference during HTML Source synchronization
8. THE Editor System SHALL preserve the Canvas scroll position during HTML Source synchronization

### Requirement 17

**User Story:** As a user, I want basic undo and redo functionality, so that I can revert mistakes during editing

#### Acceptance Criteria

1. THE Bottom Toolbar SHALL display Undo and Redo buttons
2. WHEN the user makes a change to the Canvas DOM, THE Editor System SHALL record the change in a history stack
3. WHEN the user clicks Undo, THE Editor System SHALL revert the Canvas to the previous state in the history stack
4. WHEN the user clicks Redo, THE Editor System SHALL reapply the next change in the history stack
5. THE Editor System SHALL maintain a history stack of at least 20 changes
6. IF there are no changes to undo, THEN THE Editor System SHALL disable the Undo button
7. IF there are no changes to redo, THEN THE Editor System SHALL disable the Redo button
