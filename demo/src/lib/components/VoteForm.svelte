<script lang="ts">
	import tinygradient from 'tinygradient';

	let { optionNames = [], gradingLevels = 0, onVote } = $props();

	let selectedValues = $state<Record<string, number | null>>({});

	let gradient = $derived(tinygradient(['#88FF88', '#880000']));
	let generatedColors = $derived(
		gradingLevels > 0 ? gradient.hsv(gradingLevels, true).map((t: any) => t.toHexString()) : []
	);

	function getColor(i: number) {
		if (!generatedColors.length) return '#eee';
		return generatedColors[gradingLevels - 1 - i];
	}

	$effect(() => {
		optionNames.forEach((name: string) => {
			if (selectedValues[name] === undefined) {
				selectedValues[name] = null;
			}
		});
	});

	function handleVote() {
		onVote($state.snapshot(selectedValues));
	}

	function selectGrade(name: string, grade: number) {
		selectedValues[name] = grade;
	}
</script>

<div class="mx-auto w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
	<div class="flex flex-col">
		{#each optionNames as name}
			<div
				class="flex items-center gap-4 border-b border-gray-100 py-3 transition-colors duration-200 last:border-0 hover:bg-gray-50"
			>
				<div class="w-32 truncate font-semibold text-gray-700" title={name}>{name}</div>
				<div
					class="grid flex-1 justify-items-center gap-2"
					style:grid-template-columns="repeat({gradingLevels}, 1fr)"
				>
					{#each Array(gradingLevels) as _, i}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<button
							class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
							style:background-color={getColor(i)}
							class:opacity-100={selectedValues[name] === i}
							class:opacity-40={selectedValues[name] !== i}
							class:hover:opacity-80={selectedValues[name] !== i}
							class:scale-110={selectedValues[name] === i}
							class:border-slate-600={selectedValues[name] === i}
							class:border-transparent={selectedValues[name] !== i}
							onclick={() => selectGrade(name, i)}
							aria-label={`Rate ${name} ${i}`}
						>
							{#if selectedValues[name] === i}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="3"
									stroke="currentColor"
									class="h-3/5 w-3/5 text-slate-900"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-6 flex justify-end">
		<button
			class="rounded-lg bg-slate-800 px-6 py-2 font-bold text-white shadow-md transition-all duration-200 hover:bg-slate-700 hover:shadow-lg focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-none"
			onclick={handleVote}
		>
			Vote!
		</button>
	</div>
</div>
