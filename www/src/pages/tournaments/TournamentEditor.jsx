import React from 'react';
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext"
import { Tournament } from "../../data/Models"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'
import {Collapse} from 'bootstrap'

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
        key
        value
      }
      Creator {
        id
        name
      }
      ScoringRuleset {
        id
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
const allScoringDoc  = `
query ScoringByGame($gameKey: Game_enum) {
  ScoringRuleset(where: {game: {_eq: $gameKey}}) {
    id
    name
  }
}
`;

const updateDoc = `
mutation UpdateTournament($name: String = "", $location: String = "", $start: date = null, $game: Game_enum  = "", $scoring_ruleset_id: uuid = null, $creator_id: uuid = null, $id: uuid = "id") {
  update_Tournament(_set: {name: $name, location: $location, start: $start, game: $game, scoring_ruleset_id: $scoring_ruleset_id, creator_id: $creator_id}, where: {id: {_eq: $id}}) {
    returning {
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
        key
        value
      }
      Creator {
        name
      }
      ScoringRuleset {
        id
        name
      }
    }
  }
}  
`
class TournamentEditor extends React.Component {
    constructor(props) {
        super(props);
        this.alertRef = React.createRef();
    }
    setValue(valueKeys){
      this.setState(prevState => ({...prevState, value: {...prevState.value, ...valueKeys}}))
    }
    setGame(vlp) { //{value, label}
      this.setValue({Game:{key:vlp.value,value:vlp.label}})
      this.loadScoringRulesets(vlp.value)
    }
    setScoringRuleset(vlp) {
      this.setValue({ScoringRuleset:{id:vlp.value,name:vlp.label}})
    }
    componentDidMount() {
        const name = this.props.params.name;
        this.setState({gameOptions:[], scoringOptions:[]})
        Query("TournamentByName", operationsDoc, {name:name})
        .then((data)=> {
            var value = null
            if(data && data.Tournament && data.Tournament.length>0){
              value = data.Tournament[0]
            } else {
              value = new Tournament()
            }
            value.start = Date.parse(value.start)
            // this.setState(prevState => ({...prevState, value:value}))
            this.setState({value:value})
            return Promise.resolve(value)
        })
        .then((data) => {
          this.loadScoringRulesets(data.Game.key)
        });
        Query("AllGames", allGamesDoc, {})
        .then((data)=> {
          if(data && data.Game && data.Game.length>0){
            this.setState({gameOptions:data.Game.map(g => {return {value:g.key, label:g.value}})})
            if(this.state.value && this.state.value.Game){
              // this.setState(prevState => ({...prevState, value: {...prevState.value, Game:{key:this.state.value.Game.key}}}))
              this.setValue({Game:{key:this.state.value.Game.key}})
            }
          }
        })
    }
    loadScoringRulesets(game){
      Query("ScoringByGame", allScoringDoc, {gameKey:game})
        .then((data)=> {
          if(data && data.ScoringRuleset && data.ScoringRuleset.length>0){
            this.setState({scoringOptions:data.ScoringRuleset.map(g => {return {value:g.id, label:g.name}})})
          }
        })
    }
    save(){
      
      Query("UpdateTournament", updateDoc, {
        name: this.state.value.name, 
        location: this.state.value.location, 
        start: new Date(this.state.value.start).toISOString(), 
        game: this.state.value.Game?.key, 
        scoring_ruleset_id: this.state.value.ScoringRuleset?.id, 
        creator_id: this.state.value.Creator?.id, 
        id: this.state.value.id})
      .then((data) => {
          const node = this.alertRef.current;
          // node.classList.add('show');
          new Collapse(node)
          // setTimeout(() => node.classList.remove('show'), 2000);
          setTimeout(() => new Collapse(node), 2000);
      });
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
                  <DatePicker selected={this.state.value.start} onChange={(value) => this.setValue({start: value})} isClearable className="form-control" showPopperArrow={false} />
              </div>
              
              <div className="mb-3">
                  <label htmlFor="gameInput" className="form-label">Game</label>
                  <Select value={this.state.gameOptions.filter(o => o.value === this.state.value.Game?.key)} onChange={(vl) => this.setGame(vl)} classNamePrefix="react-select" className="react-select" options={this.state.gameOptions}/>
              </div>
              
              <div className="mb-3">
                  <label htmlFor="scoringInput" className="form-label">Scoring Ruleset</label>
                  <Select value={this.state.scoringOptions.filter(o => o.value === this.state.value.ScoringRuleset?.id)} onChange={(vl) => this.setScoringRuleset(vl)} classNamePrefix="react-select" className="react-select" options={this.state.scoringOptions}/>
              </div>
            </div>
            <div className="d-flex gap-3">
                <button className="btn btn-outline-success" onClick={() => this.save()}>Save</button>
                <button className="btn btn-outline-danger" onClick={() => window.history.back()}>Cancel</button>
            </div>
            <div ref={this.alertRef} className="alert alert-success collapse mt-3" role="alert">
                Tournament has been updated!
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