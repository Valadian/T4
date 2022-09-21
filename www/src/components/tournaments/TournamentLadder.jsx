import React from "react";
import Query from "../../data/T4GraphContext";
import TournamentPlayerSummary from "./TournamentPlayerSummary";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";

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

class Ladder extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tournamentPlayers: false };
  }

  componentDidMount() {
    this.getTournamentPlayers();
  }

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) {
      this.getTournamentPlayers();
    }
  }

  getTournamentPlayers() {
    if (!this.state) {
      console.log("Aborting GetTournamentPlayers... no this.state.");
      return;
    }

    Query("AllTournamentPlayers", tournamentPlayersDoc, {
      tournament_id: this.props.tournament.id,
    }).then((response) =>
      this.setState({ tournamentPlayers: response.TournamentPlayer })
    );
  }

  render() {
    if (this.state && this.state.tournamentPlayers) {
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
          {this.state.tournamentPlayers.map((player) => (
            <TournamentPlayerSummary key={player.id} player={player} />
          ))}
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}

export default Ladder;
