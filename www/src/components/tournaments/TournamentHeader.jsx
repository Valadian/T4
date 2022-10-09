import { React, useState } from "react";
import format from "date-fns/format";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function TournamentHeader(props) {
  const [showTournamentDateEditor, setShowTournamentDateEditor] =
    useState(false);
  const [
    showTournamentRegistrationEditor,
    setShowTournamentRegistrationEditor,
  ] = useState(false);
  const [
    showTournamentListProtectionEditor,
    setShowTournamentListProtectionEditor,
  ] = useState(false);
  const [showTournamentLocationEditor, setShowTournamentLocationEditor] =
    useState(false);
  const [
    showTournamentLadderProtectionEditor,
    setShowTournamentLadderProtectionEditor,
  ] = useState(false);
  const [showTournamentAdminEditor, setShowTournamentAdminEditor] =
    useState(false);

  var list_visibility = props.tournament.lists_visible ? "visible" : "hidden";
  var list_availability = props.tournament.lists_locked
    ? `Lists ${list_visibility} & locked`
    : `Lists ${list_visibility} & unlocked`;
  var ladder_visibility = props.tournament.ladder_visibility
    ? "Ladder hidden"
    : "Ladder visible";
  var signup_availability = props.tournament.signups_open
    ? "Signups open"
    : "Signups closed";

  return (
    <div>
      <h2 className="">{props.tournament.name || "Fetching Event..."}</h2>
      <h4 className="text-secondary" style={{ fontVariant: ["small-caps"] }}>
        {props.tournament.Game.value || "Fetching Game..."}
      </h4>
      <p className="text-white">{props.tournament.description}</p>
      <Row className="pt-3 small">
        {/* Timezone issue: day of the month off by one depending on tz; 
          need to figure out overall tz approach*/}
        <Col xs={12} md>
          <Row>
            <Col>
              <i className="bi bi-calendar3 text-primary"></i>{" "}
              {format(props.tournament.start, "eeee, dd MMM, yyyy")}
              {/* <TournamentPlayerEditor
                show={this.state.showTournamentPlayerEditor}
                onHide={() => this.handleAddPlayerClose()}
                tournament_id={props.tournament.id}
              /> */}
            </Col>
          </Row>
          <Row>
            <Col>
              <i className="bi bi-globe text-primary"></i>{" "}
              {props.tournament.location}
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          <Row>
            <Col>
              <i className="bi bi-people-fill text-primary"></i>{" "}
              {props.tournament.Ladder_aggregate.aggregate.count}
            </Col>
          </Row>
          <Row>
            <Col>
              <i className="bi bi-person-plus-fill text-primary"></i>{" "}
              {signup_availability}
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          <Row>
            <Col>
              <i className="bi bi-file-text text-primary"></i>{" "}
              {list_availability}
            </Col>
          </Row>
          <Row>
            <Col>
              <i className="bi bi-list-ol text-primary"></i> {ladder_visibility}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="pt-3 pb-s small text-light">
        <Col>
          <i className="bi bi-person-fill text-primary"></i>{" "}
          {props.tournament.Creator.name}
        </Col>
      </Row>
      <hr />
      {/*event picture go here*/}
    </div>
  );
}