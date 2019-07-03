import L from 'leaflet'
// import 'leaflet-rastercoords'
import 'leaflet-draw'
import bbox from '@turf/bbox'
import '../node_modules/leaflet-draw/dist/leaflet.draw.css'

const TILES = '/tiles/{z}/{x}/{y}.png'
const TILES_RETINA = '/tiles/{z}/{x}/{y}.png'
const RASTER_IMAGE_SIZE = [
  2304, // original width of image
  768  // original height of image
]
const INITIAL_VIEW = {lat: 1.4980897753593954, lng: 169.25125122070315}
const INITIAL_ZOOM = 1
const INITIAL_ZOOM_MOBILE = 1

let map

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
      maxZoom: 4,
      minZoom: 2,
      noWrap: true
    }).addTo(map)
  
    // Proof of concept markers
    // Use leaflet-rastercoords to convert pixel coordinates to map coordinates
    // rc = new L.RasterCoords(map, RASTER_IMAGE_SIZE)
    // const allMarkers = drawMarkers(map, rc, history)
  
    // Expose globally for debugging
    window.map = map

    map.addEventListener('click', (e) => console.log(e))

    resolve(map)
  })
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
  geojsonLayers.push(L.geoJSON(geojson, {
    style: {
      fillColor: 'yellow',
      fillOpacity: 0.5,
      weight: 0
    }
  }).bindPopup(name).addTo(map))
  collection.features.push(geojson)
}

// Zoom to bounds
export function zoomToGeoBounds () {
  // Bail if nothing to zoom to
  if (collection.features.length === 0) return

  // WSEN order (west, south, east, north)
  const bounds = bbox(collection)

  // southwest latlng, northeast latlng
  map.fitBounds([[bounds[1], bounds[0]], [bounds[3], bounds[2]]],  {
    padding: [20, 20]
  })
}
