import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TournamentPlayerEditor from "./TournamentPlayerEditor";

class TournamentControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showTournamentPlayerEditor: false };
  }

  handleAddPlayerClick() {
    this.setState({ showTournamentPlayerEditor: true });
  }

  handleAddPlayerClose() {
    this.setState({ showTournamentPlayerEditor: false });
  }

  render() {
    console.log(JSON.stringify(this.state));
    return (
      <>
        <Row>
          <Col>
            <div className="d-grid">
              <Button
                variant="primary"
                size="sm"
                onClick={() => this.handleAddPlayerClick()}
              >
                Add Player
              </Button>
              <TournamentPlayerEditor
                show={this.state.showTournamentPlayerEditor}
                onHide={() => this.handleAddPlayerClose()}
              />
            </div>
          </Col>
          <Col>
            <div className="d-grid">
              <Button variant="primary" size="sm">
                Create Matches
              </Button>
            </div>
          </Col>
          <Col>
            <div className="d-grid">
              <Button variant="primary" size="sm">
                Edit Event
              </Button>
            </div>
          </Col>
          <Col>
            <div className="d-grid">
              <Button variant="primary" size="sm">
                Advanced Settings
              </Button>
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

export default TournamentControlPanel;
