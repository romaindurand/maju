import { describe, it, expect } from 'vitest'
import createPoll from './index'

describe('maju', () => {
  it('exported function should return an object', () => {
    const poll = createPoll(['test'])
    expect(typeof poll).toBe('object')
  })

  it('demo test', () => {
    const poll = createPoll(['Matrix', 'Terminator', 'Stargate', 'Ghostbusters'])
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

    expect(poll.getSortedOptions()).toEqual({ options: ['Ghostbusters', 'Terminator', 'Matrix', 'Stargate'], ties: [] })
    expect(poll.getWinner().length).toBe(1)
    expect(poll.getWinner()[0]).toBe('Ghostbusters')
  })

  it('tie vote', () => {
    const poll = createPoll(['a', 'b', 'c', 'd'])
    poll.vote({ a: 3, b: 4, c: 3, d: 4 })
    poll.vote({ a: 4, b: 3, c: 4, d: 3 })
    const winner = poll.getWinner()
    expect(winner).toEqual(['a', 'b', 'c', 'd'])
  })
})
