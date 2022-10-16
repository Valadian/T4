import React, { useState, useEffect, useRef } from "react";
import Query from "../../data/T4GraphContext";
import TournamentPlayerSummary from "./TournamentPlayerSummary";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

export default function Ladder(props) {
    if (props.Ladder) {
      console.log("Got past the state check...");
      return (
        <div>
          <Row className="pb-1 header mb-3">
            <Col>Player</Col>
            <Col>Rank</Col>
            <Col>W/L</Col>
            <Col>TP</Col>
            <Col>MoV</Col>
            <Col>Club</Col>
          </Row>
          {props.Ladder.map((player) => (
            <TournamentPlayerSummary key={player.id} player={player} />
          ))}
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
}