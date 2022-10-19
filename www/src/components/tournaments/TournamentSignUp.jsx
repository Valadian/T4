import React, {useState,useEffect,useContext} from "react"
import {Tab} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const signup_doc = `mutation TournamentSignUp($user_id: String!, $tournament_id: uuid!, $club: String = "") {
    insert_TournamentPlayer_one(object: {user_id: $user_id, tournament_id: $tournament_id, club: $club}) {
      id
    }
  }`
export default function TournamentSignUp (props) {
    const {rounds, ladder, tournament, updateTournament, isOwner, setActiveTab} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();
    const [club, setClub] = useState("");

    const addUserToLadder = async () => {
        var accessToken = await getAccessTokenSilently()
        Query("TournamentSignUp", signup_doc, {
            user_id: user.sub,
            tournament_id: tournament.id,
            club: club
        },accessToken)
        .then((response) => {
            updateTournament()
            setActiveTab("ladder")
        })
    }

    return (
    <a className="btn btn-outline-success" onClick={addUserToLadder}>Register for Tournament </a>
    )
}