import React from "react";
import format from "date-fns/format"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function TournamentHeader(props) {
  
  let list_visibility, list_availability, ladder_visibility, signup_availability
  
  if (props.tournament.lists_visible) {
    list_visibility = "visible"
  } else {
    list_visibility = "hidden"
  }

  if (props.tournament.lists_locked) {
    list_availability = `Lists ${list_visibility} & locked`
  } else {
    list_availability = `Lists ${list_visibility} & unlocked`
  }

  if (props.tournament.ladder_visibility) {
    ladder_visibility = "Ladder hidden"
  } else {
    ladder_visibility = "Ladder visible"
  }

  if (props.tournament.signups_open) {
    signup_availability = "Signups open"
  } else {
    signup_availability = "Signups closed"
  }

  return (
    <div>
      <h1 className="text-light">
        {props.tournament.name || "Fetching Event..."}
      </h1>
      <h3 className="text-secondary">
        {props.tournament.Game.value || "Fetching Game..."}
      </h3>
      <p>{props.tournament.description}</p>
      <Container>
        <Row className="pt-3">
          {/* Timezone issue: day of the month off by one depending on tz */}
          <Col xs={3}><i className="bi bi-calendar3"></i> {format(props.tournament.start,'eeee, dd MMM, yyyy')}</Col>
          <Col xs={3}><i className="bi bi-person-fill"></i> {props.tournament.Creator.name}</Col>
          <Col xs={6}><i className="bi bi-globe"></i> {props.tournament.location}</Col>
        </Row>
        <Row className="pt-2 pb-3">
          <Col><i className="bi bi-file-text"></i> {list_availability}</Col>
          <Col><i className="bi bi-list-ol"></i> {ladder_visibility}</Col>
          <Col><i className="bi bi-people-fill"></i> {props.tournament.Ladder_aggregate.aggregate.count}</Col>
          <Col><i className="bi bi-person-plus-fill"></i> {signup_availability}</Col>
        </Row>
      </Container>
      <hr/>
    </div>
  );
}

export default TournamentHeader;
