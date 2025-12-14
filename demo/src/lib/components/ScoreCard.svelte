<script lang="ts">
  import ScoreGraph from './ScoreGraph.svelte';

  let { name, scoreRatio, width = 35, height = 300 } = $props();
</script>

<div class="flex flex-col items-center bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
  <div class="text-xl font-bold text-gray-800 mb-4">{name}</div>
  <ScoreGraph {scoreRatio} {width} {height} />
</div>
