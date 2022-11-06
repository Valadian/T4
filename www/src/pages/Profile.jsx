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
const getDoc = `
query GetPreferences($user_id: String!) {
  UserPreferences_by_pk(user_id: $user_id) {
    club
    location
    player_name
  }
}`
const Profile = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const { name, picture, email } = user;
  const [ playerName, setPlayerName ] = useState("")
  const [ club, setClub ] = useState("")
  const [ location, setLocation ] = useState("")
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
          <Row>
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
            {/* <pre className="col-12 p-4">
              {JSON.stringify(user, null, 2)}
            </pre> */}
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