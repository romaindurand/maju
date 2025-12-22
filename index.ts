import {
  InvalidOptionsError,
  MissingOptionScoreError,
  InvalidScoreError,
  VoteStructureError
} from './errors.js';

export * from './errors.js';

export interface Configuration {
  GRADING_LEVELS?: number;
}

export interface OptionVotes<TOptions extends readonly string[] = readonly string[]> {
  name: TOptions[number];
  votes: number[];
}

export interface SortedOptionsResult<TOptions extends readonly string[] = readonly string[]> {
  options: TOptions[number][];
  ties: [TOptions[number], TOptions[number]][];
}

export interface Poll<TOptions extends readonly string[] = readonly string[]> {
  getOptions: () => TOptions[number][];
  addVotes: (votes: Record<TOptions[number], number>[]) => void;
  getWinner: () => TOptions[number][];
  getResults: () => OptionResult<TOptions>[];
  GRADING_LEVELS: number;
}

export type OptionResult<TOptions extends readonly string[] = readonly string[]> = {
  rank: number;
  name: TOptions[number];
  medianGrade: number;
  distribution: {
    count: number;
    percentage: number;
  }[]
}

export default function createPoll<const TOptions extends readonly string[]>(
  optionList: TOptions,
  configuration: Configuration = { GRADING_LEVELS: 6 }
): Poll<TOptions> {
  const GRADING_LEVELS = configuration.GRADING_LEVELS ?? 6;
  if (!optionList || !Array.isArray(optionList)) throw new InvalidOptionsError();
  const normalizedOptions = [...optionList];
  const votes: number[][] = [];

  function vote(ratings: Record<TOptions[number], number>) {
    const givenOptionNames = Object.keys(ratings).sort();
    const optionNames = [...normalizedOptions].sort();
    stringArrayEqual(optionNames, givenOptionNames);
    givenOptionNames.forEach((ratingKey) => {
      const score = ratings[ratingKey as TOptions[number]];
      if (score === undefined) throw new MissingOptionScoreError(ratingKey);
      isScoreValid(score, GRADING_LEVELS);
    });
    const voteGrades = normalizedOptions.map((name) => ratings[name as TOptions[number]]);
    votes.push(voteGrades);
  }

  function addVotes(votesArr: Record<TOptions[number], number>[]) {
    votesArr.forEach((v) => {
      vote(v);
    });
  }

  function getWinner(): TOptions[number][] {
    const results = getResults();
    const highestRank = results[0].rank;
    return results.filter((r) => r.rank === highestRank).map((r) => r.name);
  }

  function getVotes(): OptionVotes<TOptions>[] {
    return normalizedOptions.map((name, optIndex) => {
      const votesArr = votes.map((v) => v[optIndex]).sort((a, b) => a - b);
      return {
        name: name as TOptions[number],
        votes: votesArr,
      };
    });
  }

  function getResults(): OptionResult<TOptions>[] {
    const sortedVotes = getVotes().sort(sortAlgorithm);
    let currentRank = 0;

    return sortedVotes.map((option, index) => {
      if (index > 0) {
        const comparison = sortAlgorithm(sortedVotes[index - 1], option);
        if (comparison !== 0) {
          currentRank += 1;
        }
      }

      const totalVotes = votes.length;

      const counts = new Array(GRADING_LEVELS).fill(0);
      option.votes.forEach((grade) => {
        counts[grade] += 1;
      });

      const distribution = counts.map((count) => ({
        count,
        percentage: totalVotes === 0 ? 0 : count / totalVotes,
      }));

      let medianGrade = 0;
      if (totalVotes > 0) {
        medianGrade = getMedianGrade(option.votes);
      }

      return {
        rank: currentRank,
        name: option.name,
        medianGrade,
        distribution,
      };
    });
  }

  return {
    getOptions: () => [...normalizedOptions] as TOptions[number][],
    addVotes,
    getWinner,
    getResults,
    GRADING_LEVELS,
  };
}

function sortAlgorithm<TOptions extends readonly string[]>(a: OptionVotes<TOptions>, b: OptionVotes<TOptions>): number {
  let aMedianGrade = getMedianGrade(a.votes);
  let bMedianGrade = getMedianGrade(b.votes);
  if (aMedianGrade !== bMedianGrade) return bMedianGrade - aMedianGrade;

  const aVotes = [...a.votes];
  const bVotes = [...b.votes];
  while (aMedianGrade === bMedianGrade && a.votes.length) {
    substractMedianVote(a);
    substractMedianVote(b);
    aMedianGrade = getMedianGrade(a.votes);
    bMedianGrade = getMedianGrade(b.votes);
  }
  if (a.votes.length === 0) aMedianGrade = bMedianGrade = 0;
  a.votes = aVotes;
  b.votes = bVotes;
  return bMedianGrade - aMedianGrade;
}

function substractMedianVote<TOptions extends readonly string[]>(option: OptionVotes<TOptions>): number {
  const medianGrade = getMedianGrade(option.votes);
  let index = 0;
  while (index < option.votes.length - 1 && option.votes[index] < medianGrade) {
    index++;
  }
  option.votes.splice(index, 1);
  return getMedianGrade(option.votes);
}

function getMedianGrade(votes: number[]): number {
  if (votes.length === 1) return votes[0];
  const medianIndex = Math.ceil(votes.length / 2) - 1;
  return votes[medianIndex];
}

function isScoreValid(score: number, GRADING_LEVELS: number): boolean {
  const isValid = Number.isInteger(score) && score >= 0 && score < GRADING_LEVELS;
  if (!isValid)
    throw new InvalidScoreError(score, GRADING_LEVELS);
  return isValid;
}

function stringArrayEqual(array1: string[], array2: string[]): boolean {
  const areEqual = array1.every((value, index) => value === array2[index]) && array1.length === array2.length;
  if (!areEqual)
    throw new VoteStructureError(array2, array1);
  return areEqual;
}
