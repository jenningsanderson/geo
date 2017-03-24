import React from 'react'

var turf = require('@turf/turf')

var Select = require('react-select');

// Be sure to include styles at some point, probably during your bootstrapping

class TurfOperations extends React.Component  {

  constructor(props) {
    super(props);

    this.state = {
      'operation':'buffer',
      'unit':"kilometers",
      'amount':1.0,
      'unitDisabled':false,
      'amountDisabled':false
    }

    this.operations = [
      { value: 'buffer',      label: 'Buffer' },
      { value: 'convex_hull', label: 'Convex Hull' },
      { value: 'simplify',    label: 'Simplify' },
      { value: 'bbox_poly',   label: 'Bounding Box Polygon'},
      { value: 'flip',        label: 'Flip [x,y] -> [y,x]'}
    ]

    this.runTurf = this.runTurf.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.updateValue = this.updateValue.bind(this)
    this.updateUnitValue = this.updateUnitValue.bind(this)
  }

  handleAmountChange(event){
    this.setState({amount: event.target.value})
  }

  runTurf(event){
    event.preventDefault()
    console.log("running...", this.state.operation,this.state.amount, this.state.unit)
    var res;

    switch(this.state.operation){
      case 'buffer':
        res = turf.buffer(this.props.jsonObjects.get(),this.state.amount, this.state.unit)
        break;
      case 'convex_hull':
        res = turf.convex(this.props.jsonObjects.get())
        break;
      case 'simplify':
        res = turf.simplify(this.props.jsonObjects.get(), this.state.amount, false)
        break;
      case 'bbox_poly':
        res = turf.bboxPolygon(turf.bbox(this.props.jsonObjects.get()))
        break;
      case 'flip':
        res = turf.flip(this.props.jsonObjects.get())
      default:
        null;
    }

    if(res){
      this.props.jsonObjects.add(res)
      map.getSource('geojsonLayerSource').setData(res)
    }
  }

  updateValue(newValue){
    //What are the operations that don't get values?
    if(['convex_hull','bbox_poly','flip'].indexOf(newValue)>=0){
      this.setState({
        unitDisabled:true,
        amountDisabled:true
      })
    }else if (['simplify'].indexOf(newValue)>=0){
      this.setState({
        unitDisabled:true,
        amountDisabled:false
      })
    }else{
      this.setState({
        unitDisabled:false,
        amountDisabled:false
      })
    }
		this.setState({
			operation: newValue
		});
  }

  updateUnitValue(event){
    this.setState({
      unit: event.target.value
    });
  }

  render() {
    return (
      <div className="operations-box" id="turf-operations">

        <h4 className="txt-h4 pb12">turf.js Operations</h4>
        <form>

  				<Select ref="operationSelect" autofocus simpleValue
            className="full-width"
            options={this.operations}
            name="selected-operation"
            clearable={false}
            value={this.state.operation}
            onChange={this.updateValue} searchable={true}
          />

          <input className='input input--border-teal inline third' type="text" value={this.state.amount} onChange={this.handleAmountChange} disabled={this.state.amountDisabled}></input>

          <div className='select-container'>
          <select className='select select--stroke select--white' onChange={this.updateUnitValue} disabled={this.state.unitDisabled}>
            <option value="kilometers">Kilometers</option>
            <option value="meters">Meters</option>
            <option value="miles">Miles</option>
            <option value="feet">Feet</option>
          </select>
          <div className='select-arrow'></div>
        </div>

          <input className="btn btn--s round btn--red" type="submit" value="Run" onClick={this.runTurf}></input>

        </form>
      </div>
    );
  }
}

export default TurfOperations;
