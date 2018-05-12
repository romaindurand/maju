const { el, list } = require('redom')
const tinygradient = require('tinygradient')

class App {
  constructor () {
    this.scoreGraphList = list('div', ScoreCard)
    this.el = el('div.app',
      [this.scoreGraphList]
    )
  }
  update (data) {
    this.scoreGraphList.update(data)
  }
}

class ScoreCard {
  constructor () {
    this.name = el('div', {style: scoreCardTitleStyle})
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
    ], { style: { position: 'relative' } })
  }
  update (data) {
    this.medianLine.style.width = `${data.width}px`
    this.medianLine.style.left = `calc(50% - ${data.width / 2}px`
    const gradient = tinygradient(['#00FF00', '#FF0000'])
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
    this.el = el('div')
  }
  update (data, index, items, context) {
    Object.assign(this.el.style, {
      backgroundColor: context.colors[index],
      width: `${context.width}px`,
      height: `${data * context.height}px`,
      left: `calc(50% - ${context.width / 2}px)`,
      position: 'relative'
    })
  }
}

module.exports = {
  App
}

const scoreCardStyle = {
  float: 'left',
  margin: '10px',
  border: '1px solid lightgrey',
  paddingBottom: '10px',
  boxShadow: '0 0 7px black',
  borderRadius: '3px'
}

const scoreCardTitleStyle = { fontFamily: 'Arial', margin: '5px' }

const medianLineStyle = {
  height: '1px',
  position: 'absolute',
  top: '50%',
  backgroundColor: 'black'
}
