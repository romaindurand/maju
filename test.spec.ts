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

  describe('getResults', () => {
    it('should return empty array when no votes have been cast', () => {
      const poll = createPoll(['Option A', 'Option B'])
      const results = poll.getResults()

      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({
        rank: 0,
        name: 'Option A',
        scoreRatio: [0, 0, 0, 0, 0, 0],
        scoreCount: [0, 0, 0, 0, 0, 0],
        medianGrade: 0,
        score: 0
      })
    })

    it('should calculate correct results for a single vote', () => {
      const poll = createPoll(['Option A', 'Option B'])
      poll.vote({ 'Option A': 5, 'Option B': 2 })
      const results = poll.getResults()

      expect(results).toHaveLength(2)
      expect(results[0].name).toBe('Option A')
      expect(results[0].scoreCount).toEqual([0, 0, 0, 0, 0, 1])
      expect(results[0].scoreRatio).toEqual([0, 0, 0, 0, 0, 1])
      expect(results[0].medianGrade).toBe(5)
      expect(results[0].score).toBe(1)

      expect(results[1].name).toBe('Option B')
      expect(results[1].scoreCount).toEqual([0, 0, 1, 0, 0, 0])
      expect(results[1].scoreRatio).toEqual([0, 0, 1, 0, 0, 0])
      expect(results[1].medianGrade).toBe(2)
      expect(results[1].score).toBe(1)
    })

    it('should calculate correct scoreRatio with multiple votes', () => {
      const poll = createPoll(['Option A', 'Option B'])
      poll.vote({ 'Option A': 5, 'Option B': 2 })
      poll.vote({ 'Option A': 4, 'Option B': 3 })
      poll.vote({ 'Option A': 5, 'Option B': 1 })
      poll.vote({ 'Option A': 3, 'Option B': 2 })
      const results = poll.getResults()

      expect(results[0].name).toBe('Option A')
      expect(results[0].scoreCount).toEqual([0, 0, 0, 1, 1, 2])
      expect(results[0].scoreRatio).toEqual([0, 0, 0, 0.25, 0.25, 0.5])
      expect(results[0].score).toBe(1)

      expect(results[1].name).toBe('Option B')
      expect(results[1].scoreCount).toEqual([0, 1, 2, 1, 0, 0])
      expect(results[1].scoreRatio).toEqual([0, 0.25, 0.5, 0.25, 0, 0])
      expect(results[1].score).toBe(1)
    })

    it('should assign correct ranks to all options', () => {
      const poll = createPoll(['Option A', 'Option B', 'Option C'])
      poll.vote({ 'Option A': 5, 'Option B': 3, 'Option C': 1 })
      const results = poll.getResults()

      expect(results[0].rank).toBe(0)
      expect(results[1].rank).toBe(1)
      expect(results[2].rank).toBe(2)
    })

    it('should calculate median grade correctly', () => {
      const poll = createPoll(['Option A'])
      poll.vote({ 'Option A': 5 })
      poll.vote({ 'Option A': 4 })
      poll.vote({ 'Option A': 3 })
      poll.vote({ 'Option A': 2 })
      poll.vote({ 'Option A': 1 })
      const results = poll.getResults()

      // With 5 votes, median should be the 3rd value (index 2) when sorted
      expect(results[0].medianGrade).toBe(3)
    })

    it('should work with the demo test data', () => {
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

      const results = poll.getResults()

      expect(results).toHaveLength(4)
      expect(results.every(r => r.rank >= 0 && r.rank <= 3)).toBe(true)
      expect(results.every(r => r.scoreRatio.length === 6)).toBe(true)
      expect(results.every(r => r.scoreCount.length === 6)).toBe(true)
      expect(results.every(r => r.score === 1)).toBe(true) // All scoreRatios should sum to 1
      expect(results.every(r => r.medianGrade >= 0 && r.medianGrade <= 5)).toBe(true)
    })

    it('should handle different GRADING_LEVELS configuration', () => {
      const poll = createPoll(['Option A', 'Option B'], { GRADING_LEVELS: 4 })
      poll.vote({ 'Option A': 3, 'Option B': 1 })
      poll.vote({ 'Option A': 2, 'Option B': 0 })
      const results = poll.getResults()

      expect(results[0].scoreRatio).toHaveLength(4)
      expect(results[0].scoreCount).toHaveLength(4)
      expect(results[1].scoreRatio).toHaveLength(4)
      expect(results[1].scoreCount).toHaveLength(4)
    })

    it('should maintain consistency between scoreCount and scoreRatio', () => {
      const poll = createPoll(['Option A'])
      poll.vote({ 'Option A': 0 })
      poll.vote({ 'Option A': 1 })
      poll.vote({ 'Option A': 2 })
      poll.vote({ 'Option A': 3 })
      poll.vote({ 'Option A': 4 })
      poll.vote({ 'Option A': 5 })
      const results = poll.getResults()

      const totalVotes = results[0].scoreCount.reduce((sum, count) => sum + count, 0)
      expect(totalVotes).toBe(6)

      const sumOfRatios = results[0].scoreRatio.reduce((sum, ratio) => sum + ratio, 0)
      expect(sumOfRatios).toBeCloseTo(1, 10) // Should sum to 1 with floating point precision
    })

    it('should use addVotes method correctly', () => {
      const poll = createPoll(['Option A', 'Option B'])
      poll.addVotes([
        { 'Option A': 5, 'Option B': 2 },
        { 'Option A': 4, 'Option B': 3 }
      ])
      const results = poll.getResults()

      expect(results).toHaveLength(2)
      expect(results[0].scoreCount).toEqual([0, 0, 0, 0, 1, 1])
      expect(results[1].scoreCount).toEqual([0, 0, 1, 1, 0, 0])
    })

    it('should handle all votes with same score', () => {
      const poll = createPoll(['Option A'])
      poll.vote({ 'Option A': 3 })
      poll.vote({ 'Option A': 3 })
      poll.vote({ 'Option A': 3 })
      const results = poll.getResults()

      expect(results[0].scoreCount).toEqual([0, 0, 0, 3, 0, 0])
      expect(results[0].scoreRatio).toEqual([0, 0, 0, 1, 0, 0])
      expect(results[0].medianGrade).toBe(3)
      expect(results[0].score).toBe(1)
    })
  })
})
