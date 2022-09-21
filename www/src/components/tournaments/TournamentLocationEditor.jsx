import React from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const updateTournamentLocationDoc = `
  mutation updateTournamentLocation($location: String = "", $tournament_id: uuid = "") {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {location: $location}) {
      returning {
        name
        location
      }
    }
  }
`;

class TournamentLocationEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new_tournament_location: "",
    };
  }

  updateTournamentLocation = () => {
    if (!this.state || !this.state.new_tournament_location) {
      return;
    }

    Query("updateTournamentLocation", updateTournamentLocationDoc, {
      location: this.state.new_tournament_location,
      tournament_id: this.props.tournament.id,
    })
      .then(() => {
        this.props.update_tournament();
      })
      .then(() => {
        this.setState({ new_tournament_location: "" });
      });
    this.props.onHide();
    // TODO: insert a "success" toast
  };

  handleDateUpdate = (event) => {
    this.setState({ new_tournament_location: event.target.value });
  };

  handleClose = () => {
    this.props.show = false;
  };

  render() {
    if (this.props) {
      return (
        <Modal
          onHide={this.props.onHide}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={this.props.show}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Change Event Location
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Form.Group
                  as={Col}
                  controlId="formEventLocation"
                  xs={{ span: 8, offset: 2 }}
                >
                  <FloatingLabel
                    controlId="eventLocation"
                    label="Event Location"
                    className="mb-3"
                  >
                    <Form.Control
                      type="text"
                      placeholder="f"
                      required
                      onChange={this.handleDateUpdate}
                      value={this.state.new_tournament_location}
                      autoFocus
                    />
                  </FloatingLabel>
                </Form.Group>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.updateTournamentLocation}>Ok</Button>
            <Button onClick={this.props.onHide}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      );
    } else {
      return (
        <>
          <div>Loading...</div>
        </>
      );
    }
  }
}
export default TournamentLocationEditor;
