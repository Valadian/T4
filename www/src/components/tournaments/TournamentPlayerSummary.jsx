import React, { useState, useEffect } from "react";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import TournamentPlayerName from "./TournamentPlayerName"

export default function TournamentPlayerSummary(props) {
    const { user, getAccessTokenSilently } = useAuth0();
    //console.log(JSON.stringify(props));

    return (
      <Row>
        <Col><TournamentPlayerName player={props.player} /></Col>
        <Col>{props.player.rank}</Col>
        <Col>{props.player.win} / {props.player.loss}</Col>
        <Col>{props.player.tournament_points}</Col>
        <Col>{props.player.mov} / {props.player.sos}</Col>
        <Col>{props.player.club}</Col>
      </Row>
    );
}