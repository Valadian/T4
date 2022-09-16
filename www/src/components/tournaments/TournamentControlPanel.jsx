import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function TournamentControlPanel(props) {
  return (
    <Row>
      <Col>
        <div className="d-grid">
          <Button variant="primary" size="sm">Add Player</Button>
        </div>
      </Col>
      <Col>
        <div className="d-grid">
          <Button variant="primary" size="sm">Create Matches</Button>
        </div>
      </Col>
      <Col>
        <div className="d-grid">
          <Button variant="primary" size="sm">Edit Event</Button>
        </div>
      </Col>
      <Col>
        <div className="d-grid">
          <Button variant="primary" size="sm">Advanced Settings</Button>
        </div>
      </Col>
    </Row>
  );
}

export default TournamentControlPanel;
