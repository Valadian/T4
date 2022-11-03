import { React, useContext } from "react";
import format from "date-fns/format";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { TournamentHomeContext } from "../../pages/tournaments/TournamentHome";

export default function TournamentHeader(props) {
  const { tournament } = useContext(TournamentHomeContext);

  var list_visibility = tournament.lists_visible ? "visible" : "hidden";
  var list_availability = tournament.lists_locked
    ? `Lists ${list_visibility} & locked`
    : `Lists ${list_visibility} & unlocked`;
  var ladder_visibility = tournament.ladder_visibility
    ? "Ladder hidden"
    : "Ladder visible";
  var signup_availability = tournament.signups_open
    ? "Signups open"
    : "Signups closed";

  return (
    <div>
      <h2 className="">{tournament.name || "Fetching Event..."}</h2>
      <h4 className="text-secondary" style={{ fontVariant: ["small-caps"] }}>
        {tournament.Game.value || "Fetching Game..."}
      </h4>
      <p>{tournament.description}</p>
      <Row className="pt-3 small">
        {/* Timezone issue: day of the month off by one depending on tz; 
          need to figure out overall tz approach*/}
        <Col xs={12} md>
          <Row>
            <Col>
              <i className="bi bi-calendar3 text-primary"></i>{" "}
              {tournament.start
                ? format(tournament.start, "eeee, dd MMM, yyyy")
                : ""}
              {/* <TournamentPlayerEditor
                show={this.state.showTournamentPlayerEditor}
                onHide={() => this.handleAddPlayerClose()}
                tournament_id={tournament.id}
              /> */}
            </Col>
          </Row>
          <Row>
            <Col>
              <i className="bi bi-globe text-primary"></i> {tournament.location}
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          <Row>
            <Col>
              <i className="bi bi-people-fill text-primary"></i>{" "}
              {tournament.Ladder_aggregate.aggregate.count}
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
      <Row className="pt-3 pb-s small">
        <Col>
          <i className="bi bi-person-fill text-primary"></i>{" "}
          {tournament.Creator.name}
        </Col>
      </Row>
      <hr />
      {/*event picture go here*/}
    </div>
  );
}
