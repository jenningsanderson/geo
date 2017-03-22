import React from 'react'

function getURLParam(name) {
    var url = window.location.href;
    var name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class JSONTextBox extends React.Component  {

  constructor(props) {
    super(props);

    this.history = [
                     {type:"Point",coordinates:[-74.50, 42]},
                     {type:"Point",coordinates:[-74.50, 41]},
                     {type:"Point",coordinates:[-74.50, 40]}
                   ]
    this.historyIdx = 2

    //check for GET variables, if they exist, then use them.
    var geojsonSource = getURLParam('src')
    var geojsonRaw    = getURLParam('geojson')

    var initialFeature

    //A geojson source has been specified (load from an external URL)
    if (geojsonSource){
      console.log('geojsonSource exists')
      console.log(geojsonSource)
      initialFeature = geojsonSource
      this.state = {
        geojson: "Loading..."
      };

      //Kick off an async call here to fetch the contents...
      var oReq = new XMLHttpRequest();
      var that = this
      oReq.onload = function (e) {
        var json = e.target.response
        that.history.push(json)
        that.historyIdx++;
        that.setState({geojson: JSON.stringify(json, null, 2)})
      };
      oReq.open('GET', geojsonSource, true);
      oReq.responseType = 'json';
      oReq.send();

    //User has actually entered geojson into the query string;
    } else if (geojsonRaw){
      console.log("rawGeojsonExists")
      try{
        var geojson = JSON.parse(geojsonRaw)
        this.history.push(geojson)
        this.historyIdx++;
      }catch(err){
        console.log(err)
      }
    }

    if(!this.state){
      this.state = {
        geojson: JSON.stringify(this.history[this.historyIdx],null,2)
      };
    }

    if (!initialFeature) initialFeature = this.history[this.historyIdx]

    map.once('load',function(){
      map.addSource("geojsonLayerSource",{
        type: "geojson",
        data: initialFeature
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

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.historyPrevious = this.historyPrevious.bind(this);
    this.historyNext     = this.historyNext.bind(this);
    this.go              = this.go.bind(this);
  }

  handleChange(event) {
    this.setState({geojson: event.target.value});
  }

  go(){
    this.setState( {geojson: JSON.stringify(this.history[this.historyIdx],null,2)})
    map.getSource('geojsonLayerSource').setData(this.history[this.historyIdx])
  }

  handleSubmit(event) {
    event.preventDefault();
    try{
      var geojson = JSON.parse(this.state.geojson)
      //Check that it's actually different from what's currently there
      if( JSON.stringify(this.history[this.historyIdx]) !== JSON.stringify(geojson)  ){
        this.history.push(geojson)
        this.historyIdx++;
        this.go()
      }
    }catch(err){
      alert("Error, couldn't parse the geojson")
      console.log(err)
    }
  }

  historyPrevious(){
    if(this.historyIdx > 0 && this.history.length>1){
      this.historyIdx--;
      this.go()
    }else{
      console.log("Can't go back", this.historyIdx)
    }
  }

  historyNext(){
    if(this.historyIdx != this.history.length-1){
      this.historyIdx++;
      this.go()
    }else{
      console.log("Can't go forward", this.historyIdx)
    }
  }

  render() {
    console.log(this.historyIdx)
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <textarea value={this.state.geojson} onChange={this.handleChange} id="geojson-input-box"/>
          <input type="submit" value="Render" />
        </form>
        <button id="history_prev" onClick={this.historyPrevious}>Previous</button>
        <button id="history_next" onClick={this.historyNext}>Next</button>
      </div>
    );
  }
}

export default JSONTextBox;
