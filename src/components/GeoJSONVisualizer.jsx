import React from 'react';

import JSONTextBox from './JSONTextBox.jsx'
import QuadKeyBox from './QuadKeyBox.jsx'
import TurfOperations from './TurfOperations.jsx'

var turf = require("@turf/turf")

/*
   The main object for the page...
*/
var GeoJSONObjects = function(that){
  this.history = [ {type:"Point",coordinates:[-73.50, 40]},
                   {type:"Point",coordinates:[-74.50, 41]},
                   {type:"Point",coordinates:[-75.50, 42]} ]
  this.historyIdx = 2;

  this.add = function(geojson){
    //If it's the end, then just add it to the end
    if (this.historyIdx == this.history.length-1){
      this.history.push(geojson)
      this.historyIdx++;
    }else{
      //Not at the end, put it in the middle of the array?
      this.history.splice(this.historyIdx+1,0,geojson)
    }
    that.setState({geojson: JSON.stringify(geojson, null, 2)})
  }

  this.get = function(){
    that.setState({geojson: JSON.stringify(this.history[this.historyIdx],null,2)})
    return this.history[this.historyIdx]
  }

  this.getPrevious = function(){
    if(this.historyIdx > 0 && this.history.length>1){
      this.historyIdx--;
      map.getSource('geojsonLayerSource').setData(this.get())
      that.setState({geojson: JSON.stringify(this.get(),null,2)})
      return this.get()
    }else{
      console.log("Can't go back, historyIdx: ", this.historyIdx)
      return false
    }
  }

  this.getNext = function(){
    if(this.historyIdx != this.history.length-1){
      this.historyIdx++;
      map.getSource('geojsonLayerSource').setData(this.get())
      that.setState({geojson: JSON.stringify(this.get(),null,2)})
      return this.get()
    }else{
      console.log("Can't go forward, historyIdx: ", this.historyIdx)
      return false
    }
  }

}

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.overRideGeoJSON = this.overRideGeoJSON.bind(this);
    this.fitBounds = this.fitBounds.bind(this);


    this.state = {
      'geojson': "Loading..."
    }

    this.jsonObjects = new GeoJSONObjects(this);

    //check for GET variables, if they exist, then use them.
    var geojsonSource = getURLParam('src')
    var geojsonRaw    = getURLParam('geojson')

    var initialURLorGeoJSON; //Could be a valid GeoJSON object

    //A geojson source has been specified (load from an external URL)
    if (geojsonSource){
      console.log('geojsonSource exists: ', geojsonSource)
      initialURLorGeoJSON = geojsonSource

      //Kick off an async call here to fetch the contents...
      var oReq = new XMLHttpRequest();
      var that = this
      oReq.onload = function (e) {
        var json = e.target.response
        that.jsonObjects.add(json)
      };
      oReq.open('GET', geojsonSource, true);
      oReq.responseType = 'json';
      oReq.send();

    //User has actually entered geojson into the query string;
    } else if (geojsonRaw){
      console.log("rawGeojsonExists")
      try{
        var geojson = JSON.parse(geojsonRaw)
        this.jsonObjects.add(geojson)
        initialURLorGeoJSON = geojson
      }catch(err){
        console.log("Could not parse the raw geoJSON:", err)
      }

    // Initial variables have not been set, so load the default point from history
    } else {
      initialURLorGeoJSON = this.jsonObjects.get()
    }

    //On initialization, load the map and add the geojson source
    map.once('load',function(){
      map.addSource("geojsonLayerSource",{
        type: "geojson",
        data: initialURLorGeoJSON
      })

      map.addLayer({
        'id': 'geojson-circle',
        'type': 'circle',
        'source': "geojsonLayerSource"
      })

      map.addLayer({
        'id': 'geojson-line',
        'type': 'line',
        'source': "geojsonLayerSource"
      })

      map.addLayer({
        'id': 'geojson-fill',
        'type': 'fill',
        'source': "geojsonLayerSource"
      })

    })
  }

  //Operates independent of history, etc.
  overRideGeoJSON(text){
    this.setState({geojson: text})
  }

  fitBounds(){
    var bounds = turf.bbox(this.jsonObjects.get())
    map.fitBounds(bounds,{padding:100,maxZoom:12})
  }

  render() {
    return (
      <div>
        <JSONTextBox jsonObjects={this.jsonObjects} geojson={this.state.geojson} overRideGeoJSON={this.overRideGeoJSON} fitBounds={this.fitBounds}/>
        <QuadKeyBox  jsonObjects={this.jsonObjects}/>
        <TurfOperations jsonObjects={this.jsonObjects}/>
      </div>
    )
  }
}

//Global function
function getURLParam(name) {
  var url = window.location.href;
  var name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
