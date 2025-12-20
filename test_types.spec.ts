import { describe, it, expectTypeOf, expect } from 'vitest'
import createPoll, { type Poll, type OptionResult } from './index'

// These tests validate compile-time types using Vitest's expectTypeOf

describe('type-level: createPoll generic keys', () => {
  it('infers literal option keys without as const for inline literals (TS >=5.3 const params)', () => {
    const p = createPoll(['a', 'b'])
    // Poll type carries the tuple of options
    type ExpectedPoll = Poll<readonly ['a', 'b']>
    expectTypeOf(p).toEqualTypeOf<ExpectedPoll>()

    // addVotes accepts only keys 'a' | 'b'
    p.addVotes([{ a: 1, b: 0 }])
    // Invalid usages are type-checked but not executed
    // @ts-expect-error: invalid key 'c'
    expect(() => p.addVotes([{ a: 1, c: 0 }])).toThrow()
    // @ts-expect-error: missing key 'b'
    expect(() => p.addVotes([{ a: 1 }])).toThrow()

    // vote accepts only keys 'a' | 'b'
    p.vote({ a: 0, b: 1 })
    // @ts-expect-error: extra key
    expect(() => p.vote({ a: 0, b: 1, c: 2 })).toThrow()
      

    // Result names are restricted to the option union
    expectTypeOf(p.getResults()).toEqualTypeOf<OptionResult<readonly ['a', 'b'] >[]>()
    const names = p.getWinner()
    expectTypeOf(names).toEqualTypeOf<Array<'a' | 'b'>>()
  })

  it('non-literal arrays widen to string keys (backward compatible)', () => {
    const arr: string[] = ['a', 'b']
    const p = createPoll(arr)
    // Should accept any string keys at type-level (do not execute)
    // no ts expect error
    expect(() => p.addVotes([{ any: 1 } as Record<string, number>])).toThrow()
  })
})
