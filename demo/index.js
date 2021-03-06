const { mount } = require('redom')
const createPoll = require('../index')
const { App } = require('./components')

const myPoll = createPoll(['Matrix', 'Terminator', 'Stargate', 'Ghostbusters'])
myPoll.vote({ Matrix: 5, Stargate: 1, Ghostbusters: 0, Terminator: 1 })
myPoll.vote({ Matrix: 1, Stargate: 3, Ghostbusters: 1, Terminator: 0 })
myPoll.vote({ Matrix: 2, Stargate: 3, Ghostbusters: 5, Terminator: 3 })
myPoll.vote({ Matrix: 3, Stargate: 0, Ghostbusters: 3, Terminator: 5 })
myPoll.vote({ Matrix: 5, Stargate: 2, Ghostbusters: 4, Terminator: 2 })
myPoll.vote({ Matrix: 4, Stargate: 3, Ghostbusters: 5, Terminator: 0 })
myPoll.vote({ Matrix: 1, Stargate: 3, Ghostbusters: 5, Terminator: 4 })
myPoll.vote({ Matrix: 1, Stargate: 0, Ghostbusters: 3, Terminator: 5 })
myPoll.vote({ Matrix: 5, Stargate: 1, Ghostbusters: 1, Terminator: 3 })
myPoll.vote({ Matrix: 3, Stargate: 4, Ghostbusters: 2, Terminator: 4 })
myPoll.vote({ Matrix: 2, Stargate: 3, Ghostbusters: 4, Terminator: 3 })
myPoll.vote({ Matrix: 4, Stargate: 5, Ghostbusters: 3, Terminator: 5 })

// test for tied results
// myPoll.vote({ Matrix: 4, Stargate: 3, Ghostbusters: 4, Terminator: 2 })
// myPoll.vote({ Matrix: 3, Stargate: 4, Ghostbusters: 3, Terminator: 1 })

const {options, ties} = myPoll.getSortedOptions()
console.log('getSortedOptions()', {options, ties})

if (typeof document !== 'undefined') {
  document.body.innerHTML = ''
  const app = new App(myPoll)
  const scoreRatios = myPoll.getScoreRatio()
  app.update(options.map(optionName => scoreRatios.find(scoreRatio => scoreRatio.name === optionName)))
  mount(document.body, app)
}
