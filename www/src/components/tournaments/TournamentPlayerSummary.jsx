import React from "react";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";

class TournamentPlayerSummary extends React.Component {
  constructor(props) {
    super(props);
    console.log(JSON.stringify(props));
  }

  render() {
    return (
      <Row>
        {console.log(this.props.player.player_name)}
        <Col>{this.props.player.player_name}</Col>
        <Col>{this.props.player.rank}</Col>
        <Col>{this.props.player.tournament_points}</Col>
        <Col>{this.props.player.mov}</Col>
        <Col>{this.props.player.win}</Col>
        <Col>{this.props.player.loss}</Col>
        <Col>{this.props.player.club}</Col>
      </Row>
    );
  }
}
export default TournamentPlayerSummary;
