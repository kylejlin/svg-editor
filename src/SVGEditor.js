import React, { Component } from 'react'
import './SVGEditor.css'
import svgStarterSource from './svgStarter'

class SVGEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      source: svgStarterSource,
      orientation: this.getOrientation(),
      selectedIds: [],
      points: [],
      isEditorFocused: false
    }

    this.resultRef = React.createRef()
    this.textareaRef = React.createRef()

    window.addEventListener('resize', () => {
      this.setState({
        orientation: this.getOrientation()
      })
      // Redraw points
      this.forceUpdate()
    })

    window.addEventListener('keydown', e => {
      if (e.ctrlKey) {
        if (e.key === 'd' || (e.keyCode === 68 && !e.shiftKey)) {
          this.deleteSelectedPoints()
          e.preventDefault()
        }

        if (e.key === 'D' || (e.keyCode === 68 && e.shiftKey)) {
          this.deleteAllPoints()
          e.preventDefault()
        }

        if (e.key === 'p' || (e.keyCode === 80 && !e.shiftKey)) {
          this.createPolygon()
          e.preventDefault()
        }

        if (e.key === 'o' || (e.keyCode === 79 && !e.shiftKey)) {
          this.createPoints()
          e.preventDefault()
        }

        if (e.key === 'O' || (e.keyCode === 79 && e.shiftKey)) {
          this.renderPoints()
          e.preventDefault()
        }
      }
    }, { passive: false })
  }

  render() {
    return (
      <div className="SVGEditor">
        <div className="SVGEditor-top">
          <h2>SVG Editor</h2>
        </div>

        <div className={'SVGEditor-middle SVGEditor-middle-' + this.state.orientation}>
          <div className="SVGEditor-source">
            <textarea
              spellCheck={false}
              onChange={e => this.editSource(e.target.value)}
              value={this.state.source}
              onFocus={() => this.setState({ isEditorFocused: true })}
              onBlur={() => this.setState({ isEditorFocused: false })}
              ref={this.textareaRef}
            >
            </textarea>
          </div>
          <div
            className="SVGEditor-result"
            dangerouslySetInnerHTML={{__html: this.state.source}}
            onClick={e => this.addPoint(e)}
            ref={this.resultRef}
            onScroll={() => this.forceUpdate()}
          >
          </div>
          {this.state.points.map(point => {
            const renderCoords = this.calculateRenderCoords(point)
            return <div
              key={this.generateId(point)}
              className={'SVGEditor-marker' + (this.state.selectedIds.includes(this.generateId(point)) ? ' SVGEditor-selected-marker' : '')}
              style={{
                top: renderCoords.y,
                left: renderCoords.x
              }}
              onClick={() => {
                this.togglePointSelection(this.generateId(point))
              }}
            ></div>
          })}
        </div>
      </div>
    )
  }

  addPoint(e) {
    const svg = this.resultRef.current.children[0]
    const viewBox = svg.viewBox.baseVal
    const rect = svg.getBoundingClientRect()
    const width = rect.right - rect.left
    const height = rect.bottom - rect.top
    const xs = viewBox.width / width
    const ys = viewBox.height / height
    const x = Math.round((e.clientX - rect.left) * xs)
    const y = Math.round((e.clientY - rect.top) * ys)

    this.setState(prevState => ({
      selectedIds: prevState.selectedIds.concat([this.generateId({ x, y })]),
      points: prevState.points.concat([{
        x,
        y
      }])
    }), () => this.updatePoints)
  }

  calculateRenderCoords(localCoords) {
    const { x, y } = localCoords
    const container = this.resultRef.current
    const svg = container.children[0]
    const viewBox = svg.viewBox.baseVal
    const boundingClientRect = svg.getBoundingClientRect()
    const svgWidth = boundingClientRect.right - boundingClientRect.left
    const svgHeight = boundingClientRect.bottom - boundingClientRect.top
    const xScale = viewBox.width / svgWidth
    const yScale = viewBox.height / svgHeight
    const renderX = (x / xScale) + boundingClientRect.left
    const renderY = (y / yScale) + boundingClientRect.top

    return {
      x: renderX,
      y: renderY
    }
  }

  createPoints() {
    const { selectionStart, selectionEnd } = this.textareaRef.current
    const { source } = this.state

    if (!this.state.isEditorFocused) {
      alert('Textarea not focused.')
      return
    }

    if (this.state.selectedIds.length === 0) {
      alert('No points selected.')
      return
    }

    const selectedPoints = this.state.selectedIds.map(id => this.state.points.find(p => this.generateId(p) === id))
    const pointsSource = selectedPoints.map(p => p.x + ' ' + p.y).join(' ')

    const newSource = source.slice(0, selectionStart) + pointsSource + source.slice(selectionEnd)

    this.setState({
      source: newSource
    }, () => {
      window.setTimeout(() => {
        this.textareaRef.current.focus()
        this.textareaRef.current.setSelectionRange(selectionStart, selectionStart + pointsSource.length + 1)
      }, 0)
    })
  }

  createPolygon() {
    const { selectionStart, selectionEnd } = this.textareaRef.current
    const { source } = this.state

    if (!this.state.isEditorFocused) {
      alert('Textarea not focused.')
      return
    }

    if (this.state.selectedIds.length < 3) {
      alert('You need at least 3 points to make a polygon.')
      return
    }

    const selectedPoints = this.state.selectedIds.map(id => this.state.points.find(p => this.generateId(p) === id))
    const pointsSource = selectedPoints.map(p => p.x + ' ' + p.y).join(' ')
    const polygonSource = '<polygon fill="#000" points="' + pointsSource + '" />'

    const newSource = source.slice(0, selectionStart) + polygonSource + source.slice(selectionEnd)

    this.setState({
      source: newSource
    }, () => {
      window.setTimeout(() => {
        this.textareaRef.current.focus()
        this.textareaRef.current.setSelectionRange(selectionStart, selectionStart + polygonSource.length + 1)
      }, 0)
    })
  }

  deleteAllPoints() {
    this.setState({ points: [], selectedIds: [] })
  }

  deleteSelectedPoints() {
    this.setState(prevState => ({
      points: prevState.points.filter(p => !prevState.selectedIds.includes(this.generateId(p))),
      selectedIds: []
    }))
  }

  editSource(source) {
    this.setState({ source })
  }

  generateId(point) {
    return point.x + ',' + point.y
  }

  getOrientation() {
    if (window.innerWidth > window.innerHeight) {
      return 'landscape'
    }
    return 'portrait'
  }

  renderPoints() {
    const { selectionStart, selectionEnd } = this.textareaRef.current
    const { source } = this.state

    if (!this.state.isEditorFocused) {
      alert('Textarea not focused.')
      return
    }

    const pointsSource = source.slice(selectionStart, selectionEnd)
    const pointComponents = pointsSource.split(/[^\-.\d]/g)
    const pointCoords = pointComponents.reduce((coords, component) => {
      const last = coords[coords.length - 1]
      if (coords.length === 0 || ('y' in last)) {
        return coords.concat([{ x: +component }])
      }
      return coords.slice(0, -1).concat([{
        x: last.x,
        y: +component
      }])
    }, [])

    const points = pointCoords.map(coords => {
      const { x, y } = coords
      return {
        x,
        y
      }
    })

    this.setState(prevState => ({
      points: prevState.points.concat(points)
    }))
  }

  togglePointSelection(id) {
    this.setState(prevState => ({
      selectedIds: prevState.selectedIds.includes(id)
        ? prevState.selectedIds.filter(selectedId => selectedId !== id)
        : prevState.selectedIds.concat([id])
    }))
  }
}

export default SVGEditor
