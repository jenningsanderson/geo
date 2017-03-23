import React from 'react'

var tilebelt = require('@mapbox/tilebelt')

class QuadKeyBox extends React.Component  {

  constructor(props) {
    super(props);

    this.state = {
      quadkey: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  render() {
    console.log("rendering quadkeybox")

    return (
      <div>
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
