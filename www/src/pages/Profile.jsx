import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Query from "../data/T4GraphContext";
import LogoutButton from "../auth/LogoutButton";
import { Row, Col, Form, FloatingLabel } from "react-bootstrap";

const updateDoc = `
mutation UpdateUserPreferences($user_id: String!, $club: String = null, $location: String = null, $player_name: String = null) {
  insert_UserPreferences_one(object: {}, on_conflict: {constraint: UserPreferences_pkey, update_columns: []}) {
    user_id
  }
  update_UserPreferences_by_pk(pk_columns: {user_id: $user_id}, _set: {club: $club, location: $location, player_name: $player_name}) {
    club
    location
    player_name
  }
}
`
const deleteGamePreference = `
mutation DeleteGamePreference($user_id: String!, $game: Game_enum!) {
  delete_UserGamePreferences(where: {user_id: {_eq: $user_id}, game: {_eq: $game}}) {
    affected_rows
  }
}
`
const addGamePreference = `
mutation AddGamePreference($user_id: String!, $game: Game_enum!) {
  insert_UserGamePreferences_one(object: {game: $game, user_id: $user_id}) {
    id
  }
}
`
const getDoc = `
query GetPreferences($user_id: String!) {
  UserPreferences_by_pk(user_id: $user_id) {
    club
    location
    player_name
  }
  UserGamePreferences(where: {user_id: {_eq: $user_id}}) {
    game
  }
  Game {
    key
    value
  }
}`
const Profile = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const { name, picture, email } = user;
  const [ playerName, setPlayerName ] = useState("")
  const [ club, setClub ] = useState("")
  const [ location, setLocation ] = useState("")
  const [ gamePreferences, setGamePreferences] = useState([])
  const [ games, setGames] = useState([])
  useEffect(() => {
    let fetchData = async () => {
      let accessToken = await getAccessTokenSilently()
      Query("GetPreferences", getDoc, { 
        user_id: user.sub
      },accessToken)
      .then((response) => {
        let {player_name, club, location} = response.UserPreferences_by_pk
        setPlayerName(player_name??"")
        setClub(club??"")
        setLocation(location??"")
        setGamePreferences((response.UserGamePreferences?.map(ugp => ugp.game))??[])
        setGames(response.Game)
      })
    }
    fetchData();
  },[user.sub, getAccessTokenSilently])
  const Save = async () => {
    let accessToken = await getAccessTokenSilently()
    Query("UpdateUserPreferences", updateDoc, { 
      user_id: user.sub,
      player_name: playerName===""?null:playerName,
      club: club===""?null:club,
      location: location===""?null:location,
    },accessToken)
      .then((response) => {
        console.log(response)
      })
    for(var game of games){
      if(gamePreferences.includes(game.key)){
        Query("AddGamePreference", addGamePreference, { 
          user_id: user.sub,
          game: game.key,
        },accessToken)
      } else {
        Query("DeleteGamePreference", deleteGamePreference, { 
          user_id: user.sub,
          game: game.key,
        },accessToken)
      }
    }
  }
  const setGamePreference = (key, value) => {
    if(value){
      setGamePreferences(gamePreferences.filter(v => v!==key).concat([key]))
    } else {
      setGamePreferences(gamePreferences.filter(v => v!==key))
    }
  }
  return (
    <div>
      <div className="row align-items-center profile-header">
        <div className="col-md-2 mb-3">
          <img
            src={picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </div>
        <div className="col-md text-center text-md-left">
          <h2>{name}</h2>
          <p className="lead text-muted">{email}</p>
        </div>
        <div className="col-md-2">
            <LogoutButton />
        </div>
      </div>
      <div className="card">
        <div className="card-header">Preferences</div>
        <div className="card-body">

          <Row>
            <Col className="mb-3">
              <FloatingLabel
                controlId="nameOverride"
                label="Default Player Name"
              >
                <Form.Control
                  type="text"
                  placeholder="f"
                  required
                  onChange={(event) => setPlayerName(event.target.value)}
                  value={playerName}
                  autoFocus
                />
              </FloatingLabel>
            </Col>
          </Row>
          <Row>
            <Col className="mb-3">
              <FloatingLabel
                controlId="nameOverride"
                label="Default Club"
              >
                <Form.Control
                  type="text"
                  placeholder="f"
                  required
                  onChange={(event) => setClub(event.target.value)}
                  value={club}
                  autoFocus
                />
              </FloatingLabel>
            </Col>
          </Row>
          {/* <Row>
            <Col className="mb-3">
              <FloatingLabel
                controlId="nameOverride"
                label="Default Search Location"
              >
                <Form.Control
                  type="text"
                  placeholder="f"
                  required
                  onChange={(event) => setLocation(event.target.value)}
                  value={location}
                  autoFocus
                />
              </FloatingLabel>
            </Col>
          </Row> */}
          <Row>
            <Col className="mb-3">
              <div className="card">
                <div className="card-header">Preferred Games</div>
                <div className="card-body">
                  {games.map(g => <div key={g.key} className="input-group mb-3">
                    {/* <button className="btn btn-sm btn-outline-success" onClick={() => setGamePreference(g.key, true)}><i class="bi bi-plus"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setGamePreference(g.key, false)}><i class="bi bi-dash"></i></button> */}
                    <div className="input-group-text">
                      <input className="form-check-input mt-0" onChange={(event) => setGamePreference(g.key,event.target.checked)} checked={gamePreferences.includes(g.key)} type="checkbox" aria-label="Checkbox for following text input"/>
                    </div>
                    <input type="text" className={"form-control "+(gamePreferences.includes(g.key)?"text-success":"text-muted")} readOnly={true} value={g.value} aria-label="Text input with checkbox"/>
                  </div>)}
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <div>
            <button className="btn btn-outline-success" onClick={Save}>Save</button>
            </div>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Profile;