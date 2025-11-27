/**
 * @file History manager for undo/redo functionality
 */

import { writable } from 'svelte/store';

/**
 * History Manager class for managing undo/redo operations
 */
export class HistoryManager {
	#history = [];
	#currentIndex = -1;
	#maxSize = 20;

	/**
	 * Create a new HistoryManager
	 * @param {number} maxSize - Maximum number of history entries to keep
	 */
	constructor(maxSize = 20) {
		this.#maxSize = maxSize;
	}

	/**
	 * Push a new state to history
	 * @param {string} state - HTML state to save
	 */
	push(state) {
		// Remove any future states if we're not at the end
		if (this.#currentIndex < this.#history.length - 1) {
			this.#history = this.#history.slice(0, this.#currentIndex + 1);
		}

		// Add new state
		this.#history.push(state);

		// Maintain max size by removing oldest entries
		if (this.#history.length > this.#maxSize) {
			this.#history.shift();
		} else {
			this.#currentIndex++;
		}
	}

	/**
	 * Undo to previous state
	 * @returns {string|null} Previous state or null if can't undo
	 */
	undo() {
		if (!this.canUndo()) {
			return null;
		}

		this.#currentIndex--;
		return this.#history[this.#currentIndex];
	}

	/**
	 * Redo to next state
	 * @returns {string|null} Next state or null if can't redo
	 */
	redo() {
		if (!this.canRedo()) {
			return null;
		}

		this.#currentIndex++;
		return this.#history[this.#currentIndex];
	}

	/**
	 * Check if undo is possible
	 * @returns {boolean}
	 */
	canUndo() {
		return this.#currentIndex > 0;
	}

	/**
	 * Check if redo is possible
	 * @returns {boolean}
	 */
	canRedo() {
		return this.#currentIndex < this.#history.length - 1;
	}

	/**
	 * Clear all history
	 */
	clear() {
		this.#history = [];
		this.#currentIndex = -1;
	}

	/**
	 * Get current state
	 * @returns {string|null}
	 */
	getCurrentState() {
		if (this.#currentIndex >= 0 && this.#currentIndex < this.#history.length) {
			return this.#history[this.#currentIndex];
		}
		return null;
	}
}

/**
 * Create a history store with undo/redo capabilities
 * @param {number} maxSize - Maximum history size
 * @returns {Object} Store with history methods
 */
export function createHistoryStore(maxSize = 20) {
	const manager = new HistoryManager(maxSize);
	const { subscribe, set, update } = writable({
		canUndo: false,
		canRedo: false
	});

	return {
		subscribe,
		/**
		 * Push a new state
		 * @param {string} state
		 */
		push: (state) => {
			manager.push(state);
			const canUndo = manager.canUndo();
			const canRedo = manager.canRedo();
			console.log(`📚 History pushed. Can undo: ${canUndo}, Can redo: ${canRedo}`);
			set({
				canUndo,
				canRedo
			});
		},
		/**
		 * Undo to previous state
		 * @returns {string|null}
		 */
		undo: () => {
			const state = manager.undo();
			const canUndo = manager.canUndo();
			const canRedo = manager.canRedo();
			console.log(`↶ Undo called. Can undo: ${canUndo}, Can redo: ${canRedo}, Returned state: ${state ? 'yes' : 'no'}`);
			set({
				canUndo,
				canRedo
			});
			return state;
		},
		/**
		 * Redo to next state
		 * @returns {string|null}
		 */
		redo: () => {
			const state = manager.redo();
			const canUndo = manager.canUndo();
			const canRedo = manager.canRedo();
			console.log(`↷ Redo called. Can undo: ${canUndo}, Can redo: ${canRedo}, Returned state: ${state ? 'yes' : 'no'}`);
			set({
				canUndo,
				canRedo
			});
			return state;
		},
		/**
		 * Clear history
		 */
		clear: () => {
			manager.clear();
			set({
				canUndo: false,
				canRedo: false
			});
		}
	};
}

/**
 * Global history store instance
 */
export const history = createHistoryStore(20);
