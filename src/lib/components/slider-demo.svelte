<script>
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';

	// Single value slider
	let singleValue = $state([50]);
	
	// Range slider (multiple values)
	let rangeValue = $state([20, 80]);
	
	// Vertical slider
	let verticalValue = $state([30]);
</script>

<div class="p-6 space-y-8">
	<h2 class="text-2xl font-bold">Slider Examples</h2>
	
	<!-- Single Value Slider -->
	<div class="space-y-4">
		<Label class="text-sm font-medium">Single Value Slider</Label>
		<div class="space-y-2">
			<Slider
				bind:value={singleValue}
				min={0}
				max={100}
				step={1}
				class="w-full"
			/>
			<p class="text-sm text-muted-foreground">Value: {singleValue[0]}</p>
		</div>
	</div>

	<!-- Range Slider -->
	<div class="space-y-4">
		<Label class="text-sm font-medium">Range Slider</Label>
		<div class="space-y-2">
			<Slider
				bind:value={rangeValue}
				min={0}
				max={100}
				step={1}
				class="w-full"
			/>
			<p class="text-sm text-muted-foreground">Range: {rangeValue[0]} - {rangeValue[1]}</p>
		</div>
	</div>

	<!-- Vertical Slider -->
	<div class="space-y-4">
		<Label class="text-sm font-medium">Vertical Slider</Label>
		<div class="flex items-center space-x-4">
			<Slider
				bind:value={verticalValue}
				orientation="vertical"
				min={0}
				max={100}
				step={1}
				class="h-48"
			/>
			<p class="text-sm text-muted-foreground">Value: {verticalValue[0]}</p>
		</div>
	</div>

	<!-- Disabled Slider -->
	<div class="space-y-4">
		<Label class="text-sm font-medium">Disabled Slider</Label>
		<div class="space-y-2">
			<Slider
				value={[25]}
				min={0}
				max={100}
				step={1}
				disabled
				class="w-full"
			/>
			<p class="text-sm text-muted-foreground">This slider is disabled</p>
		</div>
	</div>

	<!-- Custom Step Slider -->
	<div class="space-y-4">
		<Label class="text-sm font-medium">Custom Step Slider (step: 10)</Label>
		<div class="space-y-2">
			<Slider
				bind:value={singleValue}
				min={0}
				max={100}
				step={10}
				class="w-full"
			/>
			<p class="text-sm text-muted-foreground">Value: {singleValue[0]} (steps of 10)</p>
		</div>
	</div>
</div>