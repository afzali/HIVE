/**
 * Monaco Editor configuration that completely disables workers and suppresses errors
 */
export function configureMonacoSimple() {
	if (typeof window !== 'undefined') {
		// Completely disable Monaco workers
		window.MonacoEnvironment = {
			getWorker: function (moduleId, label) {
				return {
					postMessage: function() {},
					addEventListener: function() {},
					removeEventListener: function() {},
					terminate: function() {},
					onmessage: null,
					onerror: null
				};
			},
			getWorkerUrl: function (moduleId, label) {
				return 'data:text/javascript;charset=utf-8,';
			}
		};

		// Suppress Monaco Editor console errors
		const originalConsoleError = console.error;
		console.error = function(...args) {
			const message = args.join(' ');
			// Skip Monaco-related errors
			if (message.includes('MonacoEnvironment') || 
				message.includes('postMessage') || 
				message.includes('worker') ||
				message.includes('FAILED to post message')) {
				return;
			}
			originalConsoleError.apply(console, args);
		};

		// Also suppress unhandled promise rejections from Monaco
		window.addEventListener('unhandledrejection', function(event) {
			const message = event.reason?.message || event.reason || '';
			if (typeof message === 'string' && (
				message.includes('postMessage') ||
				message.includes('worker') ||
				message.includes('MonacoEnvironment')
			)) {
				event.preventDefault();
				return;
			}
		});
	}
}