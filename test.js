import test from 'ava'
import majuPoll from './index'

test('exported function should return an object', t => {
  const poll = majuPoll(['test'])
  t.is(typeof poll, 'object')
})

test('demo test', t => {
  const poll = majuPoll(['Matrix', 'Terminator', 'Stargate', 'Ghostbusters'])
  poll.vote({ Matrix: 5, Stargate: 1, Ghostbusters: 0, Terminator: 1 })
  poll.vote({ Matrix: 1, Stargate: 3, Ghostbusters: 1, Terminator: 0 })
  poll.vote({ Matrix: 2, Stargate: 3, Ghostbusters: 5, Terminator: 3 })
  poll.vote({ Matrix: 3, Stargate: 0, Ghostbusters: 3, Terminator: 5 })
  poll.vote({ Matrix: 5, Stargate: 2, Ghostbusters: 4, Terminator: 2 })
  poll.vote({ Matrix: 4, Stargate: 3, Ghostbusters: 5, Terminator: 0 })
  poll.vote({ Matrix: 1, Stargate: 3, Ghostbusters: 5, Terminator: 4 })
  poll.vote({ Matrix: 1, Stargate: 0, Ghostbusters: 3, Terminator: 5 })
  poll.vote({ Matrix: 5, Stargate: 1, Ghostbusters: 1, Terminator: 3 })
  poll.vote({ Matrix: 3, Stargate: 4, Ghostbusters: 2, Terminator: 4 })
  poll.vote({ Matrix: 2, Stargate: 3, Ghostbusters: 4, Terminator: 3 })
  poll.vote({ Matrix: 4, Stargate: 5, Ghostbusters: 3, Terminator: 5 })
  t.deepEqual(poll.getSortedOptions(), ['Ghostbusters', 'Terminator', 'Matrix', 'Stargate'])
})
