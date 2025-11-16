/**
 * @file File System Access API integration
 * Manages a single HTML file for the editor
 */

/**
 * @typedef {Object} FileHandle
 * @property {FileSystemFileHandle} handle - The file handle
 * @property {string} url - Blob URL for iframe
 */

let currentFileHandle = null;
let currentBlobURL = null;

/**
 * Check if File System Access API is supported
 * @returns {boolean}
 */
export function isFileSystemSupported() {
	return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

/**
 * Create a new HTML file
 * @param {string} initialHTML - Initial HTML content
 * @returns {Promise<FileHandle>}
 */
export async function createNewFile(initialHTML) {
	try {
		// Create a blob URL for the iframe
		const blob = new Blob([initialHTML], { type: 'text/html' });
		
		// Revoke old URL if exists
		if (currentBlobURL) {
			URL.revokeObjectURL(currentBlobURL);
		}
		
		currentBlobURL = URL.createObjectURL(blob);
		
		return {
			handle: null,
			url: currentBlobURL
		};
	} catch (error) {
		console.error('Error creating new file:', error);
		throw error;
	}
}

/**
 * Open an existing HTML file
 * @returns {Promise<{handle: FileSystemFileHandle, url: string, html: string}>}
 */
export async function openFile() {
	if (!isFileSystemSupported()) {
		throw new Error('File System Access API not supported');
	}

	try {
		const [fileHandle] = await window.showOpenFilePicker({
			types: [
				{
					description: 'HTML Files',
					accept: {
						'text/html': ['.html', '.htm']
					}
				}
			],
			multiple: false
		});

		const file = await fileHandle.getFile();
		const html = await file.text();
		
		// Create blob URL
		const blob = new Blob([html], { type: 'text/html' });
		
		// Revoke old URL
		if (currentBlobURL) {
			URL.revokeObjectURL(currentBlobURL);
		}
		
		currentBlobURL = URL.createObjectURL(blob);
		currentFileHandle = fileHandle;

		return {
			handle: fileHandle,
			url: currentBlobURL,
			html
		};
	} catch (error) {
		if (error.name === 'AbortError') {
			console.log('User cancelled file picker');
			return null;
		}
		console.error('Error opening file:', error);
		throw error;
	}
}

/**
 * Save HTML to the current file
 * @param {string} html - HTML content to save
 * @returns {Promise<boolean>}
 */
export async function saveFile(html) {
	if (!currentFileHandle) {
		return await saveFileAs(html);
	}

	try {
		const writable = await currentFileHandle.createWritable();
		await writable.write(html);
		await writable.close();

		// Update blob URL
		const blob = new Blob([html], { type: 'text/html' });
		if (currentBlobURL) {
			URL.revokeObjectURL(currentBlobURL);
		}
		currentBlobURL = URL.createObjectURL(blob);

		return true;
	} catch (error) {
		console.error('Error saving file:', error);
		throw error;
	}
}

/**
 * Save HTML to a new file (Save As)
 * @param {string} html - HTML content to save
 * @returns {Promise<boolean>}
 */
export async function saveFileAs(html) {
	if (!isFileSystemSupported()) {
		// Fallback to download
		downloadHTML(html);
		return true;
	}

	try {
		const fileHandle = await window.showSaveFilePicker({
			types: [
				{
					description: 'HTML Files',
					accept: {
						'text/html': ['.html']
					}
				}
			],
			suggestedName: 'page.html'
		});

		const writable = await fileHandle.createWritable();
		await writable.write(html);
		await writable.close();

		currentFileHandle = fileHandle;

		// Update blob URL
		const blob = new Blob([html], { type: 'text/html' });
		if (currentBlobURL) {
			URL.revokeObjectURL(currentBlobURL);
		}
		currentBlobURL = URL.createObjectURL(blob);

		return true;
	} catch (error) {
		if (error.name === 'AbortError') {
			console.log('User cancelled save dialog');
			return false;
		}
		console.error('Error saving file:', error);
		throw error;
	}
}

/**
 * Update the blob URL with new HTML (for live editing)
 * @param {string} html - Updated HTML content
 * @returns {string} New blob URL
 */
export function updateBlobURL(html) {
	const blob = new Blob([html], { type: 'text/html' });
	
	if (currentBlobURL) {
		URL.revokeObjectURL(currentBlobURL);
	}
	
	currentBlobURL = URL.createObjectURL(blob);
	return currentBlobURL;
}

/**
 * Get current blob URL
 * @returns {string|null}
 */
export function getCurrentBlobURL() {
	return currentBlobURL;
}

/**
 * Get current file handle
 * @returns {FileSystemFileHandle|null}
 */
export function getCurrentFileHandle() {
	return currentFileHandle;
}

/**
 * Get current file name
 * @returns {string}
 */
export function getCurrentFileName() {
	return currentFileHandle?.name || 'Untitled';
}

/**
 * Check if there's an open file
 * @returns {boolean}
 */
export function hasOpenFile() {
	return currentFileHandle !== null;
}

/**
 * Close current file
 */
export function closeFile() {
	if (currentBlobURL) {
		URL.revokeObjectURL(currentBlobURL);
	}
	currentBlobURL = null;
	currentFileHandle = null;
}

/**
 * Fallback download for browsers without File System Access API
 * @param {string} html
 * @param {string} filename
 */
function downloadHTML(html, filename = 'page.html') {
	const blob = new Blob([html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/**
 * Clean up on page unload
 */
if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', () => {
		if (currentBlobURL) {
			URL.revokeObjectURL(currentBlobURL);
		}
	});
}
