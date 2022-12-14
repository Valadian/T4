import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import Query from "../../data/T4GraphContext"
import { Tournament } from "../../data/Models"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'
import {Collapse} from 'bootstrap'
import { useAuth0 } from "@auth0/auth0-react";

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
mutation UpdateTournament($name: String = "", $location: String = "", $start: date = null, $game: Game_enum  = "", $scoring_ruleset_id: uuid = null, $id: uuid = "id", $creator_name: String = null) {
  update_Tournament(_set: {name: $name, location: $location, start: $start, game: $game, scoring_ruleset_id: $scoring_ruleset_id, creator_name: $creator_name}, where: {id: {_eq: $id}}) {
    returning {
      id
    }
  }
}  
`
const insertDoc = `
mutation InsertTournament($name: String = "", $location: String = "", $start: date = null, $game: Game_enum  = "", $scoring_ruleset_id: uuid = null, $creator_name: String = null) {
  insert_Tournament(objects: {name: $name, location: $location, start: $start, game: $game, scoring_ruleset_id: $scoring_ruleset_id, creator_name: $creator_name}) {
    returning {
      id
    }
  }
}  
`
const getPreferencesDoc = `
query GetPreferences($user_id: String!) {
  UserPreferences_by_pk(user_id: $user_id) {
    club
    location
    player_name
  }
}`
export default function TournamentEditor(props) {
    const params = useParams()
    const successRef = React.createRef();
    const failureRef = React.createRef();
    const [tournament, setTournament] = useState(new Tournament())
    const [gameOptions, setGameOptions] = useState([])
    const [scoringOptions, setScoringOptions] = useState([])
    const { user, getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState(null);
  
    useEffect(() => {
        if(user){
            let fetchData = async () => {
                let accessToken = await getAccessTokenSilently()
                Query("GetPreferences", getPreferencesDoc, { 
                    user_id: user.sub
                },accessToken)
                .then((response) => {
                  if (response.UserPreferences_by_pk){
                    let {player_name, club} = response.UserPreferences_by_pk
                    setPlayerName(player_name)
                  } else {
                    setPlayerName(user.name)
                  }
                })
            }
            fetchData();
        }
    },[user, getAccessTokenSilently])

    const setTournamentPartial = function(valueKeys){
      setTournament(prevTourn => ({...prevTourn, ...valueKeys}))
    }
    useEffect(() => {
      const fetchData = () => {
        if(tournament.Game && tournament.Game.key){
          Query("ScoringByGame", allScoringDoc, {gameKey:tournament.Game.key})
            .then((data)=> {
              if(data && data.ScoringRuleset){
                setScoringOptions(data.ScoringRuleset.map(g => {return {value:g.id, label:g.name}}))
                // if(!(tournament.Game.key in data.ScoringRuleset.map(g => g.id))){
                //   setTournamentPartial({Game:{id:null}});
                // }
              }
            })
        }
      }
      fetchData();
    }, [tournament.Game])
    // const loadScoringRulesets = function(game){
    //   if(game){
    //     Query("ScoringByGame", allScoringDoc, {gameKey:game})
    //       .then((data)=> {
    //         if(data && data.ScoringRuleset && data.ScoringRuleset.length>0){
    //           setScoringOptions(data.ScoringRuleset.map(g => {return {value:g.id, label:g.name}}))
    //         }
    //       })
    //   }
    // }
    const setGameHandler = function(vlp) { //{value, label}
      setTournamentPartial({Game:{key:vlp.value,value:vlp.label}})
      // loadScoringRulesets(vlp.value)
    }
    const setScoringRulesetHandler = function(vlp) {
      setTournamentPartial({ScoringRuleset:{id:vlp.value,name:vlp.label}})
    }
    useEffect(() => {
      const fetchData = async () => {
        if(params.name){
        const accessToken = await getAccessTokenSilently()
          Query("TournamentByName", operationsDoc, {name:params.name},accessToken)
          .then((data)=> {
              var value = null
              if(data && data.Tournament && data.Tournament.length>0){
                value = data.Tournament[0]
              } else {
                value = new Tournament()
              }
              value.start = Date.parse(value.start)
              setTournament(value)
              return Promise.resolve(value)
          })
        }
        // .then((data) => {
        //   loadScoringRulesets(data.Game.key)
        //   return Promise.resolve()
        // })

        Query("AllGames", allGamesDoc, {})
        .then((data)=> {
          if(data && data.Game && data.Game.length>0){
            setGameOptions(data.Game.map(g => {return {value:g.key, label:g.value}}))
            // if(tournament){
            //   setTournamentPartial({Game:{key:tournament.Game.key}})
            // }
          }
        })
      }
      fetchData();
    },[params.name, getAccessTokenSilently])
    const save = async function(){
      const accessToken = await getAccessTokenSilently()
      if(tournament.id){
        Query("UpdateTournament", updateDoc, {
          name: tournament.name, 
          location: tournament.location, 
          start: new Date(tournament.start).toISOString(), 
          game: tournament.Game?.key, 
          scoring_ruleset_id: tournament.ScoringRuleset?.id, 
          id: tournament.id,
          creator_name: playerName}, accessToken)
        .then((data) => {
            var node = successRef.current;
            if(data.update_Tournament.returning.length === 0){
              node = failureRef.current;
            }
            // node.classList.add('show');
            new Collapse(node)
            // setTimeout(() => node.classList.remove('show'), 2000);
            setTimeout(() => new Collapse(node), 2000);
        });
      } else {
        Query("InsertTournament", insertDoc, {
          name: tournament.name, 
          location: tournament.location, 
          start: new Date(tournament.start).toISOString(), 
          game: tournament.Game?.key, 
          scoring_ruleset_id: tournament.ScoringRuleset?.id,
          creator_name: playerName}, accessToken) //TODO: Get logged in user
        .then((data) => {
            if(data && data.insert_Tournament.returning.length > 0) {
              navigate("/events/"+data.insert_Tournament.returning[0].id)
            }
            var node = successRef.current;
            if(data===undefined || data.insert_Tournament.returning.length === 0){
              node = failureRef.current;
            }
            
            // node.classList.add('show');
            new Collapse(node)
            // setTimeout(() => node.classList.remove('show'), 2000);
            setTimeout(() => new Collapse(node), 2000);
        });
        
      }
    }
    const breadcrumbs = function () {
        return (
            <nav className="" aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/events">Events</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{(tournament && tournament.name) || 'Adding Event...'}</li>
                </ol>
            </nav>
        )
    }
    if(tournament){
      return (
        <>
          {breadcrumbs()}
          <div>
            {/* <div className="mb-3">
                <label htmlFor="idInput" className="form-label">Id</label>
                <input type="text" id="idInput" className="form-control" placeholder="Id" disabled value={tournament.id || ''} />
            </div> */}
            <div className="mb-3">
                <label htmlFor="nameInput" className="form-label">Name</label>
                <input type="text" id="nameInput" className="form-control" placeholder="Name" value={tournament.name || ''} onChange={(e) => setTournamentPartial({name: e.target.value})} />
            </div>
            <div className="mb-3">
                <label htmlFor="dateInput" className="form-label">Date</label>
                <DatePicker selected={tournament.start} onChange={(value) => setTournamentPartial({start: value})} isClearable className="form-control" showPopperArrow={false} />
            </div>
            
            <div className="mb-3">
                <label htmlFor="gameInput" className="form-label">Game</label>
                <Select value={gameOptions.filter(o => o.value === tournament.Game?.key)} onChange={(vl) => setGameHandler(vl)} classNamePrefix="react-select" className="react-select" options={gameOptions}/>
            </div>
            
            <div className="mb-3">
                <label htmlFor="scoringInput" className="form-label">Scoring Ruleset</label>
                <Select value={scoringOptions.filter(o => o.value === tournament.ScoringRuleset?.id)} onChange={(vl) => setScoringRulesetHandler(vl)} classNamePrefix="react-select" className="react-select" options={scoringOptions}/>
            </div>
          </div>
          <div className="d-flex gap-3">
              <button className="btn btn-outline-success" onClick={() => save()}>Save</button>
              <button className="btn btn-outline-danger" onClick={() => window.history.back()}>Cancel</button>
          </div>
          <div ref={successRef} className="alert alert-success collapse mt-3" role="alert">
              Tournament has been updated!
          </div>
          <div ref={failureRef} className="alert alert-danger collapse mt-3" role="alert">
              Creating Tournament failed!
          </div>
        </>
      );
    } else {
      return (
        <>
          {breadcrumbs()}
          <div>Loading...</div>
        </>
      )
    }
}