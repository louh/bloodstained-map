import { useEffect, useEffectEvent, useRef } from 'react'

import { initMap } from '../map'
import { showResult, getSelectionFromURL } from '../result'

import 'leaflet/dist/leaflet.css'
import './Map.css'

export function MapContainer ({ onSelect }) {
  const mapEl = useRef(null)

  const showInitialSelection = useEffectEvent(() => {
    const selection = getSelectionFromURL()
    if (selection) {
      showResult(selection, onSelect)
    }
  })

  useEffect(() => {
    if (!mapEl.current) return

    initMap()
    showInitialSelection()
  }, [])

  return (
    <div className="map-container">
      <div id="map" ref={mapEl} />
    </div>
  )
}
