<script lang="ts">
	import tinygradient from 'tinygradient';

	// Accept distribution directly from getResults()
	let { distribution = [], width = 35, height = 300 } = $props();

	let percentages = $derived(distribution.map((d) => d.percentage));
	let gradient = $derived(tinygradient(['#880000', '#88FF88']));
	let tinycolors = $derived(percentages.length ? gradient.hsv(percentages.length, false) : []);
	let colors = $derived(tinycolors.map((t: any) => t.toHexString()));
</script>

<div class="relative mt-2">
	<div class="flex w-full flex-col-reverse">
		{#each percentages as ratio, index}
			<div
				class="relative flex items-center justify-center text-[10px] font-medium transition-all duration-500 ease-in-out"
				style:background-color={colors[index]}
				style:width="{width}px"
				style:height="{ratio * height}px"
				style:left="calc(50% - {width / 2}px)"
			>
				<!-- Only show text if the bar is tall enough -->
				{#if ratio * height > 12}
					<span class="font-bold text-black/70 drop-shadow-sm"
						>{(ratio * 100).toString().slice(0, 4)}%</span
					>
				{/if}
			</div>
		{/each}
	</div>
	<div
		class="pointer-events-none absolute top-1/2 z-10 h-0.5 bg-black shadow-sm"
		style:width="{width + 10}px"
		style:left="calc(50% - {(width + 10) / 2}px)"
	></div>
</div>
