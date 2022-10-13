import { React, useState } from "react";
import format from "date-fns/format";
import { Button } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TournamentAdminEditor from "./TournamentAdminEditor";
import TournamentDateEditor from "./TournamentDateEditor";
import TournamentLadderToggle from "./TournamentLadderToggle";
import TournamentListProtectionEditor from "./TournamentListProtectionEditor";
import TournamentLocationEditor from "./TournamentLocationEditor";
import TournamentPlayerEditor from "./TournamentPlayerEditor";
import TournamentRegistrationToggle from "./TournamentRegistrationToggle";

function TournamentAdminHeader(props) {
  const [
    showTournamentDateEditor, 
    setShowTournamentDateEditor
  ] = useState(false);
  // const [
  //   showTournamentRegistrationEditor,
  //   setShowTournamentRegistrationEditor,
  // ] = useState(false);
  const [
    showTournamentListProtectionEditor,
    setShowTournamentListProtectionEditor,
  ] = useState(false);
  const [showTournamentLocationEditor, setShowTournamentLocationEditor] =
    useState(false);
  // const [
  //   showTournamentLadderProtectionEditor,
  //   setShowTournamentLadderProtectionEditor,
  // ] = useState(false);
  const [showTournamentAdminEditor, setShowTournamentAdminEditor] =
    useState(false);
  const [showTournamentPlayerEditor, setShowTournamentPlayerEditor] =
    useState(false);

  var list_visibility = props.tournament.lists_visible ? "visible" : "hidden";
  var list_availability = props.tournament.lists_locked
    ? `Lists ${list_visibility} & locked`
    : `Lists ${list_visibility} & unlocked`;
  var ladder_visibility = props.tournament.ladder_visible
    ? "Ladder visible"
    : "Ladder hidden";
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
        {/* Timezone issue: day of the month may be off by one depending on tz; 
          may have details to iron out on overall tz approach*/}
        <Col xs={12} md>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Start Date */}
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setShowTournamentDateEditor(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-calendar3 text-primary"></i>{" "}
                  <span className="text-white">
                    {props.tournament.start ? format(props.tournament.start, "eeee, dd MMM, yyyy") : "N/A"}
                  </span>
                </Button>
              </div>
              <TournamentDateEditor
                show={showTournamentDateEditor}
                onHide={() => setShowTournamentDateEditor(false)}
                tournament={props.tournament}
                update_tournament={props.update_tournament}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Location */}
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setShowTournamentLocationEditor(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-globe text-primary"></i>{" "}
                  <span className="text-white">
                    {props.tournament.location}
                  </span>
                </Button>
              </div>
              <TournamentLocationEditor
                show={showTournamentLocationEditor}
                onHide={() => setShowTournamentLocationEditor(false)}
                tournament={props.tournament}
                update_tournament={props.update_tournament}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Players Registered */}
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setShowTournamentPlayerEditor(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-people-fill text-primary"></i>{" "}
                  <span className="text-white">
                    {props.tournament.Ladder_aggregate.aggregate.count}
                  </span>
                </Button>
              </div>
              <TournamentPlayerEditor
                show={showTournamentPlayerEditor}
                onHide={() => setShowTournamentPlayerEditor(false)}
                tournament={props.tournament}
                update_tournament={props.update_tournament}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Registration Availability: different because it's just a 
                button, not a modal */}
                <TournamentRegistrationToggle
                  tournament={props.tournament}
                  update_tournament={props.update_tournament}
                  button_text={signup_availability}
                />
              </div>
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          <Row>
            <Col>
              <div className="d-grid">
                {/* List Availability */}
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setShowTournamentListProtectionEditor(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-file-text text-primary"></i>{" "}
                  <span className="text-white">{list_availability}</span>
                </Button>
              </div>
              <TournamentListProtectionEditor
                show={showTournamentListProtectionEditor}
                onHide={() => setShowTournamentListProtectionEditor(false)}
                tournament={props.tournament}
                update_tournament={props.update_tournament}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Ladder Availability: different because it's just a 
                button, not a modal */}
                <TournamentLadderToggle
                  tournament={props.tournament}
                  update_tournament={props.update_tournament}
                  button_text={ladder_visibility}
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="pt-3 pb-s small text-light">
        <Col xs={12} md={6}>
          <div className="d-grid">
            {/* Administrator */}
            <Button
              variant="outline-primary"
              onClick={() => {
                setShowTournamentAdminEditor(true);
              }}
              size="sm"
            >
              <i className="bi bi-person-fill text-primary"></i>{" "}
              <span className="text-white">
                {props.tournament.Creator.name}
              </span>
            </Button>
          </div>
          <TournamentAdminEditor
            show={showTournamentAdminEditor}
            onHide={() => setShowTournamentAdminEditor(false)}
            tournament={props.tournament}
            update_tournament={props.update_tournament}
          />
        </Col>
      </Row>
      <hr />
      {/*event picture go here*/}
    </div>
  );
}

export default TournamentAdminHeader;