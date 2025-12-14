# maju 🗳️
**`maju`** (for **ma**jority **ju**dgment) is a Javascript library implementing the majority judgment voting system.

[More info on majority judgment](#majority-judgment)

## Usage
Add maju to your project with `npm i maju` or `yarn add maju`

The exposed method allows you to create a poll:

```javascript
import createPoll from 'maju';

const myPoll = createPoll(['Matrix', 'Ghostbusters', 'Terminator', 'Stargate'])
```

Use the poll's `addVotes()` function to cast votes. The array parameter must contain an object for each vote. Each vote object must include a property for every poll option. The value must be an integer between 0 and 5 (configurable via `createPoll` options), the higher the better.

```javascript
myPoll.addVotes([{ Matrix: 5, Stargate: 1, Ghostbusters: 0, Terminator: 2 }])
```

Use the poll's `getResults()` function to get detailed results.

```javascript
console.log(myPoll.getResults())
```

### Customize grading levels

```javascript
const myPoll = createPoll(['Matrix', 'Ghostbusters', 'Terminator', 'Stargate'], { GRADING_LEVELS: 6 })
```

### Error Handling

You can distinguish between different error types to handle them effectively:

```typescript
import { InvalidVoteError, VoteStructureError } from 'maju';

try {
  poll.addVotes([userVote]);
} catch (error) {
  if (error instanceof VoteStructureError) {
    console.error(`Invalid vote keys. Expected: ${error.expected}, Given: ${error.given}`);
  } else if (error instanceof InvalidVoteError) {
    console.error("Vote rejected:", error.message);
  }
}
```

## API

### `getResults()`
Returns an array of `OptionResult` objects, sorted by rank (winner first). Each result contains:
- `rank`: The rank of the option (0 is best). Ties have the same rank.
- `name`: The option name.
- `score`: The computed score.
- `scoreRatio`: Array of ratios for each grade.
- `scoreCount`: Array of raw counts for each grade.
- `medianGrade`: The median grade value.

### Deprecated Functions

The following functions are deprecated and will be removed in future versions. Please update your code to use the new alternatives.

- **`vote(ratings)`**: Use `addVotes([ratings])` instead.
- **`getScoreCount()`**: Use `getResults()` instead. `result.scoreCount` contains this data.
- **`getScoreRatio()`**: Use `getResults()` instead. `result.scoreRatio` contains this data.
- **`getSortedOptions()`**: Use `getResults()` instead. The returned array is already sorted.

## Demo

```
pnpm i
pnpm demo
```

Refer to `demo/index.js` for a usage example
- `pnpm demo:node` for a node-only example
- `pnpm demo` for a browser usage example

## Majority Judgment
Majority judgment is a single-winner voting system. Voters freely grade each candidate in one of several named ranks, for instance from "excellent" to "bad", and the candidate with the highest median grade is the winner.

### Resources
- Wikipedia article: https://en.wikipedia.org/wiki/Majority_judgment
- ScienceEtonnante video: https://www.youtube.com/watch?v=ZoGH7d51bvc (French audio, English subtitles)
- On voting systems: https://www.youtube.com/watch?v=vfTJ4vmIsO4 (French audio, English subtitles)
- Science4All video: https://www.youtube.com/watch?v=_MAo8pUl0U4 (French audio)
