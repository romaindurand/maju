import { mount } from 'redom'
import createPoll from 'maju'
import { App } from './components.js'

const myPoll = createPoll(['Matrix', 'Terminator', 'Stargate', 'Ghostbusters'])
myPoll.addVotes([
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
])

// test for tied results
// myPoll.vote({ Matrix: 4, Stargate: 3, Ghostbusters: 4, Terminator: 2 })
// myPoll.vote({ Matrix: 3, Stargate: 4, Ghostbusters: 3, Terminator: 1 })

const {options, ties} = myPoll.getSortedOptions()
console.log('getSortedOptions()', {options, ties})

if (typeof document !== 'undefined') {
  const appRoot = document.getElementById('app') || document.body
  appRoot.innerHTML = ''
  const app = new App(myPoll)
  const scoreRatios = myPoll.getScoreRatio()
  app.update(options.map(optionName => scoreRatios.find(scoreRatio => scoreRatio.name === optionName)))
  mount(appRoot, app)
}
