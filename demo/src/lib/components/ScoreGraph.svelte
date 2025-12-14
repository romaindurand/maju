<script lang="ts">
  import tinygradient from 'tinygradient';

  let { scoreRatio = [], width = 35, height = 300 } = $props();

  let gradient = $derived(tinygradient(['#88FF88', '#880000']));
  let tinycolors = $derived(scoreRatio.length ? gradient.hsv(scoreRatio.length, true) : []);
  let colors = $derived(tinycolors.map((t: any) => t.toHexString()));

  let reversedScoreRatio = $derived([...scoreRatio].reverse());
</script>

<div class="relative mt-2">
  <div class="flex flex-col w-full">
    {#each reversedScoreRatio as ratio, index}
      <div 
        class="relative flex items-center justify-center text-[10px] font-medium transition-all duration-500 ease-in-out"
        style:background-color={colors[index]}
        style:width="{width}px"
        style:height="{ratio * height}px"
        style:left="calc(50% - {width / 2}px)"
      >
        <!-- Only show text if the bar is tall enough -->
        {#if ratio * height > 12}
          <span class="drop-shadow-sm text-black/70 font-bold">{(ratio * 100).toString().slice(0, 4)}%</span>
        {/if}
      </div>
    {/each}
  </div>
  <div 
    class="absolute top-1/2 h-0.5 bg-black z-10 shadow-sm pointer-events-none"
    style:width="{width + 10}px" 
    style:left="calc(50% - {(width + 10) / 2}px)"
  ></div>
</div>
