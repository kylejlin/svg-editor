import React, { Component } from 'react'
import './SVGEditor.css'
import svgStarterSource from './svgStarter'

class SVGEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      source: svgStarterSource,
      orientation: this.getOrientation(),
      selectedId: null,
      points: [],
      isEditorFocused: false
    }

    this.resultRef = React.createRef()

    window.addEventListener('resize', () => {
      this.setState({
        orientation: this.getOrientation(),
        points: []
      })
    })

    window.addEventListener('keydown', e => {
      if (
        !this.state.isEditorFocused
        && e.keyCode === 8
      ) {
        this.setState(prevState => ({
          points: prevState.points.filter(p => p.id !== prevState.selectedId)
        }))
      }
    })
  }

  render() {
    const point = this.state.points.find(p => p.id === this.state.selectedId)
    const coords = point === undefined
      ? null
      : {
        x: point.x,
        y: point.y
      }

    return (
      <div className="SVGEditor">
        <div className="SVGEditor-top">
          <h2>SVG Editor</h2>
          <div className="SVGEditor-coord-display">
            {coords &&
              coords.x + ', ' + coords.y
            }
          </div>
        </div>

        <div className={'SVGEditor-middle SVGEditor-middle-' + this.state.orientation}>
          <div className="SVGEditor-source">
            <textarea
              spellCheck={false}
              onChange={e => this.editSource(e.target.value)}
              value={this.state.source}
              onFocus={() => this.setState({ isEditorFocused: true })}
              onBlur={() => this.setState({ isEditorFocused: false })}
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
              className={'SVGEditor-marker' + (point.id === this.state.selectedId ? ' SVGEditor-selected-marker' : '')}
              style={{
                top: point.renderY,
                left: point.renderX
              }}
              onClick={() => {
                this.updateSelectedId(point.id)
              }}
            ></div>
          })}
        </div>
      </div>
    )
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
      selectedId: id,
      points: prevState.points.concat([{
        x,
        y,
        renderX,
        renderY,
        id
      }])
    }), () => this.updatePoints)
  }

  updateSelectedId(id) {
    this.setState({
      selectedId: id
    })
  }
}

export default SVGEditor
