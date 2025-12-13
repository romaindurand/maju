export interface Configuration {
  GRADING_LEVELS?: number;
}

export interface OptionInputObject {
  name: string;
  [key: string]: any;
}

export type OptionInput = string | OptionInputObject;

export interface ScoreRatioOption {
  name: string;
  scoreRatio: number[];
}

export interface VotesOption {
  name: string;
  votes: number[];
}

export interface ScoreCountOption {
  name: string;
  scoreCount: number[];
}

export interface SortedOptionsResult {
  options: string[];
  ties: [string, string][];
}

export interface Poll {
  getOptions: () => OptionInputObject[];
  getVotes: () => VotesOption[];
  /**
   * @deprecated This function is deprecated. Use `addVotes` instead.
   */
  vote: (ratings: Record<string, number>) => void;
  addVotes: (votes: Record<string, number>[]) => void;
  getScoreCount: () => ScoreCountOption[];
  getScoreRatio: () => ScoreRatioOption[];
  getWinner: () => string[];
  getSortedOptions: () => SortedOptionsResult;
  GRADING_LEVELS: number;
}

export default function createPoll(optionList: OptionInput[], configuration: Configuration = { GRADING_LEVELS: 6 }): Poll {
  const GRADING_LEVELS = configuration.GRADING_LEVELS ?? 6;
  const normalizedOptions = normalizeOptions(optionList);
  const votes: number[][] = [];

  function vote(ratings: Record<string, number>) {
    const givenOptionNames = Object.keys(ratings).sort();
    const optionNames = getOptionNames(normalizedOptions).sort();
    stringArrayEqual(optionNames, givenOptionNames);
    givenOptionNames.forEach((ratingKey) => {
      const score = ratings[ratingKey];
      if (score === undefined) throw new Error(`Missing score for option '${ratingKey}'`);
      isScoreValid(score, GRADING_LEVELS);
    });
    const voteGrades = normalizedOptions.map((option) => ratings[option.name]);
    votes.push(voteGrades);
  }

  function addVotes(votes: Record<string, number>[]) {
    votes.forEach((v) => {
      vote(v);
    });
  }

  function getWinner(): string[] {
    const { options, ties } = getSortedOptions();
    const winners = [options[0]];

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
    );
    return [...winners, ...tiedWithWinner];
  }

  function getSortedOptions(): SortedOptionsResult {
    const ties: [string, string][] = [];
    const options = getVotes()
      .sort((a, b) => {
        const value = sortAlgorithm(a, b);
        if (value === 0) ties.push([a.name, b.name]);
        return value;
      })
      .map((option) => option.name);
    return { options, ties };
  }

  function getScoreRatio(): ScoreRatioOption[] {
    return getScoreCount().map((option) => {
      const scoreRatio = option.scoreCount.map((scoreCount) => scoreCount / votes.length);
      return {
        name: option.name,
        scoreRatio,
      };
    });
  }

  function getVotes(): VotesOption[] {
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

  function getScoreCount(): ScoreCountOption[] {
    return normalizedOptions.map((option, index) => {
      const scoreCount = votes.reduce<number[]>((memo, vote) => {
        const givenNote = vote[index];
        memo[givenNote] += 1;
        return memo;
      }, new Array(GRADING_LEVELS).fill(0));
      return {
        name: option.name,
        scoreCount,
      };
    });
  }

  return {
    getOptions: () => normalizedOptions,
    getVotes,
    vote,
    addVotes,
    getScoreCount,
    getScoreRatio,
    getWinner,
    getSortedOptions,
    GRADING_LEVELS,
  };
}

function sortAlgorithm(a: VotesOption, b: VotesOption): number {
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

function substractMedianVote(option: VotesOption): number {
  const medianGrade = getMedianGrade(option.votes);
  let index = 0;
  while (index < option.votes.length - 1 && option.votes[index] < medianGrade) {
    index++;
  }
  option.votes.splice(index, 1);
  return getMedianGrade(option.votes);
}

function getOptionNames(normalizedOptions: OptionInputObject[]): string[] {
  return normalizedOptions.map((option) => option.name);
}

function normalizeOptions(options: OptionInput[]): OptionInputObject[] {
  if (!options || !Array.isArray(options)) throw new Error('You must provide an Array of available options');
  return options.reduce<OptionInputObject[]>((memo, option) => {
    if (typeof option === 'string') {
      memo.push({ name: option });
      return memo;
    }
    if (typeof (option as OptionInputObject).name !== 'string') throw new Error(`Options objects must at least have a 'name' property`);
    memo.push(Object.assign({}, option));
    return memo;
  }, []);
}

function getMedianGrade(votes: number[]): number {
  if (votes.length === 1) return votes[0];
  const medianIndex = Math.ceil(votes.length / 2) - 1;
  return votes[medianIndex];
}

function isScoreValid(score: number, GRADING_LEVELS: number): boolean {
  const isValid = Number.isInteger(score) || score < 0 || score > GRADING_LEVELS - 1;
  if (!isValid)
    throw new Error(
      `A score must be an Integer between 0 and ${GRADING_LEVELS - 1} (${GRADING_LEVELS} possible grades)\ngiven score: ${score}`
    );
  return isValid;
}

function stringArrayEqual(array1: string[], array2: string[]): boolean {
  const areEqual = array1.every((value, index) => value === array2[index]) && array1.length === array2.length;
  if (!areEqual)
    throw new Error(
      `Given object keys doesn't match available options :\ngiven:    ${array1.toString()}\nexpected: ${array2.toString()}`
    );
  return areEqual;
}
