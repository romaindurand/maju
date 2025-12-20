import { describe, it, expect } from 'vitest'
import createPoll, { InvalidOptionsError, MissingOptionScoreError, InvalidScoreError, VoteStructureError } from './index'

describe('maju errors', () => {
  it('should throw InvalidOptionsError when options are invalid', () => {
    expect(() => createPoll(null as any)).toThrow(InvalidOptionsError)
    expect(() => createPoll('not an array' as any)).toThrow(InvalidOptionsError)
  })

  it('should throw MissingOptionScoreError when a score is missing', () => {
    const poll = createPoll(['A', 'B'])
    // To reach MissingOptionScoreError, keys must match (pass VoteStructureError) but value must be undefined
    expect(() => poll.vote({ A: 1, B: undefined as any })).toThrow(MissingOptionScoreError)
    expect(() => poll.vote({ A: 1, B: undefined as any })).toThrow("Missing score for option 'B'")
  })

  it('should throw InvalidScoreError when score is invalid', () => {
    const poll = createPoll(['A'])
    expect(() => poll.vote({ A: -1 })).toThrow(InvalidScoreError)
    expect(() => poll.vote({ A: 6 })).toThrow(InvalidScoreError) // default levels 6 (0-5)
    expect(() => poll.vote({ A: 1.5 })).toThrow(InvalidScoreError)
  })

  it('should throw VoteStructureError when options do not match', () => {
    const poll = createPoll(['A', 'B'])
    // @ts-expect-error: invalid keys
    expect(() => poll.addVotes([{ A: 1, C: 2 }])).toThrow(VoteStructureError)
  })
})
