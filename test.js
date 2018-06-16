import test from 'ava'
import majuPoll from './index'

test('bar', async t => {
  const poll = majuPoll(['test'])
  t.is(typeof poll, 'object')
})
