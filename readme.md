# maju 🗳️
**`maju`** (for **ma**jority **ju**dgment) is a Javascript library implementing the majority judgment voting system.

[More info on majority judgment](#majority-judgment)

## Usage
Add maju to your project with `npm i maju` or `yarn add maju`

The exposed method allows to create a poll :

```javascript
const createPoll = require('maju')
const myPoll = createPoll(['Matrix', 'Ghostbusters', 'Terminator', 'Stargate'])
```

Use the poll's `vote()` function to cast a vote. The object parameter must have a property for each poll option name. The value must be an integer between 0 and 5 (the higher the better, no "bad" or "excellent" rank to be speaking-language-independant).

```javascript
myPoll.vote({ Matrix: 5, Stargate: 1, Ghostbusters: 0, Terminator: 2 })
```

Use the poll's `getWinner()` function to get the winner's name.
```javascript
console.log(myPoll.getWinner())
```

## Demo
⚠️ _Don't forget to install dev dependancies with `yarn` or `npm i`_

Refer to `demo/index.js` for an usage example
- `yarn demo:node` for a node-only example
- `yarn demo` for a browser usage example

## Majority Judgment
Majority judgment is a single-winner voting system. Voters freely grade each candidate in one of several named ranks, for instance from "excellent" to "bad", and the candidate with the highest median grade is the winner.
### Ressources
- Wikipedia article : https://en.wikipedia.org/wiki/Majority_judgment
- ScienceEtonnante video : https://www.youtube.com/watch?v=ZoGH7d51bvc (french audio, english subtitles)
- On voting systems : https://www.youtube.com/watch?v=vfTJ4vmIsO4 (french audio, english subtitles)
- Science4All video : https://www.youtube.com/watch?v=_MAo8pUl0U4 (french audio)

## TODO
- [ ] Create test suite (createPoll, votes, getSortedOptions)
