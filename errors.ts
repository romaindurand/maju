export class MajuError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MajuError';
  }
}

export class InvalidOptionsError extends MajuError {
  constructor(message: string = 'You must provide an Array of available options') {
    super(message);
    this.name = 'InvalidOptionsError';
  }
}

export class InvalidVoteError extends MajuError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidVoteError';
  }
}

export class MissingOptionScoreError extends InvalidVoteError {
  constructor(public optionName: string) {
    super(`Missing score for option '${optionName}'`);
    this.name = 'MissingOptionScoreError';
  }
}

export class InvalidScoreError extends InvalidVoteError {
  constructor(public score: number, public gradingLevels: number) {
    super(`A score must be an Integer between 0 and ${gradingLevels - 1} (${gradingLevels} possible grades)\ngiven score: ${score}`);
    this.name = 'InvalidScoreError';
  }
}

export class VoteStructureError extends InvalidVoteError {
  constructor(public given: string[], public expected: string[]) {
    super(`Given object keys doesn't match available options :\ngiven:    ${given.toString()}\nexpected: ${expected.toString()}`);
    this.name = 'VoteStructureError';
  }
}
