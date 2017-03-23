import React from 'react'

class JSONTextBox extends React.Component  {

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.historyNext = this.historyNext.bind(this);
    this.historyPrevious = this.historyPrevious.bind(this);
  }

  handleChange(event) {
    this.props.overRideGeoJSON(event.target.value);
  }

  historyPrevious(){
    var newVal = this.props.jsonObjects.getPrevious()
    if(newVal){
      this.setState({geojson: JSON.stringify(newVal,null,2)})
    }
  }

  historyNext(){
    var newVal = this.props.jsonObjects.getNext()
    if(newVal){
      this.setState({geojson: JSON.stringify(newVal,null,2)})
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    try{
      var geojson = JSON.parse(this.props.geojson)

      if(JSON.stringify(this.props.jsonObjects.get()) !== JSON.stringify(geojson) ){
        this.props.jsonObjects.add(geojson)
        map.getSource('geojsonLayerSource').setData(geojson)
      }

    }catch(err){
      // alert("Error, couldn't parse the geojson in the input box")
      console.log("Error, couldn't parse geojson in the input box", err)

    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <button id="history_prev" className="btn btn--s round" onClick={this.historyPrevious}>Previous</button>
          <button id="history_next" className="btn btn--s round" onClick={this.historyNext}>Next</button>

          <textarea className="textarea textarea--border-blue txt-s"
            placeholder="Paste GeoJSON here..." value={this.props.geojson} onChange={this.handleChange} id="geojson-input-box"/>
          <input className="btn btn--s btn--red round" type="submit" value="Render" />
          <button className="btn btn--s round" id="fitBounds" onClick={this.props.fitBounds}>FitBounds</button>
        </form>



      </div>
    );
  }
}

export default JSONTextBox;
