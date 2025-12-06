/**
 * @file Global state stores for HTML Visual Editor
 */

import { writable } from 'svelte/store';
import { VIEWPORT_PRESETS } from './types.js';

/**
 * Default HTML template
 */
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Hero Section -->
    <header class="container mx-auto px-6 py-16">
        <nav class="flex justify-between items-center mb-16">
            <div class="text-2xl font-bold text-indigo-600">MyBrand</div>
            <div class="space-x-6">
                <a href="#" class="text-gray-600 hover:text-indigo-600">Home</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600">Features</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600">About</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600">Contact</a>
            </div>
        </nav>
        
        <div class="text-center max-w-3xl mx-auto">
            <h1 class="text-5xl font-bold text-gray-900 mb-6">Build Amazing Websites Visually</h1>
            <p class="text-xl text-gray-600 mb-8">Create stunning web pages without writing code. Edit HTML visually with our powerful editor.</p>
            <div class="flex gap-4 justify-center">
                <button class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">Get Started</button>
                <button class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition">Learn More</button>
            </div>
        </div>
    </header>

    <!-- Features Section -->
    <section class="bg-white py-16">
        <div class="container mx-auto px-6">
            <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Visual Editing</h3>
                    <p class="text-gray-600">Edit elements directly on the page with intuitive controls</p>
                </div>
                
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Code Editor</h3>
                    <p class="text-gray-600">Switch to code mode for precise HTML editing</p>
                </div>
                
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Responsive</h3>
                    <p class="text-gray-600">Preview your design on different screen sizes</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-indigo-600 py-16">
        <div class="container mx-auto px-6 text-center">
            <h2 class="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p class="text-indigo-100 text-lg mb-8">Join thousands of users building amazing websites</p>
            <button class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Start Building Now</button>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-8">
        <div class="container mx-auto px-6 text-center">
            <p>&copy; 2024 MyBrand. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

/**
 * HTML Source - The single source of truth for the HTML document
 * @type {import('svelte/store').Writable<string>}
 */
export const htmlSource = writable(DEFAULT_HTML);

/**
 * Current editor mode
 * @type {import('svelte/store').Writable<import('./types.js').EditorMode>}
 */
export const currentMode = writable('preview');

/**
 * Currently selected element in Edit mode
 * @type {import('svelte/store').Writable<HTMLElement|null>}
 */
export const selectedElement = writable(null);

/**
 * Current viewport size
 * @type {import('svelte/store').Writable<import('./types.js').ViewportSize>}
 */
export const viewportSize = writable({
	preset: 'desktop',
	width: VIEWPORT_PRESETS.desktop.width,
	height: VIEWPORT_PRESETS.desktop.height
});

/**
 * iframe document reference
 * @type {import('svelte/store').Writable<Document|null>}
 */
export const iframeDocument = writable(null);

/**
 * Layers panel visibility
 * @type {import('svelte/store').Writable<boolean>}
 */
export const layersPanelOpen = writable(false);

/**
 * Inspect mode paused state
 * @type {import('svelte/store').Writable<boolean>}
 */
export const inspectPaused = writable(false);

/**
 * Edit toolbar visibility (stays open even in preview mode after pause)
 * @type {import('svelte/store').Writable<boolean>}
 */
export const editToolbarOpen = writable(false);

/**
 * Loading state
 * @type {import('svelte/store').Writable<boolean>}
 */
export const isLoading = writable(false);

/**
 * Flag to prevent sync during property initialization
 * @type {import('svelte/store').Writable<boolean>}
 */
export const isInitializingProperties = writable(false);

/**
 * Flag to prevent sync during active editing (typing in inputs)
 * @type {import('svelte/store').Writable<boolean>}
 */
export const isActivelyEditing = writable(false);
