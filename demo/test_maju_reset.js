
import createPoll from 'maju';

const candidates = ['A', 'B'];
let p1 = createPoll(candidates);
p1.addVotes([{ A: 5, B: 0 }]);
console.log('P1 Scores:', JSON.stringify(p1.getScoreRatio()));

let p2 = createPoll(candidates);
console.log('P2 Scores (Should be empty/zeros):', JSON.stringify(p2.getScoreRatio()));
