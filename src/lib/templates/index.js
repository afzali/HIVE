/**
 * @file Template loader for HTML templates
 */

/**
 * Template metadata
 * @typedef {Object} Template
 * @property {string} id - Unique template ID
 * @property {string} name - Display name
 * @property {string} description - Template description
 * @property {string} file - Template file name
 */

/**
 * Available templates
 * @type {Template[]}
 */
export const templates = [
	{
		id: 'landing-page',
		name: 'Landing Page',
		description: 'Modern landing page with hero section',
		file: 'landing-page.html'
	},
	{
		id: 'blog',
		name: 'Blog Post',
		description: 'Simple blog post layout',
		file: 'blog.html'
	},
	{
		id: 'portfolio',
		name: 'Portfolio',
		description: 'Portfolio showcase page',
		file: 'portfolio.html'
	}
];

/**
 * Load template HTML by ID
 * @param {string} templateId - Template ID
 * @returns {Promise<string>} Template HTML content
 */
export async function loadTemplate(templateId) {
	const template = templates.find(t => t.id === templateId);
	if (!template) {
		throw new Error(`Template not found: ${templateId}`);
	}

	try {
		// Dynamic import of template file
		const module = await import(`./${template.file}?raw`);
		return module.default;
	} catch (error) {
		console.error(`Failed to load template ${templateId}:`, error);
		throw error;
	}
}
