import React, { useState, useEffect } from "react";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";

export default function TournamentPlayerSummary(props) {
    console.log(JSON.stringify(props));

    return (
      <Row>
        {console.log(props.player.player_name)}
        <Col>{props.player.player_name}</Col>
        <Col>{props.player.rank}</Col>
        <Col>{props.player.tournament_points}</Col>
        <Col>{props.player.mov}</Col>
        <Col>{props.player.win}</Col>
        <Col>{props.player.loss}</Col>
        <Col>{props.player.club}</Col>
      </Row>
    );
}