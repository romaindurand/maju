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

export interface ScoreRatioOption<TOptions extends readonly string[] = readonly string[]> {
  name: TOptions[number];
  scoreRatio: number[];
}

export interface VotesOption<TOptions extends readonly string[] = readonly string[]> {
  name: TOptions[number];
  votes: number[];
}

export interface ScoreCountOption<TOptions extends readonly string[] = readonly string[]> {
  name: TOptions[number];
  scoreCount: number[];
}

export interface SortedOptionsResult<TOptions extends readonly string[] = readonly string[]> {
  options: TOptions[number][];
  ties: [TOptions[number], TOptions[number]][];
}

export interface Poll<TOptions extends readonly string[] = readonly string[]> {
  getOptions: () => TOptions[number][];
  getVotes: () => VotesOption<TOptions>[];
  /**
   * @deprecated This function is deprecated. Use `addVotes` instead.
   */
  vote: (ratings: Record<TOptions[number], number>) => void;
  addVotes: (votes: Record<TOptions[number], number>[]) => void;
  /**
   * @deprecated This function is deprecated. Use `getResults` instead.
   */
  getScoreCount: () => ScoreCountOption<TOptions>[];
  /**
   * @deprecated This function is deprecated. Use `getResults` instead.
   */
  getScoreRatio: () => ScoreRatioOption<TOptions>[];
  getWinner: () => TOptions[number][];
  /**
   * @deprecated This function is deprecated. Use `getResults` instead.
   */
  getSortedOptions: () => SortedOptionsResult<TOptions>;
  getResults: () => OptionResult<TOptions>[];
  GRADING_LEVELS: number;
}

export type OptionResult<TOptions extends readonly string[] = readonly string[]> = {
  rank: number;
  name: TOptions[number];
  scoreRatio: number[];
  scoreCount: number[];
  medianGrade: number;
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
    const { options, ties } = getSortedOptions();
    const winners = [options[0]] as TOptions[number][];

    if (!ties.length) return winners;

    const tieMap: Record<string, number> = ties.reduce((memo, tie, index) => {
      if (memo[tie[0]] === undefined && memo[tie[1]] === undefined) {
        memo[tie[0]] = memo[tie[1]] = index;
      } else {
        memo[tie[0]] = memo[tie[1]] = memo[tie.find((optionName) => memo[optionName] !== undefined)!];
      }
      return memo;
    }, {} as Record<string, number>);
    const tiedWithWinner = Object.keys(tieMap).filter(
      (optionName) => tieMap[optionName] === tieMap[winners[0]] && optionName !== winners[0]
    ) as TOptions[number][];
    return [...winners, ...tiedWithWinner];
  }

  function getSortedOptions(): SortedOptionsResult<TOptions> {
    const ties: [TOptions[number], TOptions[number]][] = [];
    const options = getVotes()
      .sort((a, b) => {
        const value = sortAlgorithm(a, b);
        if (value === 0) ties.push([a.name, b.name]);
        return value;
      })
      .map((option) => option.name);
    return { options, ties };
  }

  function getScoreRatio(): ScoreRatioOption<TOptions>[] {
    return getScoreCount().map((option) => {
      const scoreRatio = option.scoreCount.map((scoreCount) => scoreCount / votes.length);
      return {
        name: option.name,
        scoreRatio,
      };
    });
  }

  function getVotes(): VotesOption<TOptions>[] {
    return getScoreCount().map((option) => {
      const votesArr = option.scoreCount.reduce<number[]>((memo, scoreCount, index) => {
        memo = memo.concat(new Array(scoreCount).fill(index));
        return memo;
      }, []);
      return {
        name: option.name,
        votes: votesArr,
      };
    });
  }

  function getScoreCount(): ScoreCountOption<TOptions>[] {
    return normalizedOptions.map((name, index) => {
      const scoreCount = votes.reduce<number[]>((memo, vote) => {
        const givenNote = vote[index];
        memo[givenNote] += 1;
        return memo;
      }, new Array(GRADING_LEVELS).fill(0));
      return {
        name: name as TOptions[number],
        scoreCount,
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

      const scoreCount = new Array(GRADING_LEVELS).fill(0);
      option.votes.forEach((grade) => {
        scoreCount[grade] += 1;
      });

      const scoreRatio = totalVotes === 0
        ? new Array(GRADING_LEVELS).fill(0)
        : scoreCount.map((count) => count / totalVotes);

      let medianGrade = 0;
      if (totalVotes > 0) {
        medianGrade = getMedianGrade(option.votes);
      }

      return {
        rank: currentRank,
        name: option.name,
        scoreRatio,
        scoreCount,
        medianGrade,
      };
    });
  }

  return {
    getOptions: () => [...normalizedOptions] as TOptions[number][],
    getVotes,
    vote,
    addVotes,
    getScoreCount,
    getScoreRatio,
    getWinner,
    getSortedOptions,
    getResults,
    GRADING_LEVELS,
  };
}

function sortAlgorithm<TOptions extends readonly string[]>(a: VotesOption<TOptions>, b: VotesOption<TOptions>): number {
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

function substractMedianVote<TOptions extends readonly string[]>(option: VotesOption<TOptions>): number {
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
