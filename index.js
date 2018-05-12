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
    isTie,
    getSortedOptions
  }

  // Poll-context-bound functions
  /**
   * @param {Object} ratings An object with a key for each vote option. The corresponding values are the grade given for each option.
   * Grade is an Integer and can vary between 0 and 5 (configurable, see readme)
   */
  function vote (ratings) {
    const givenOptionNames = Object.keys(ratings).sort()
    const optionNames = getOptionNames(normalizedOptions).sort()
    // Check if the given ratings has a key for each otion
    if (!stringArrayEqual(optionNames, givenOptionNames)) {
      throw new Error(`Given object keys doesn't match available options :\ngiven:    ${givenOptionNames.toString()}\nexpected: ${optionNames}`)
    }
    givenOptionNames.forEach(ratingKey => {
      const score = ratings[ratingKey]
      if (!isScoreValid(score, GRADING_LEVELS)) {
        throw new Error(`A score must be an Integer between 0 and ${GRADING_LEVELS - 1} (${GRADING_LEVELS} possible grades)\ngiven score: ${score}`)
      }
    })
    const votegrades = normalizedOptions.map(option => ratings[option.name], [])
    votes.push(votegrades)
  }

  function getWinner () {
    return getSortedOptions()[0].name
  }

  function getSortedOptions () {
    return getScoreRatio().sort((a, b) => {
      const aMedianGrade = getMedianGrade(a.scoreRatio)
      const bMedianGrade = getMedianGrade(b.scoreRatio)
      if (aMedianGrade !== bMedianGrade) return bMedianGrade - aMedianGrade

      // Tie-break algorithm
      // Following the process described here : https://fr.wikipedia.org/wiki/Jugement_majoritaire#D%C3%A9partage_des_%C3%A9galit%C3%A9s
      // We list all lose/win-criterias associated with the appropriate return value, and sort them to find the highest ratio value
      const A_LOSES = 1
      const A_WIN = -1

      const criterias = []
      const aLoseCriteria = { ratio: getRatioBelowMedian(a.scoreRatio), returnValue: A_LOSES }
      const bLoseCriteria = { ratio: getRatioBelowMedian(b.scoreRatio), returnValue: A_WIN }
      const aWinCriteria = { ratio: getRatioAboveMedian(a.scoreRatio), returnValue: A_WIN }
      const bWinCriteria = { ratio: getRatioAboveMedian(b.scoreRatio), returnValue: A_LOSES }

      // If lose criteria ratios are equal, we ignore them (not strictly comarable)
      if (aLoseCriteria.ratio !== bLoseCriteria.ratio) {
        criterias.push(aLoseCriteria)
        criterias.push(bLoseCriteria)
      }
      // If win criteria ratios are equal, we ignore them (not strictly comarable)
      if (aWinCriteria.ratio !== bWinCriteria.ratio) {
        criterias.push(aWinCriteria)
        criterias.push(bWinCriteria)
      }

      const sortedCriterias = criterias.slice().sort((critA, critB) => critB.ratio - critA.ratio)
      if (sortedCriterias.length === 0) {
        // TODO : handle this improbable situation more gracefully
        // by searching who benefits/loses the most in the upper/lower ratios
        return 0
      }
      return sortedCriterias[0].returnValue
    })
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
  return Number.isInteger(score) || score < 0 || score > (GRADING_LEVELS - 1)
}

function getRatioAboveMedian (scoreRatio) {
  const medianGrade = getMedianGrade(scoreRatio)
  return scoreRatio.reduce((memo, ratio, index) => {
    if (index > medianGrade) memo += ratio
    return memo
  }, 0)
}

function getRatioBelowMedian (scoreRatio) {
  const medianGrade = getMedianGrade(scoreRatio)
  return scoreRatio.reduce((memo, ratio, index) => {
    if (index < medianGrade) memo += ratio
    return memo
  }, 0)
}

function stringArrayEqual (array1, array2) {
  return array1.every((value, index) => value === array2[index]) && array1.length === array2.length
}
