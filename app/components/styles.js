import mapStore from '../stores/mapStore'

// this code from
// https://docs.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/
function getLabelLayer(map) {
  const layers = map.getStyle().layers
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') return layers[i].id
  }
}

export function setLabelLayerVisible(map, visible) {
  const visVal = !visible ? 'none' : 'visible'
  const layers = map.getStyle().layers
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      map.setLayoutProperty(layers[i].id, 'visibility', visVal)
    }
  }
}

export function addParcelLayer(map) {
  map.addSource('parcelCircles', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  })

  map.addLayer(
    {
      id: 'parcelCircles',
      source: 'parcelCircles',
      type: 'circle',
      paint: {
        'circle-radius': ['number', ['feature-state', 'radius'], 3],
        'circle-opacity': ['number', ['feature-state', 'opacity'], 1],
        'circle-color': ['string', ['feature-state', 'color'], '#fff'],
        'circle-stroke-width': ['number', ['feature-state', 'stroke'], 1],
        'circle-stroke-color': ['string', ['feature-state', 'strokeColor'], '#1c1c1c'],
      },
    },
    getLabelLayer(map)
  )

  map.addLayer(
    {
      id: 'parcelCirclesHighlight',
      source: 'parcelCircles',
      type: 'circle',
      paint: {
        'circle-color': '#ffff3e',
        'circle-radius': 17,
        'circle-blur': 1,
        'circle-opacity': ['case', ['boolean', ['feature-state', 'active'], false], 1, 0],
      },
    },
    'parcelCircles'
  )

  mapStore.setShowParcels(mapStore.showParcels)
}

export function addPolygonLayers(map) {
  const sourceName = 'polygons'
  const layerName = 'polygons'
  const bordersName = 'polygons_border'
  const highlightLayerName = 'polygons_highlight'
  map.addSource(sourceName, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  })

  map.addLayer(
    {
      id: layerName,
      source: sourceName,
      type: 'fill',
      paint: {
        'fill-color': ['string', ['feature-state', 'color'], '#fff'],
        'fill-opacity': ['number', ['feature-state', 'opacity'], 1],
      },
    },
    'parcelCirclesHighlight'
  )

  map.addLayer(
    {
      id: bordersName,
      type: 'line',
      source: sourceName,
      paint: {
        'line-color': '#000000',
        'line-width': 1,
        'line-opacity': 0.3,
      },
    },
    'parcelCirclesHighlight'
  )

  map.addLayer(
    {
      id: highlightLayerName,
      type: 'line',
      source: sourceName,
      paint: {
        'line-color': '#ffff3e',
        'line-width': 2,
        'line-opacity': ['case', ['boolean', ['feature-state', 'active'], false], 1, 0],
      },
    },
    'parcelCirclesHighlight'
  )

  mapStore.setShowPolygons(mapStore.showPolygons)
}

export function addCitiesOutlinesLayer(map, url, color) {
  const layerName = 'cities'

  if (map.getLayer(layerName)) {
    map.removeLayer(layerName)
  }

  if (map.getSource(layerName)) {
    map.removeSource(layerName)
  }

  if (!url) {
    return
  }

  map.addSource(layerName, {
    type: 'geojson',
    data: url,
  })

  map.addLayer(
    {
      id: layerName,
      type: 'line',
      source: layerName,
      paint: {
        'line-opacity': 0.6,
        'line-color': color || '#ffffff',
        'line-dasharray': [2, 2],
      },
    },
    'parcelCircles'
  )
}
