import React, { Component } from 'react'
import { initMap } from '../map'

import '../../node_modules/leaflet/dist/leaflet.css'
import './Map.css'

class MapContainer extends Component {
  constructor (props) {
    super(props)

    this.mapEl = React.createRef()
  }

  componentDidMount () {
    if (!this.mapEl.current) return

    initMap()
  }

  render () {
    return (
      <div className="map-container">
        <div id="map" ref={this.mapEl} />
      </div>
    )
  }
}

export default MapContainer
