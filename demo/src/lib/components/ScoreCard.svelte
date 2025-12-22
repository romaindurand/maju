<script lang="ts">
	import ScoreGraph from './ScoreGraph.svelte';

	// Accept distribution from getResults() for simpler usage
	let { name, distribution, rank, width = 35, height = 300 } = $props();

	const getMedalEmoji = (rank: number) => {
		if (rank === 0) return '🥇';
		if (rank === 1) return '🥈';
		if (rank === 2) return '🥉';
		return '';
	};

	const medal = $derived(getMedalEmoji(rank));
</script>

<div
	class="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
>
	<div class="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
		{#if medal}
			<span class="text-2xl">{medal}</span>
		{/if}
		<span>{name}</span>
	</div>
	<ScoreGraph {distribution} {width} {height} />
</div>
