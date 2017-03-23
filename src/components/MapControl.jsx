import React from 'react'
import ReactDOM from 'react-dom';

var Select = require('react-select');

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

    this.updateBaseStyle = this.updateBaseStyle.bind(this);
    this.toggleVis = this.toggleVis.bind(this);
    this.handleLayerToggle = this.handleLayerToggle.bind(this);

    //Load some URL variables here, if we need to change

    this.state = {
      visible: true,
      baseStyle: "streets",
      layers:  {'geojsonCircle' : {visibility: 'visible'},
                'geojsonLine'   : {visibility: 'visible'},
                'geojsonFill'   : {visibility: 'visible'}
              },
      sources:[{ id: 'geojsonLayerSource', active: true}]
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
        tthat.props.jsonObjects.add(geojson)

      }catch(err){
        console.log("Could not parse the raw geoJSON:", err)
      }

    // Initial variables have not been set, so load the default point from history
    } else {
      console.log("nothing here... loading default point")
      initialURLorGeoJSON = that.props.jsonObjects.get()
    }

    var that = this;

    map.on('load',function(){
      map.addSource("geojsonLayerSource",{
        type: "geojson",
        data: initialURLorGeoJSON
      })

      map.addLayer({
        'id': 'geojsonCircle',
        'type': 'circle',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonCircle.visibility
        }
      })

      map.addLayer({
        'id': 'geojsonLine',
        'type': 'line',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonLine.visibility
        }
      })

      map.addLayer({
        'id': 'geojsonFill',
        'type': 'fill',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonFill.visibility
        }
      })
    })
  }

  toggleVis(){
    this.setState({
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

    map.on('load',function(){

      map.addSource("geojsonLayerSource",{
        type: "geojson",
        data: that.props.jsonObjects.get()
      })

      map.addLayer({
        'id': 'geojsonCircle',
        'type': 'circle',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonCircle.visibility
        }
      })

      map.addLayer({
        'id': 'geojsonLine',
        'type': 'line',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonLine.visibility
        }
      })

      map.addLayer({
        'id': 'geojsonFill',
        'type': 'fill',
        'source': "geojsonLayerSource",
        'layout':{
          'visibility' : that.state.layers.geojsonFill.visibility
        }
      })
    })
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

  render() {
    return(
      <div>
        <div className='cursor-pointer' id="map-control-menu" onClick={this.toggleVis}></div>
        { this.state.visible ?
          <div id="map-control">
            <h4 className="txt-h4">Map Style</h4>
            <Select ref="backgroundSelect" name="background-style-chooser" autofocus simpleValue
              className="full-width"
              options={this.baseStyles}
              value={this.state.baseStyle} clearable={false}
              onChange={this.updateBaseStyle} searchable={true}
            />

            <h4 className="txt-h4 pt12">Render: </h4>
            <label className='switch-container'>
              <input type='checkbox' name="geojsonCircle" defaultChecked onChange={this.handleLayerToggle}/>
              <div className='switch switch--blue switch--dot-white mr6'></div>
              Points
            </label>

            <label className='switch-container'>
              <input type='checkbox' name="geojsonLine" defaultChecked onChange={this.handleLayerToggle}/>
              <div className='switch switch--blue switch--dot-white mr6'></div>
              Lines
            </label>

            <label className='switch-container'>
              <input type='checkbox' name="geojsonFill" defaultChecked onChange={this.handleLayerToggle}/>
              <div className='switch switch--blue switch--dot-white mr6'></div>
              Fill
            </label>
          </div>
        : null}
      </div>
    );
  }
}

export default MapControl;
