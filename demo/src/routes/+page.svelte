<script lang="ts">
  import createPoll from 'maju';
  import ScoreCard from '$lib/components/ScoreCard.svelte';
  import VoteForm from '$lib/components/VoteForm.svelte';
  import { flip } from 'svelte/animate';
  import { cubicOut } from 'svelte/easing';

  const CANDIDATES = ['Matrix', 'Terminator', 'Stargate', 'Ghostbusters'];
  const INITIAL_VOTES = [
    { Matrix: 5, Stargate: 1, Ghostbusters: 0, Terminator: 1 },
    { Matrix: 1, Stargate: 3, Ghostbusters: 1, Terminator: 0 },
    { Matrix: 2, Stargate: 3, Ghostbusters: 5, Terminator: 3 },
    { Matrix: 3, Stargate: 0, Ghostbusters: 3, Terminator: 5 },
    { Matrix: 5, Stargate: 2, Ghostbusters: 4, Terminator: 2 },
    { Matrix: 4, Stargate: 3, Ghostbusters: 5, Terminator: 0 },
    { Matrix: 1, Stargate: 3, Ghostbusters: 5, Terminator: 4 },
    { Matrix: 1, Stargate: 0, Ghostbusters: 3, Terminator: 5 },
    { Matrix: 5, Stargate: 1, Ghostbusters: 1, Terminator: 3 },
    { Matrix: 3, Stargate: 4, Ghostbusters: 2, Terminator: 4 },
    { Matrix: 2, Stargate: 3, Ghostbusters: 4, Terminator: 3 },
    { Matrix: 4, Stargate: 5, Ghostbusters: 3, Terminator: 5 },
  ];

  function createDemoPoll() {
    const p = createPoll(CANDIDATES);
    p.addVotes(INITIAL_VOTES);
    return p;
  }

  // Initialize poll
  let myPoll = createDemoPoll();
  
  // Reactive state
  let results = $state(myPoll.getResults());
  let gradingLevels = $state(myPoll.GRADING_LEVELS);
  
  // Using derived state for UI
  let cardsData = $derived(results.map(r => ({
      name: r.name,
      scoreRatio: r.scoreRatio
  })));
  
  let winner = $derived(results.filter(r => r.rank === 0).map(r => r.name));
  let optionNames = $derived(myPoll.getOptions());
  
  function updateState() {
      results = myPoll.getResults();
      gradingLevels = myPoll.GRADING_LEVELS;
  }
  
  function handleVote(voteObject: Record<string, number | null>) {
      // @ts-ignore - voteObject typing
      myPoll.addVotes([voteObject]);
      updateState();
  }

  function handleReset() {
    myPoll = createPoll(CANDIDATES);
    updateState();
    pollKey++;
  }

  let pollKey = $state(0);
</script>

<div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="text-center relative">
      <h1 class="text-2xl font-black tracking-tight text-slate-900 sm:text-2xl md:text-3xl mb-4">
        {#if winner.length === 1}
          <span class="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">Winner: {winner[0]}</span>
        {:else}
          <span class="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-orange-600">Tie: {winner.join(', ')}</span>
        {/if}
      </h1>
      
      <button 
        onclick={handleReset}
        class="text-xs font-medium text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors duration-200"
      >
        Reset Votes
      </button>
    </div>

    <div class="flex flex-wrap justify-center gap-8 items-start relative">
      {#key pollKey}
        {#each cardsData as card (card.name)}
           <div animate:flip={{ duration: 400, easing: cubicOut }}>
             <ScoreCard 
               name={card.name} 
               scoreRatio={card.scoreRatio} 
             />
           </div>
        {/each}
      {/key}
    </div>

    <div class="max-w-3xl mx-auto w-full">
      {#key pollKey}
        <VoteForm 
          {optionNames} 
          gradingLevels={gradingLevels}
          onVote={handleVote} 
        />
      {/key}
    </div>
  </div>
</div>
