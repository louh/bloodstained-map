import L from 'leaflet'
import 'leaflet-rastercoords'
import 'leaflet-draw'
import bbox from '@turf/bbox'
import { cloneDeep } from 'lodash-es'
import '../node_modules/leaflet-draw/dist/leaflet.draw.css'

const TILES = '/tiles/{z}/{x}/{y}.png'
const TILES_RETINA = '/tiles/{z}/{x}/{y}.png'
const RASTER_IMAGE_SIZE = [
  8192, // original width of image
  4096  // original height of image
]
const INITIAL_VIEW = { lat: 66.5, lng: -6.5 }
const INITIAL_ZOOM = 1
const INITIAL_ZOOM_MOBILE = 1

let map, rc

function addDrawLayer (map) {
  // FeatureGroup is to store editable layers
  const drawnItems = new L.FeatureGroup()
  map.addLayer(drawnItems)

  const drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems
    }
  })

  map.on(L.Draw.Event.CREATED, function (event) {
    const layer = event.layer
    drawnItems.addLayer(layer)
    console.log(JSON.stringify(layer.toGeoJSON()))
  })

  map.on(L.Draw.Event.EDITED, function (event) {
    const layers = event.layers
    console.log(JSON.stringify(layers.toGeoJSON().features[0]))
  })

  map.addControl(drawControl)
}

export function initMap (history) {
  return new Promise((resolve, reject) => {
    if (map) {
      resolve(map)
      return
    }

    map = L.map('map', {
      attributionControl: false,
      zoomControl: false,
      center: INITIAL_VIEW,
      zoom: (window.innerWidth > 600) ? INITIAL_ZOOM : INITIAL_ZOOM_MOBILE,
    })

    // addDrawLayer(map)
  
    L.tileLayer(window.devicePixelRatio > 1 ? TILES_RETINA : TILES, {
      attribution: false,
      maxZoom: 5,
      minZoom: 3,
      noWrap: true
    }).addTo(map)
  
    // Use leaflet-rastercoords to convert pixel coordinates to map coordinates
    // This also automatically sets a boundary to the image
    rc = new L.RasterCoords(map, RASTER_IMAGE_SIZE)
  
    // Expose globally for debugging
    window.map = map

    // DEBUG
    // debug()
    window.debug = debug

    resolve(map)
  })
}

function debug () {
  map.addEventListener('click', (e) => {
    console.log('event', e)
    const coords = rc.project(e.latlng)
    console.log('raster coords', rc.project(e.latlng))
    const xy = getMapXYForRasterCoords(coords)
    console.log('room x, y', xy)
  })

  const el = document.getElementById('debug-output')
  const statusEl = document.getElementById('debug-status')
  statusEl.textContent = 'Developer mode on'
  statusEl.style.display = 'block'

  map.addEventListener('mousemove', (e) => {
    const coords = rc.project(e.latlng)
    const xy = getMapXYForRasterCoords(coords)
    if (xy) {
      el.textContent = xy.join(', ')
      const width = el.getBoundingClientRect().width
      el.style.left = e.originalEvent.pageX - (width / 2) + 'px'
      el.style.top = e.originalEvent.pageY + 6 + 'px'
      el.style.display = 'block'
    }
  })

  drawRoomGrid()
}

// export function setInitialView (history) {
//   const zoom = (window.innerWidth > 600) ? INITIAL_ZOOM : INITIAL_ZOOM_MOBILE
//   initMap(history).then(map => map.setView(INITIAL_VIEW, zoom, { animate: false }))
// }

// export function setMapViewToRasterCoords (x, y, zoom = 4, history) {
//   initMap(history).then((map) => {
//     map.setView(rc.unproject([x * 2, y * 2]), zoom, { animate: false })
//   })
// }

let geojsonLayers = []
const collection = {
  "type": "FeatureCollection",
  "features": []
}

export function clearGeoJsons () {
  while (geojsonLayers.length) {
    const layer = geojsonLayers.pop()
    layer.clearLayers()
  }
  collection.features = []
}

export function drawGeo (geojson, name) {
  // Convert raw pixel values to latlng once
  // This modifies the original geojson!
  if (!geojson.properties.converted) {
    geojson.geometry.coordinates = geojson.geometry.coordinates.map((i) => i.map((j) => {
      var { lng, lat } = rc.unproject(j)
      return [ lng, lat ]
    }))
    geojson.properties.converted = true
  }

  const layer = L.geoJSON(geojson, {
    style: {
      fillColor: 'yellow',
      fillOpacity: 0.5,
      weight: 0,
      ...geojson.properties.style
    }
  })

  // Don't bind a popup if there isn't a name
  if (name) {
    layer.bindPopup(name)
  }

  layer.addTo(map)

  geojsonLayers.push(layer)
  collection.features.push(geojson)
}

const GRID_BASE_X = 1192.5
const GRID_BASE_Y = 1324.5
const GRID_WIDTH = 49.212 // 50
const GRID_HEIGHT = 29.531 // 30
const GRID_MAX_X = 118 // 1-indexed
const GRID_MAX_Y = 49 // 1-indexed

const getActualX = (x) => GRID_BASE_X + (x * GRID_WIDTH)
const getActualY = (y) => GRID_BASE_Y + (y * GRID_HEIGHT)

export function drawRoomGeo ([x, y], label) {
  // Coords
  const leftX = getActualX(x)
  const rightX = getActualX(x + 1)
  const topY = getActualY(y)
  const bottomY = getActualY(y + 1)

  // Create geojson object of the room
  const geoTemplate = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [ leftX, bottomY ],
          [ rightX, bottomY ],
          [ rightX, topY ],
          [ leftX, topY ],
          [ leftX, bottomY ]
        ]
      ]
    }
  }

  // Draw!
  drawGeo(geoTemplate, label)
}

export function drawRoomGrid () {
  const featureCollection = {
    "type": "FeatureCollection",
    "features": []
  }
  const lineTemplate = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "LineString",
      "coordinates": []
    }
  }
  // Also draws up to max grid (rooms + 1) for far edge
  for (let i = 0; i <= GRID_MAX_X; i++) {
    const x = getActualX(i)
    const y1 = getActualY(0)
    const y2 = getActualY(GRID_MAX_Y)
    const start = rc.unproject([ x, y1 ])
    const end = rc.unproject([ x, y2 ])
    const coords = [
      [ start.lng, start.lat ],
      [ end.lng, end.lat ]
    ]
    const lineGeo = cloneDeep(lineTemplate)
    lineGeo.geometry.coordinates = coords
    featureCollection.features.push(lineGeo)
  }

  for (let i = 0; i <= GRID_MAX_Y; i++) {
    const y = getActualY(i)
    const x1 = getActualX(0)
    const x2 = getActualX(GRID_MAX_X)
    const start = rc.unproject([ x1, y ])
    const end = rc.unproject([ x2, y ])
    const coords = [
      [ start.lng, start.lat ],
      [ end.lng, end.lat ]
    ]
    const lineGeo = cloneDeep(lineTemplate)
    lineGeo.geometry.coordinates = coords
    featureCollection.features.push(lineGeo)
  }

  const layer = L.geoJSON(featureCollection, {
    style: {
      color: 'white',
      opacity: 0.25,
      weight: 1,
      className: 'debug-grid'
    }
  })

  layer.addTo(map)
}

/**
 * converts rastercoords's projected {x, y} value to map grid x, y
 * @param {Object} coords = {x, y}
 * @return {Array} = [ mapX, mapY ]
 *    return null if out of bounds
 */
function getMapXYForRasterCoords (coords) {
  const mapX = Math.floor((coords.x - GRID_BASE_X) / GRID_WIDTH)
  const mapY = Math.floor((coords.y - GRID_BASE_Y) / GRID_HEIGHT)
  if (mapX < 0 || mapY < 0 || mapX >= GRID_MAX_X || mapY >= GRID_MAX_Y) return null
  return [ mapX, mapY ]
}

// Zoom to bounds
export function zoomToGeoBounds () {
  // Bail if nothing to zoom to
  if (collection.features.length === 0) return

  // WSEN order (west, south, east, north)
  const bounds = bbox(collection)

  // southwest latlng, northeast latlng
  map.fitBounds([[bounds[1], bounds[0]], [bounds[3], bounds[2]]], {
    padding: [20, 20]
  })
}
