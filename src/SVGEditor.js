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
        orientation: this.getOrientation(),
        points: []
      })
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
      }
    }, { passive: false })
  }

  render() {
    return (
      <div className="SVGEditor">
        <div className="SVGEditor-top">
          <h2>SVG Editor</h2>
          <div className="SVGEditor-tool SVGEditor-tool-poly" onClick={() => this.createPolygon()}>Poly</div>
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
          >
          </div>
          {this.state.points.map(point => {
            return <div
              key={point.id}
              className={'SVGEditor-marker' + (this.state.selectedIds.includes(point.id) ? ' SVGEditor-selected-marker' : '')}
              style={{
                top: point.renderY,
                left: point.renderX
              }}
              onClick={() => {
                this.togglePointSelection(point.id)
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
    const renderX = e.clientX
    const renderY = e.clientY
    const id = this.generateId()

    this.setState(prevState => ({
      selectedIds: prevState.selectedIds.concat([id]),
      points: prevState.points.concat([{
        x,
        y,
        renderX,
        renderY,
        id
      }])
    }), () => this.updatePoints)
  }

  createPolygon() {
    const { selectionStart, selectionEnd } = this.textareaRef.current
    const { source } = this.state

    if (selectionStart === source.length) {
      alert('Textarea not focused.')
      return
    }

    if (this.state.selectedIds.length < 3) {
      alert('You need at least 3 points to make a polygon.')
      return
    }

    const selectedPoints = this.state.selectedIds.map(id => this.state.points.find(p => p.id === id))
    const pointsSource = selectedPoints.map(p => p.x + ' ' + p.y).join(' ')
    const polygonSource = '<polygon fill="#000" points="' + pointsSource + '" />'

    const newSource = source.slice(0, selectionStart) + polygonSource + source.slice(selectionEnd)

    this.setState({
      source: newSource
    }, () => {
      this.textareaRef.current.focus()
      this.textareaRef.current.selectionStart = selectionStart
      this.textareaRef.current.selectionEnd = selectionStart + polygonSource.length + 1
    })
  }

  deleteAllPoints() {
    this.setState({ points: [], selectedIds: [] })
  }

  deleteSelectedPoints() {
    this.setState(prevState => ({
      points: prevState.points.filter(p => !prevState.selectedIds.includes(p.id)),
      selectedIds: []
    }))
  }

  editSource(source) {
    this.setState({ source })
  }

  generateId() {
    return '' + Math.random()
  }

  getOrientation() {
    if (window.innerWidth > window.innerHeight) {
      return 'landscape'
    }
    return 'portrait'
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
