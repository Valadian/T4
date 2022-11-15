import { React, useState, useContext } from "react";
import format from "date-fns/format";
import { Button } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TournamentAdminEditor from "./TournamentAdminEditor";
import TournamentDateEditor from "./TournamentDateEditor";
import TournamentLadderToggle from "./TournamentLadderToggle";
import TournamentPublicToggle from "./TournamentPublicToggle";
import TournamentListProtectionEditor from "./TournamentListProtectionEditor";
import TournamentLocationEditor from "./TournamentLocationEditor";
import TournamentDescriptionEditor from "./TournamentDescriptionEditor";
import TournamentNameEditor from "./TournamentNameEditor";
import TournamentPlayerEditor from "./TournamentPlayerEditor";
import TournamentRegistrationToggle from "./TournamentRegistrationToggle";
import TournamentDeleteModal from "./TournamentDeleteModal";
import { TournamentHomeContext } from "../../pages/tournaments/TournamentHome";

function TournamentAdminHeader(props) {
  const [showTournamentDateEditor, setShowTournamentDateEditor] =
    useState(false);
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
  const { tournament } = useContext(TournamentHomeContext);


  const [showTournamentDescriptionEditor, setShowTournamentDescriptionEditor] =
    useState(false);
  const [showTournamentNameEditor, setShowTournamentNameEditor] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  var list_visibility = tournament.lists_visible ? "visible" : "hidden";
  var list_availability = tournament.lists_locked
    ? `Lists ${list_visibility} & locked`
    : `Lists ${list_visibility} & unlocked`;
  var ladder_visibility = tournament.ladder_visible
    ? "Ladder visible"
    : "Ladder hidden";
  var public_label = tournament.public
    ? "Public"
    : "Draft";
  var signup_availability = tournament.signups_open
    ? "Signups open"
    : "Signups closed";

  return (
    <div>
      <Row>
        <Col xs={10} md={11} >
          <h2 className="">{tournament.name || "Fetching Event..."}</h2>
        </Col>
        <Col xs={2} md={1}>
          <button className="btn btn-outline-primary" onClick={() => {
                      setShowTournamentNameEditor(true);
                    }} title="Edit Title"><i className="bi bi-pen"></i></button>
                  
          <TournamentNameEditor
            show={showTournamentNameEditor}
            onHide={() => setShowTournamentNameEditor(false)}/>
          
        </Col>
      </Row>
      <h4 className="text-secondary" style={{ fontVariant: ["small-caps"] }}>
        {tournament.Game.value || "Fetching Game..."}
      </h4>
      <Row>
        <Col xs={10} md={11} >
          <p>{tournament.description}</p>
        </Col>
        <Col xs={2} md={1}>
          <button className="btn btn-outline-primary" onClick={() => {
                    setShowTournamentDescriptionEditor(true);
                  }} title="Edit Description"><i className="bi bi-pen"></i></button>
                  
          <TournamentDescriptionEditor
            show={showTournamentDescriptionEditor}
            onHide={() => setShowTournamentDescriptionEditor(false)}
          />
        </Col>
      </Row>
      <Row className="pt-3 small">
        {/* Timezone issue: day of the month may be off by one depending on tz; 
          may have details to iron out on overall tz approach*/}
        <Col xs={12} md>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Start Date */}
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setShowTournamentDateEditor(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-calendar3 text-primary"></i>{" "}
                  <span>
                    {tournament.start
                      ? format(tournament.start, "eeee, dd MMM, yyyy")
                      : "N/A"}
                  </span>
                </Button>
              </div>
              <TournamentDateEditor
                show={showTournamentDateEditor}
                onHide={() => setShowTournamentDateEditor(false)}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Location */}
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setShowTournamentLocationEditor(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-globe text-primary"></i>{" "}
                  <span>{tournament.location}</span>
                </Button>
              </div>
              <TournamentLocationEditor
                show={showTournamentLocationEditor}
                onHide={() => setShowTournamentLocationEditor(false)}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Administrator */}
                <Button
                  variant="outline-secondary"
                  // onClick={() => {
                  //   setShowTournamentAdminEditor(true);
                  // }}
                  size="sm"
                >
                  <i className="bi bi-person-fill text-primary"></i>{" "}
                  <span>{tournament.Creator.name}</span>
                </Button>
              </div>
              <TournamentAdminEditor
                show={showTournamentAdminEditor}
                onHide={() => setShowTournamentAdminEditor(false)}
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
                  variant="outline-secondary"
                  onClick={() => {
                    setShowTournamentPlayerEditor(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-people-fill text-primary"></i>{" "}
                  <span>
                    {tournament.Ladder_aggregate.aggregate.count}
                  </span>
                </Button>
              </div>
              <TournamentPlayerEditor
                show={showTournamentPlayerEditor}
                onHide={() => setShowTournamentPlayerEditor(false)}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-grid">
                {/* Registration Availability: different because it's just a 
                button, not a modal */}
                <TournamentRegistrationToggle
                  button_text={signup_availability}
                />
              </div>
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          {/* <Row>
            <Col>
              <div className="d-grid">
                {/ * List Availability * /}
                <Button
                  variant={tournament.lists_visible?"outline-secondary":"outline-danger"}
                  onClick={() => {
                    setShowTournamentListProtectionEditor(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-file-text text-primary"></i>{" "}
                  <span>{list_availability}</span>
                </Button>
              </div>
              <TournamentListProtectionEditor
                show={showTournamentListProtectionEditor}
                onHide={() => setShowTournamentListProtectionEditor(false)}
              />
            </Col>
          </Row> */}
          <Row>
            <Col>
              <div className="d-grid">
                {/* Ladder Availability: different because it's just a 
                button, not a modal */}
                <TournamentLadderToggle button_text={ladder_visibility} />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-grid">
                <TournamentPublicToggle button_text={public_label} />
              </div>
            </Col>
          </Row>
          {tournament?.Rounds.length===0?<Row>
            <Col>
              <div className="d-grid">
                <Button
                    variant="outline-danger"
                    onClick={() => {
                      setShowDeleteModal(true);
                    }}
                    size="sm"
                  >
                  <i className="bi bi-trash text-danger"></i>{" "}
                  <span>DELETE</span>
                </Button>
              </div>
              <TournamentDeleteModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}/>
            </Col>
          </Row>:<></>}
        </Col>
      </Row>
      <hr />
      {/*event picture go here*/}
    </div>
  );
}

export default TournamentAdminHeader;
