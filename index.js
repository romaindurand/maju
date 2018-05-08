const isEqual = require('lodash/isEqual')
/**
 * @param {Array} optionList An array of String or Objects {name: String, ...}
 */
module.exports = function createPoll (optionList, configuration = { GRADING_LEVELS: 6 }) {
  const { GRADING_LEVELS } = configuration
  const normalizedOptions = normalizeOptions(optionList)
  var votes = []

  return {
    getOptions: () => normalizedOptions,
    getVotes: () => votes,
    vote,
    getScoreCount,
    getScoreRatio,
    getWinner,
    isTie
  }

  // Poll-context-bound functions

  /**
   * Grade can vary between 0 and (GRADING_LEVELS - 1), (GRADING_LEVELS - 1) being the best possible rating, and 0 the worst.
   * Name must be a String equal to one of the possible options names.
   * GRADING_LEVELS default is 6
   * @param {Object[]} ratings - An Array of rating Objects { name: String, grade: Integer }
   * @param {String} ratings[].name - The name of the option
   * @param {Number} ratings[].grade - the score given for this option
   */
  function vote (ratings) {
    const optionNames = Object.keys(ratings).sort()
    if (!isEqual(optionNames, getOptionNames(normalizedOptions).sort())) throw new Error('A vote must be an Object { optionName1: score, optionName2: score, ... }')
    optionNames.forEach(ratingKey => {
      const score = ratings[ratingKey]
      if (!isScoreValid(score, GRADING_LEVELS)) {
        throw new Error(`A score must be an Integer between 0 and ${GRADING_LEVELS - 1} (${GRADING_LEVELS} possible grades)`)
      }
    })
    const votegrades = normalizedOptions.map(option => ratings[option.name], [])
    votes.push(votegrades)
  }

  function getWinner () {
    if (!isTie()) {
      const bestGrade = getBestGrade()
      return getScoreRatio().filter(option => getMedianGrade(option.scoreRatio) === bestGrade)[0].name
    }
    // TODO : handle tie
  }

  function isTie () {
    const bestGrade = getBestGrade()
    return getScoreRatio()
      .map(option => getMedianGrade(option.scoreRatio))
      .filter(medianGrade => medianGrade === bestGrade).length > 1
  }

  function getBestGrade () {
    return getScoreRatio().reduce((memo, option) => {
      const medianGrade = getMedianGrade(option.scoreRatio)
      memo = Math.max(medianGrade, memo)
      return memo
    }, 0)
  }

  /**
   * @typedef {Object} ScoreRatioOption The return value format
   * @property {String} name The option name
   * @property {number[]} scoreRatio An array of ratios
   * Returns an array of option objects { name: String, scoreRatio: Array }
   * Each scoreRatio item represents the ratio of voters giving at least the item index score for this option
   * @returns {ScoreRatioOption[]}
   */
  function getScoreRatio () {
    return getScoreCount().map(option => {
      const scoreRatio = option.scoreCount.map(scoreCount => scoreCount / votes.length)
      return {
        name: option.name,
        scoreRatio
      }
    })
  }

  /**
   * Returns an array of option objects { name: String, scoreCount: Array }
   * Each scoreRatio item represents the amount of voters giving at least the item index score for this option
   * @returns {Array}
   */
  function getScoreCount () {
    return normalizedOptions.map((option, index) => {
      const scoreCount = votes.reduce((memo, vote) => {
        const givenNote = vote[index]
        memo[givenNote] += 1
        return memo
      }, new Array(GRADING_LEVELS).fill(0))
      return {
        name: option.name,
        scoreCount
      }
    })
  }
}

// Non-context-bound functions

/**
 * @param {Object[]} normalizedOptions An array of option objects with a 'name' attribute
 * @param {String} normalizedOptions.name The otion name
 * @returns {String[]} An array of each options name
 */
function getOptionNames (normalizedOptions) {
  return normalizedOptions.map(option => option.name)
}

function normalizeOptions (options) {
  if (!options || !Array.isArray(options)) throw new Error('You must provide an Array of available options')
  return options.reduce((memo, option, index) => {
    if (typeof option === 'string') {
      memo.push({name: option})
      return memo
    }
    if (typeof option.name !== 'string') throw new Error(`Options objects must at least have a 'name' property`)
    memo.push(Object.assign({}, option))
    return memo
  }, [])
}

function getMedianGrade (scoreRatio) {
  let medianGrade = 0
  for (let acc = scoreRatio[medianGrade]; acc < 0.5; acc += scoreRatio[medianGrade]) medianGrade += 1
  return medianGrade
}

function isScoreValid (score, GRADING_LEVELS) {
  return Number.isInteger(score) || score < 0 || score > (GRADING_LEVELS - 1);
}
