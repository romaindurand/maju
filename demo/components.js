const { el, list } = require('redom')
const gradient = require('gradient-color').default

class ScoreCard {
  constructor () {
    this.name = el('div')
    this.graph = new ScoreGraph()
    this.el = el('div', [this.name, this.graph])
    this.el.style.float = 'left'
    this.el.style.margin = '10px'
  }
  update (data) {
    this.graph.update(data)
    this.name.textContent = data.name
  }
}

class ScoreGraph {
  constructor () {
    this.el = list('div', GradeGraph)
  }
  update (data) {
    this.el.update(data.scoreRatio.slice().reverse(), {
      width: data.width,
      height: data.height,
      colors: gradient(['#00FF00', '#FF0000'], data.scoreRatio.length)
    })
  }
}

class GradeGraph {
  constructor () {
    this.el = el('div')
  }
  update (data, index, items, context) {
    this.el.style.backgroundColor = context.colors[index]
    this.el.style.width = `${context.width}px`
    this.el.style.height = `${data * context.height}px`
  }
}

module.exports = {
  ScoreCard
}
