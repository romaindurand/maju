const { mount } = require('redom')
const createPoll = require('../index')
const { ScoreCard } = require('./components')

const myPoll = createPoll(['Matrix', 'Ghostbusters', 'Terminator', 'Stargate'])
myPoll.vote({ Matrix: 5, Stargate: 1, Ghostbusters: 0, Terminator: 2 })
myPoll.vote({ Matrix: 1, Stargate: 3, Ghostbusters: 1, Terminator: 1 })
myPoll.vote({ Matrix: 2, Stargate: 3, Ghostbusters: 5, Terminator: 4 })
myPoll.vote({ Matrix: 3, Stargate: 0, Ghostbusters: 3, Terminator: 5 })
myPoll.vote({ Matrix: 5, Stargate: 2, Ghostbusters: 4, Terminator: 2 })
myPoll.vote({ Matrix: 2, Stargate: 3, Ghostbusters: 0, Terminator: 0 })
myPoll.vote({ Matrix: 2, Stargate: 3, Ghostbusters: 5, Terminator: 4 })
myPoll.vote({ Matrix: 0, Stargate: 0, Ghostbusters: 3, Terminator: 5 })
myPoll.vote({ Matrix: 5, Stargate: 1, Ghostbusters: 0, Terminator: 3 })
myPoll.vote({ Matrix: 0, Stargate: 4, Ghostbusters: 2, Terminator: 2 })
myPoll.vote({ Matrix: 2, Stargate: 3, Ghostbusters: 4, Terminator: 4 })
myPoll.vote({ Matrix: 4, Stargate: 5, Ghostbusters: 3, Terminator: 5 })
console.log('getScoreRatio()', myPoll.getScoreRatio())
console.log('And the winner is !', myPoll.getWinner())

if (typeof document !== 'undefined') {
  myPoll.getScoreRatio().forEach(option => {
    const optionGrah = new ScoreCard()
    optionGrah.update({
      scoreRatio: option.scoreRatio,
      name: option.name,
      height: 300,
      width: 20
    })
    mount(document.body, optionGrah)
  })
}
