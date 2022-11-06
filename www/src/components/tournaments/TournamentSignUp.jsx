import React, {useState,useContext, useEffect} from "react"
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import { Row, Col, Form, FloatingLabel } from "react-bootstrap";

const signup_doc = `mutation TournamentSignUp($user_id: String!, $tournament_id: uuid!, $club: String = "", $player_name: String = null) {
    insert_TournamentPlayer_one(object: {user_id: $user_id, tournament_id: $tournament_id, club: $club, player_name: $player_name}) {
      id
    }
  }`
const getDoc = `
  query GetPreferences($user_id: String!) {
    UserPreferences_by_pk(user_id: $user_id) {
      club
      location
      player_name
    }
  }`
export default function TournamentSignUp (props) {
    const {tournament, updateTournament, setActiveTab} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();
    const [playerName, setPlayerName] = useState("");
    const [club, setClub] = useState("");
    
    useEffect(() => {
        if(user){
            let fetchData = async () => {
                let accessToken = await getAccessTokenSilently()
                Query("GetPreferences", getDoc, { 
                    user_id: user.sub
                },accessToken)
                .then((response) => {
                    let {player_name, club} = response.UserPreferences_by_pk
                    setPlayerName(player_name??user.name)
                    setClub(club??"")
                })
            }
            fetchData();
        }
    },[user, getAccessTokenSilently])

    const addUserToLadder = async () => {
        var accessToken = await getAccessTokenSilently()
        Query("TournamentSignUp", signup_doc, {
            user_id: user.sub,
            player_name: playerName,
            tournament_id: tournament.id,
            club: club
        },accessToken)
        .then((response) => {
            updateTournament()
            setActiveTab("ladder")
        })
    }

    return (
        <div className="card">
        <div className="card-header">Preferences</div>
        <div className="card-body">

          <Row>
            <Col className="mb-3">
              <FloatingLabel
                controlId="nameOverride"
                label="Player Name"
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
                label="Club"
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
          <Row>
            <div>
                <button className="btn btn-outline-success" onClick={addUserToLadder}>Register for Tournament </button>
            </div>
          </Row>
        </div>
      </div>
    )
}