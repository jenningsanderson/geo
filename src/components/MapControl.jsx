import React from 'react'
import ReactDOM from 'react-dom';

var Select = require('react-select');

var turf = require('@turf/turf')

class MapControl extends React.Component  {

  constructor(props) {
    super(props);

    this.baseStyles = [
      { value: 'streets',     label: 'Streets'  },
      { value: 'basic',       label: 'Basic'    },
      { value: 'bright',      label: 'Bright'   },
      { value: 'light',       label: 'Light'    },
      { value: 'dark',        label: 'Dark'     },
      { value: 'satellite',   label: 'Satellite'}
    ]

    this.updateBaseStyle   = this.updateBaseStyle.bind(this);
    this.toggleVis         = this.toggleVis.bind(this);
    this.handleLayerToggle = this.handleLayerToggle.bind(this);
    this.paint             = this.paint.bind(this);
    this.handleSlider      = this.handleSlider.bind(this);
    this.handleHueSlider   = this.handleHueSlider.bind(this);

    //Load some URL variables here, if we need to change

    this.state = {
      visible: true,
      baseStyle: "streets",
      layers:  {'geojsonCircle' : {visibility: 'visible', opacity: 0.8, color: 'salmon', colorValue: 6},
                'geojsonLine'   : {visibility: 'visible', opacity: 1,   color: 'salmon', colorValue: 6},
                'geojsonFill'   : {visibility: 'visible', opacity: 0.6, color: 'salmon', colorValue: 6}
              },
      sources:[{ id: 'geojsonLayerSource', active: true}],
      menuIcon: '#icon-close'
    }
  }

  componentWillMount(){
    var geojsonSource = this.props.getURLParam('src')
    var geojsonRaw    = this.props.getURLParam('geojson')

    var initialURLorGeoJSON;
    var that=this;

    if (geojsonSource){
      console.log('geojsonSource exists: ', geojsonSource)
      initialURLorGeoJSON = geojsonSource

      //Kick off an async call here to fetch the contents...
      var oReq = new XMLHttpRequest();
      oReq.onload = function (e) {
        var json = e.target.response
        that.props.jsonObjects.add(json)
      };
      oReq.open('GET', geojsonSource, true);
      oReq.responseType = 'json';
      oReq.send();

    //User has actually entered geojson into the query string;
    } else if (geojsonRaw){
      console.log("rawGeojsonExists")
      try{
        var geojson = JSON.parse(geojsonRaw)
        initialURLorGeoJSON = geojson
        that.props.jsonObjects.add(geojson)

      }catch(err){
        console.log("Could not parse the raw geoJSON:", err)
      }

    // Initial variables have not been set, so load the default point from history
    } else {
      console.log("nothing here... ")
      var points = turf.random('points', 25, {
        bbox: [-160, -60, 160, 60]
      });

      var polygons = turf.random('polygons', 1, {
        bbox: [-160, -60, 160, 60]
      });
      that.props.jsonObjects.add(points);
      that.props.jsonObjects.add(polygons);
      initialURLorGeoJSON = that.props.jsonObjects.get()
    }

    this.paint(initialURLorGeoJSON)

  }

  paint(data){
    var that = this;
    map.on('load',function(){
      map.addSource("geojsonLayerSource",{
        type: "geojson",
        data: data
      })

      map.addLayer({
        'id': 'geojsonCircle',
        'type': 'circle',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonCircle.visibility
        },
        'paint':{
          'circle-color':that.state.layers.geojsonCircle.color,
          'circle-opacity':that.state.layers.geojsonCircle.opacity
        }
      })

      map.addLayer({
        'id': 'geojsonLine',
        'type': 'line',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonLine.visibility
        },
        'paint':{
          'line-color':that.state.layers.geojsonLine.color,
          'line-opacity':that.state.layers.geojsonLine.opacity
        }
      })

      map.addLayer({
        'id': 'geojsonFill',
        'type': 'fill',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonFill.visibility
        },
        'paint':{
          'fill-color':that.state.layers.geojsonFill.color,
          'fill-opacity':that.state.layers.geojsonFill.opacity
        }

      })
    })
  }

  toggleVis(){
    this.setState({
      menuIcon: this.state.menuIcon == '#icon-menu' ? '#icon-close' : '#icon-menu',
      visible: !this.state.visible
    })
  }

  updateBaseStyle(value){

    this.setState({baseStyle: value})

    var zoom = map.getZoom();
    var center = map.getCenter();

    map.remove();

    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/' + value + '-v9',
      zoom: zoom,
      center: center
    })

    var that = this;

    this.paint(this.props.jsonObjects.get())
  }

  handleLayerToggle(event){
    var layer = event.target.name
    var newLayers = this.state.layers
    newLayers[layer].visibility = this.state.layers[layer].visibility == 'visible' ? 'none' : 'visible'
    this.setState({
      layers: newLayers
    })
    Object.keys(this.state.layers).forEach(function(layer){
      map.setLayoutProperty(layer, 'visibility',newLayers[layer].visibility)
    });
  }

  handleSlider(event){

    var newLayers = this.state.layers
    newLayers[event.target.name].opacity = Number(event.target.value)

    this.setState({
      layers: newLayers
    })

    var prop;
    switch(event.target.name){
      case 'geojsonCircle':
        prop = 'circle-opacity'
        break;
      case 'geojsonLine':
        prop = 'line-opacity'
        break;
      case 'geojsonFill':
        prop = 'fill-opacity'
        break;
      default:
        break;
    }

    map.setPaintProperty(event.target.name, prop, Number(event.target.value))
  }

  handleHueSlider(event){
    var newLayers = this.state.layers
    newLayers[event.target.name].colorValue = event.target.value
    this.setState({
      layers: newLayers
    })
    var prop;
    switch(event.target.name){
      case 'geojsonCircle':
        prop = 'circle-color'
        break;
      case 'geojsonLine':
        prop = 'line-color'
        break;
      case 'geojsonFill':
        prop = 'fill-color'
        break;
      default:
        break;
    }
    map.setPaintProperty(event.target.name,prop,'hsl('+event.target.value+',93%,71%)')
  }

  render() {
    return(
      <div>
        <div className='cursor-pointer' id="map-control-menu" onClick={this.toggleVis}>
          <svg className='icon--l'><use xlinkHref={this.state.menuIcon}/></svg>
        </div>
        { this.state.visible ?
          <div id="map-control">
            <h4 className="txt-h4 mb12 border-b border--2">Map Style</h4>
            <Select ref="backgroundSelect" name="background-style-chooser" autofocus simpleValue
              className="full-width"
              options={this.baseStyles}
              value={this.state.baseStyle} clearable={false}
              onChange={this.updateBaseStyle} searchable={true}
            />

            <h4 className="txt-h4 pt24 border-b border--2">Render </h4>

            <label className='switch-container pt18'>
              <input type='checkbox' name="geojsonCircle" defaultChecked onChange={this.handleLayerToggle}/>
              <div className='switch switch--blue switch--dot-white mr6'></div>
              <span className="txt-h5 pt6">Points</span>
            </label>

            <div className='range'>
              <span className="pr12">Opacity: </span>
              <input name="geojsonCircle" type='range' min='0' max='1' step='0.05' onChange={this.handleSlider} value={this.state.layers.geojsonCircle.opacity}/>
            </div>

            <div className='range border-b border--2'>
              <span className="pr12">Hue: </span>
              <input name="geojsonCircle" type='range' min='0' max='360' step='1' onChange={this.handleHueSlider} value={this.state.layers.geojsonCircle.colorValue}/>
            </div>


            <label className='switch-container pt18'>
              <input type='checkbox' name="geojsonLine" defaultChecked onChange={this.handleLayerToggle}/>
              <div className='switch switch--blue switch--dot-white mr6'></div>
              <span className="txt-h5 pt6 ">Lines</span>
            </label>

            <div className='range'>
              <span className="pr12">Opacity: </span>
              <input name="geojsonLine" type='range' min='0' max='1' step='0.05' onChange={this.handleSlider} value={this.state.layers.geojsonLine.opacity}/>
            </div>

            <div className='range border-b border--2'>
              <span className="pr12">Hue: </span>
              <input name="geojsonLine" type='range' min='0' max='360' step='1' onChange={this.handleHueSlider} value={this.state.layers.geojsonLine.colorValue}/>
            </div>

            <label className='switch-container pt18'>
              <input type='checkbox' name="geojsonFill" defaultChecked onChange={this.handleLayerToggle}/>
              <div className='switch switch--blue switch--dot-white mr6'></div>
              <span className="txt-h5 pt6">Polygons</span>
            </label>

            <div className='range'>
              <span className="pr12">Opacity: </span>
              <input name="geojsonFill" type='range' min='0' max='1' step='0.05' onChange={this.handleSlider} value={this.state.layers.geojsonFill.opacity}/>
            </div>

            <div className='range border-b border--2'>
              <span className="pr12">Hue: </span>
              <input name="geojsonFill" type='range' min='0' max='360' step='1' onChange={this.handleHueSlider} value={this.state.layers.geojsonFill.colorValue}/>
            </div>

          </div>
        : null}
      </div>
    );
  }
}

export default MapControl;
