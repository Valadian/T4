import React from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const updateTournamentDateDoc = `
mutation updateTournamentPlayerByName($tournament_id: uuid = "", $player_name: String = "", $player_club: String = "") {
  insert_TournamentPlayer(objects: {tournament_id: $tournament_id, player_name: $player_name, club: $player_club}) {
    returning {
      player_name
      Tournament {
        name
      }
      id
    }
  }
}`;

class TournamentAdminEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new_tournament_date: "",
    };
  }

  updateTournamentDate(start_date) {
    Query("updateTournamentDate", updateTournamentDateDoc, {
      start_date: start_date,
      tournament_id: this.props.tournament.id,
    }).then((data) => this.setState({ new_tournament_date: data.start }));
  }

  updateTournamentPlayerByName = () => {
    if (!this.state || !this.state.new_tournament_date) {
      return;
    }

    const new_tournament_date = this.state.new_tournament_date;
    const id = this.props.tournament.id;

    console.log(`New start date: ${new_tournament_date}`);
    console.log(`Tournament id: ${id}`);

    Query("updateTournamentDate", updateTournamentDateDoc, {
      start_date: new_tournament_date,
      tournament_id: id,
    }).then((data) =>
      // TODO: insert a "success" toast
      this.setState({ new_tournament_date: data.start })
    );
  };

  handleDateUpdate = (event) => {
    console.log(event.target.value);
    this.setState({ new_tournament_date: event.target.value });
  };

  handleClose = () => {
    this.props.show = false;
  };

  render() {
    if (this.props) {
      return (
        <Modal
          {...this.props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={this.props.show}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Change Event Administrators
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Form.Group
                  as={Col}
                  controlId="formPlayerName"
                  xs={{ span: 7 }}
                >
                  <FloatingLabel
                    controlId="playerName"
                    label="Player Name"
                    className="mb-3"
                    style={{}}
                  >
                    <Form.Control
                      type="text"
                      placeholder="f"
                      required
                      onChange={this.handlePlayerNameUpdate}
                      value={this.state.new_player_name}
                      autoFocus
                    />
                  </FloatingLabel>
                </Form.Group>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.updateTournamentPlayerByName}>Add</Button>
            <Button onClick={this.props.onHide}>Close</Button>
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
export default TournamentAdminEditor;
