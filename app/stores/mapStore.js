import { computed, observable, action } from 'mobx'
import _ from 'lodash'

import { computeTheme } from '../theming'

import {
  addParcelLayer,
  addCitiesOutlinesLayer,
  addPolygonLayers,
  setLabelLayerVisible,
} from '../components/styles'

import configStore from './configStore'
import parcelStore from './parcelStore'
import polygonStore from './polygonStore'

class MapStore {
  map
  @observable mapLabelsVisible = false
  @observable activeBaseMap = 'light'
  @observable legendParams
  @observable showParcels = false
  @observable showPolygons = true

  @computed
  get baseMapUrl() {
    return `mapbox://styles/mapbox/${this.activeBaseMap}-v9`
  }

  setMap(map) {
    this.map = map
  }

  addLayers() {
    addParcelLayer(this.map)
    addCitiesOutlinesLayer(this.map, configStore.citiesUrl, '#4e5156')
    addPolygonLayers(this.map)
  }

  @action
  setActiveBaseMap(baseMap) {
    this.activeBaseMap = baseMap
    this.map.setStyle(this.baseMapUrl)
  }

  @action
  setMapLabelsVisible(mapLabelsVisible) {
    this.mapLabelsVisible = mapLabelsVisible
    setLabelLayerVisible(this.map, mapLabelsVisible)
  }

  @action
  setShowParcels(showParcels) {
    this.showParcels = showParcels
    this.map.setLayoutProperty('parcelCircles', 'visibility', showParcels ? 'visible' : 'none')
  }

  @action
  setShowPolygons(showPolygons) {
    this.showPolygons = showPolygons
    this.map.setLayoutProperty('polygons', 'visibility', showPolygons ? 'visible' : 'none')
    this.map.setLayoutProperty('polygons_border', 'visibility', showPolygons ? 'visible' : 'none')
    this.map.setLayoutProperty(
      'polygons_highlight',
      'visibility',
      showPolygons ? 'visible' : 'none'
    )
  }

  @action
  setLegendParams(legendParams) {
    this.legendParams = legendParams
  }

  setParcelCircles(geojson) {
    if (!this.map) return
    this.map.getSource('parcelCircles').setData(geojson)
  }

  setPolygons(geojson) {
    if (!this.map) return
    this.map.getSource('polygons').setData(geojson)
  }

  applyTheme(source, values, { colorScale, legendParams }, setLegend = true) {
    console.log(source, values, colorScale, legendParams)
    values.forEach((v, id) => {
      this.map.setFeatureState({ source, id }, { color: colorScale(v) })
    })
    if (setLegend) {
      this.setLegendParams(legendParams)
    }
  }

  activateParcelTheme(activeTheme) {
    console.log('Activate parcel theme', activeTheme)
    const themeConfig = configStore.activeThemeConfig

    let data = parcelStore.getAttribute(themeConfig.attribute)

    if (themeConfig.type === 'float') {
      data = _.map(data, d => +d)
    }

    const theme = computeTheme(data, themeConfig)

    this.applyTheme('parcelCircles', data, theme)
  }

  activatePolygonTheme() {
    const themeConfig = {
      attribute: 'county',
      display: 'County',
      type: 'float',
      themeType: 'interpolate',
      colorRange: ['#edf8fb', '#005824'],
    }

    console.log('Activate polygon theme', themeConfig.attribute)
    let data = polygonStore.getAttribute(themeConfig.attribute, 2010)

    const theme = computeTheme(data, themeConfig)

    this.applyTheme('polygons', data, theme, false)
  }
}

export default new MapStore()
