import React from 'react';

import JSONTextBox from './JSONTextBox.jsx'
import QuadKeyBox from './QuadKeyBox.jsx'
import TurfOperations from './TurfOperations.jsx'
import MapControl from './MapControl.jsx'

var turf = require("@turf/turf")

/*
   The main object for the page...
*/


var GeoJSONObjects = function(that){

  this.history = []

  this.historyIdx = 0;

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
      'geojson': "",
    }

    this.jsonObjects = new GeoJSONObjects(this);
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
        <MapControl     getURLParam={this.props.getURLParam} jsonObjects={this.jsonObjects} /> {/* This is currently the easiest way to do this... ugly?*/}
        <JSONTextBox    jsonObjects={this.jsonObjects} geojson={this.state.geojson} overRideGeoJSON={this.overRideGeoJSON} fitBounds={this.fitBounds}/>
        <QuadKeyBox     jsonObjects={this.jsonObjects}/>
        <TurfOperations jsonObjects={this.jsonObjects}/>
      </div>
    )
  }
}
