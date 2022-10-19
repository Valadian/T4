import React, { useState, useEffect, useRef, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import TournamentPlayerSummary from "./TournamentPlayerSummary";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

export default function Ladder(props) {
    const {ladder, updateTournament, isOwner} = useContext(TournamentHomeContext);
    if (ladder) {
      //console.log("Got past the state check...");
      return (
        <div>
          <Row className="pb-1 header mb-3">
            <Col>Player</Col>
            <Col>Rank</Col>
            <Col>W/L</Col>
            <Col>TP</Col>
            <Col>MoV/SoS</Col>
            <Col>Club</Col>
          </Row>
          {ladder.map((player) => (
            <TournamentPlayerSummary key={player.id} player={player} />
          ))}
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
}