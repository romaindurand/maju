<script lang="ts">
  import ScoreGraph from './ScoreGraph.svelte';

  let { name, scoreRatio, rank, width = 35, height = 300 } = $props();
  
  const getMedalEmoji = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return '';
  };
  
  const medal = $derived(getMedalEmoji(rank));
</script>

<div class="flex flex-col items-center bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
  <div class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    {#if medal}
      <span class="text-2xl">{medal}</span>
    {/if}
    <span>{name}</span>
  </div>
  <ScoreGraph {scoreRatio} {width} {height} />
</div>
