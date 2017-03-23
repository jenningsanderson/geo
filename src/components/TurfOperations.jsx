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
      'amount':0.01,
      'unitDisabled':false,
      'amountDisabled':false
    }

    this.operations = [
      { value: 'buffer',      label: 'Buffer' },
      { value: 'convex_hull', label: 'Convex Hull' }
    ]

    this.units = [
      { value: 'kilometers', label: 'Kilometers' },
      { value: 'miles', label: 'Miles' }
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
    if(['convex_hull'].indexOf(newValue)>=0){
      this.setState({
        unitDisabled:true,
        amountDisabled:true
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
      <div id="turf-operations">

        <h3>Turf Operations</h3>
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
          <select className='select select--stroke' onChange={this.updateUnitValue} disabled={this.state.unitDisabled}>
            <option value="kilometers">Kilometers</option>
            <option value="miles">Miles</option>
          </select>
          <div className='select-arrow'></div>
        </div>

          {/*
          <Select ref="unitSelect"
            autofocus simpleValue
            className="inline third"
            options={this.units}
            name="selected-unit"
            clearable={false}
            value={this.state.unit}
            onChange={this.updateUnitValue} searchable={true}
          /> */}

          <input className="btn btn--s round btn--red" type="submit" value="Run" onClick={this.runTurf}></input>

        </form>
      </div>
    );
  }
}

export default TurfOperations;
