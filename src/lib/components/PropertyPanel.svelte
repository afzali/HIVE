<script>
	import PropertyPanelNew from './property-panel/PropertyPanel.svelte';

	/**
	 * @type {function(string, any): void} onPropertyChange
	 */
	export let onPropertyChange = () => {};
</script>

<PropertyPanelNew {onPropertyChange} />