import { el, list, text } from 'redom'
import tinygradient from 'tinygradient'

class App {
  constructor (majuPoll) {
    this.majuPoll = majuPoll
    this.winner = el('h1')
    this.winner.style.fontFamily = 'Arial'
    this.scoreCardList = list('div', ScoreCard)
    this.voteForm = new VoteForm({
      voteCallback: (voteObject) => {
        this.majuPoll.vote(voteObject)
        const scoreRatios = this.majuPoll.getScoreRatio()
        const data = this.majuPoll.getSortedOptions().options.map(optionName => scoreRatios.find(scoreRatio => scoreRatio.name === optionName))
        this.update(data)
      },
      optionNames: this.majuPoll.getOptions().map(option => option.name),
      gradingLevels: majuPoll.GRADING_LEVELS
    })
    this.el = el('div',
      [this.winner, this.scoreCardList, el('div', { style: { clear: 'left' } }), this.voteForm],
      { style: appStyle }
    )
  }
  update (data) {
    this.scoreCardList.update(data.map(option => Object.assign({}, option, { height: 300, width: 35 })))
    this.voteForm.update({
      optionNames: this.majuPoll.getOptions().map(option => option.name),
      gradingLevels: this.majuPoll.GRADING_LEVELS
    })
    const winner = this.majuPoll.getWinner()
    this.winner.textContent = winner.length === 1 ? `Winner: ${winner[0]}` : `Tie : ${winner.join(', ')}`
  }
}

// Score display

class ScoreCard {
  constructor () {
    this.name = text('')
    this.graph = new ScoreGraph()
    this.el = el('div', [this.name, this.graph], {style: scoreCardStyle})
  }
  update (data, index, items, context) {
    this.graph.update(data)
    this.name.textContent = data.name
  }
}

class ScoreGraph {
  constructor () {
    this.gradeGraphList = list('div', GradeGraph)
    this.medianLine = el('div', { style: medianLineStyle })
    this.el = el('div', [
      this.gradeGraphList,
      this.medianLine
    ], { style: { position: 'relative', marginTop: '10px' } })
  }
  update (data) {
    this.medianLine.style.width = `${data.width}px`
    this.medianLine.style.left = `calc(50% - ${data.width / 2}px`
    const gradient = tinygradient(['#88FF88', '#880000'])
    const tinycolors = gradient.hsv(data.scoreRatio.length, true)
    const colors = tinycolors.map(tinycolor => tinycolor.toHexString())
    this.gradeGraphList.update(data.scoreRatio.slice().reverse(), {
      width: data.width,
      height: data.height,
      colors
    })
  }
}

class GradeGraph {
  constructor () {
    this.value = el('div', {style: {
      textAlign: 'center'
    }})
    this.el = el('div', this.value)
  }
  update (data, index, items, context) {
    this.value.textContent = `${data * 100}`.slice(0, 4) + '%'
    this.value.style.lineHeight = `${data * context.height}px`
    Object.assign(this.el.style, {
      backgroundColor: context.colors[index],
      width: `${context.width}px`,
      height: `${data * context.height}px`,
      left: `calc(50% - ${context.width / 2}px)`,
      position: 'relative',
      verticalAlign: 'middle',
      fontSize: '11px'
    })
  }
}

// Vote input

class VoteForm {
  constructor ({ voteCallback, optionNames, gradingLevels }) {
    this.voteCallback = voteCallback
    this.optionNames = optionNames
    this.gradingLevels = gradingLevels
    this.selectedValues = optionNames.reduce((memo, optionName) => {
      memo[optionName] = null
      return memo
    }, {})
    this.optionRateFormList = list('div', OptionRateForm)
    this.submitButton = el('button', {
      style: Object.assign({}, cardStyle, { cursor: 'pointer', marginTop: '10px' }),
      textContent: 'Vote !'
    })
    this.submitButton.addEventListener('click', event => {
      const voteObject = this.optionRateFormList.views.reduce((memo, view) => {
        memo[view.name.textContent] = view.selectedValue
        return memo
      }, {})
      voteCallback(voteObject)
    })
    this.el = el('div', [this.optionRateFormList, this.submitButton], {style: Object.assign({}, cardStyle, {
      maxWidth: '500px'
    })})
  }
  updateSelectedValue (optionName, value) {
    this.selectedValues[optionName] = value
    this.update()
  }
  update () {
    this.optionRateFormList.update(this.optionNames.map(optionName => ({
      name: optionName,
      selectedValue: this.selectedValues[optionName]
    })), {
      gradingLevels: this.gradingLevels,
      updateCallback: this.updateSelectedValue.bind(this)
    })
  }
}

class OptionRateForm {
  constructor () {
    this.name = el('div', {style: {
      float: 'left',
      width: '100px',
      height: '50px',
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: '50px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }})
    this.gradeBoxList = list('div', GradeBox)
    Object.assign(this.gradeBoxList.el.style, {
      display: 'grid',
      gridAutoRows: 'minmax(50px, auto)',
      gridTemplateColumns: 'repeat(6; 1fr)',
      gridColumnGap: '5px'
    })
    this.el = el('div', [this.name, this.gradeBoxList], {style: {
      backgroundColor: 'lightgrey'
    }})
  }
  update ({ name, selectedValue }, index, items, { gradingLevels, updateCallback }) {
    this.selectedValue = selectedValue
    this.gradeBoxList.update(new Array(gradingLevels).fill(name), { selectedValue, updateCallback })
    this.name.textContent = name
    this.name.title = name
  }
}

class GradeBox {
  constructor () {
    this.el = el('div', {style: {
      width: '40px',
      height: '40px',
      margin: 'auto',
      cursor: 'pointer'
    }})
  }
  onmount () {
    this.el.addEventListener('click', event => {
      this.updateCallback(this.name, this.value)
    })
  }
  update (data, index, items, { selectedValue, updateCallback }) {
    this.updateCallback = updateCallback
    this.name = data
    this.value = index
    this.el.style.gridColumn = index + 1
    this.el.style.backgroundColor = this.value === selectedValue ? 'black' : 'white'
  }
}

export { App }

// Style
const cardStyle = {
  backgroundColor: 'white',
  padding: '10px',
  boxShadow: '0 0 7px black',
  border: '1px solid lightgrey',
  borderRadius: '3px'
}

const scoreCardStyle = Object.assign({}, cardStyle, {
  float: 'left',
  margin: '10px',
  paddingBottom: '10px'
})

const appStyle = { fontFamily: 'Arial' }

const medianLineStyle = {
  height: '1px',
  position: 'absolute',
  top: '50%',
  backgroundColor: 'black'
}
