import React from 'react';
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext"
import { Tournament } from "../../data/Models"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}
const operationsDoc = `
  query TournamentByName($name: String) {
    Tournament(order_by: {start: desc}, where: {name: {_eq: $name}}) {
      id
      name
      location
      start
      Ladder_aggregate {
        aggregate {
          count
        }
      }
      Game {
        value
      }
      Creator {
        name
      }
    }
  }
`;
const allGamesDoc = `
  query AllGames {
    Game (order_by: {value: asc}) {
      key
      value
    }
  }
`;

class TournamentEditor extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        const name = this.props.params.name;
        this.setState({gameOptions:[]})
        Query("TournamentByName", operationsDoc, {name:name})
        .then((data)=> {
            var value = null
            if(data && data.Tournament && data.Tournament.length>0){
              value = data.Tournament[0]
            } else {
              value = new Tournament()
            }
            value.start = Date.parse(value.start)
            this.setState({value:value})
        });
        Query("AllGames", allGamesDoc, {})
        .then((data)=> {
          if(data && data.Game && data.Game.length>0){
            this.setState({gameOptions:data.Game.map(g => {return {value:g.key, label:g.value}})})
          }
        })
    }
    breadcrumbs() {
        return (
            <nav className="" aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/events">Events</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{(this.state && this.state.value && this.state.value.name) || 'Adding Event...'}</li>
                </ol>
            </nav>
        )
    }
    render() {
      if(this.state && this.state.value){
        return (
          <>
            {this.breadcrumbs()}
            <div>
              {/* <div className="mb-3">
                  <label htmlFor="idInput" className="form-label">Id</label>
                  <input type="text" id="idInput" className="form-control" placeholder="Id" disabled value={this.state.id || ''} />
              </div> */}
              <div className="mb-3">
                  <label htmlFor="nameInput" className="form-label">Name</label>
                  <input type="text" id="nameInput" className="form-control" placeholder="Name" value={this.state.value.name || ''} onChange={(e) => this.setState({name: e.target.value})} />
              </div>
              <div className="mb-3">
                  <label htmlFor="dateInput" className="form-label">Date</label>
                  <DatePicker selected={this.state.value.start} onChange={(value) => this.setState({value:{start: value}})} isClearable className="form-control" showPopperArrow={false} />
              </div>
              
              <div className="mb-3">
                  <label htmlFor="gameInput" className="form-label">Game</label>
                  {/* <input type="text" id="dateInput" className="form-control" placeholder="Date" value={this.state.start || ''} onChange={(e) => this.setState({start: e.target.value})} /> */}
                  <Select value={this.state.value.Game.key} classNamePrefix="react-select" className="react-select" options={this.state.gameOptions}/>
              </div>
            </div>
          </>
        );
      } else {
        return (
          <>
            {this.breadcrumbs()}
            <div>Loading...</div>
          </>
        )
      }
    }
}

export default withParams(TournamentEditor);