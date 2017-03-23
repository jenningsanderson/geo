import React from 'react'

var tilebelt = require('@mapbox/tilebelt')
var turf     = require('@turf/turf')

class QuadKeyBox extends React.Component  {

  constructor(props) {
    super(props);

    this.state = {
      quadkey: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getQuadkey   = this.getQuadkey.bind(this);
  }

  handleChange(event) {
    this.setState({quadkey: event.target.value})
  }

  handleSubmit(event) {
    event.preventDefault();

    // this.props.jsonObjects.update()

    try{
      var quadGeo = tilebelt.tileToGeoJSON(tilebelt.quadkeyToTile(this.state.quadkey))
      map.getSource('geojsonLayerSource').setData(quadGeo)
      this.props.jsonObjects.add(quadGeo)
    }catch(err){
      // alert("Error, couldn't parse the geojson in the input box")
      console.log("Error, couldn't parse geojson in the input box", err)

    }
  }

  getQuadkey(){
    var bbox = turf.bbox(this.props.jsonObjects.get())
    var tile = tilebelt.bboxToTile(bbox)
    var qk   = tilebelt.tileToQuadkey(tile)
    if(qk.length > 15){
      qk = qk.substring(0,15)
    }
    this.setState({quadkey: qk})
  }

  render() {
    return (
      <div>
        <h2>Quadkey</h2>
        <button className="btn btn--s round" onClick={this.getQuadkey}>Get Quadkey</button>
        <form onSubmit={this.handleSubmit}>
          <input type="text" value={this.state.quadkey}
            onChange={this.handleChange} id="quadkey-input-box"/>
          <input className="btn btn--s round btn--red" type="submit" value="Render Quadkey" />
        </form>
      </div>
    );
  }
}

export default QuadKeyBox;
