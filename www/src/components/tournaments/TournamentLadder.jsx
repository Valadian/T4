import React, { useState, useEffect, useRef } from "react";
import Query from "../../data/T4GraphContext";
import TournamentPlayerSummary from "./TournamentPlayerSummary";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

const tournamentPlayersDoc = `
query AllTournamentPlayers($tournament_id: uuid = "") {
  TournamentPlayer(where: {Tournament: {id: {_eq: $tournament_id}}}) {
    player_list_id
    rank
    player_name
    mov
    loss
    win
    tournament_points
    sos
    club
    group
    id
    tournament_id
    user_id
    User {
      name
    }
  }
}
`;

export default function Ladder(props) {
    const [tournamentPlayers, setTournamentPlayers] = useState([]);
    const { getAccessTokenSilently } = useAuth0();
    const {filter } = props
    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
          ref.current = value;
        });
        return ref.current;
    }
    const prevProps = usePrevious({filter});
    useEffect(() => {
        getTournamentPlayers();
    },[])

    useEffect(() => {
        if (prevProps == undefined || props.filter !== prevProps.filter) {
            getTournamentPlayers();
        }
    },[props, prevProps])

  const getTournamentPlayers = async () => {
    const accessToken = await getAccessTokenSilently()
    if (!tournamentPlayers) {
      console.log("Aborting GetTournamentPlayers... no tournamentPlayers.");
      return;
    }

    Query("AllTournamentPlayers", tournamentPlayersDoc, {
      tournament_id: props.tournament.id,
    },accessToken).then((response) =>
        setTournamentPlayers(response.TournamentPlayer)
    );
  }

    if (tournamentPlayers) {
      console.log("Got past the state check...");
      return (
        <div>
          <Row className="pb-3">
            <Col>Player</Col>
            <Col>Rank</Col>
            <Col>TP</Col>
            <Col>MoV</Col>
            <Col>Wins</Col>
            <Col>Losses</Col>
            <Col>Club</Col>
          </Row>
          {tournamentPlayers.map((player) => (
            <TournamentPlayerSummary key={player.id} player={player} />
          ))}
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
}